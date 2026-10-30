// ponytail: regex parse of the command; subshells, aliases and env-var indirection slip through. It is a seatbelt, not a sandbox.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdictPath } from '../scripts/write-verdict.mjs';

const unquote = (s) => s.replace(/^(['"])(.*)\1$/, '$2');

// git top-level of `dir`, or null if it is not inside a git repo
function topOf(dir) {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim() || null;
  } catch {
    return null;
  }
}

const expand = (d) => d.replace(/^(?:~|\$HOME|\$\{HOME\})(?=\/|$)/, os.homedir());

// the operation's own `git -C <dir>`, then a leading `cd <dir> &&`, then cwd
export function targetRepo(command, cwd, dashC) {
  const raw = dashC ?? command.match(/^\s*cd\s+(\S+)\s*&&/)?.[1];
  if (raw) {
    const dir = path.resolve(cwd, expand(unquote(raw)));
    // an existing non-repo dir is outside git; a missing dir falls back to cwd rather than slipping through
    if (fs.existsSync(dir)) return topOf(dir);
  }
  return topOf(cwd);
}

// missing, unreadable, invalid or out-of-range config -> 1. Read from the main checkout so a worktree shares its level.
export function trustLevel(repoTop) {
  try {
    const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: repoTop, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const { trust } = JSON.parse(fs.readFileSync(path.join(path.dirname(common), '.claude', 'jb.local.json'), 'utf8'));
    return trust === 0 || trust === 1 || trust === 2 ? trust : 1;
  } catch {
    return 1;
  }
}

// ponytail: the verdict file is not signed; an agent could forge it. The hook catches staleness, not fraud.
export function checkVerdict(repoTop) {
  const no = (reason) => ({ ok: false, reason: `jbstack verdict: ${reason}` });
  let upstream;
  try {
    upstream = execFileSync('git', ['rev-parse', '@{upstream}^{tree}'], { cwd: repoTop, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return no('no upstream branch to compare against; push first (git push -u origin HEAD), then run the critic.');
  }
  let v;
  try {
    v = JSON.parse(fs.readFileSync(verdictPath(repoTop), 'utf8'));
  } catch {
    return no('no verdict found; run the critic on the pushed commit, then retry gh pr create.');
  }
  if (!v || typeof v !== 'object' || Array.isArray(v))
    return no('verdict file is malformed (not a JSON object); run the critic again to rewrite it.');
  if (v.result !== 'PASS') return no('last verdict is FAIL; fix the findings, push, and run the critic again.');
  if (v.tree !== upstream) return no('verdict is stale (it covers a different tree than the pushed branch); run the critic again on the pushed commit.');
  return { ok: true };
}

const TRUST_FILE = /(^|[\\/])\.claude[\\/]jb\.local\.json$/;
const OWNER_ONLY = 'The trust level is set by the repo owner. Report instead of retrying.';
const protect = () => ({ allow: false, reason: `jbstack trust: the trust configuration is not yours to change. ${OWNER_ONLY}` });

// Write/Edit/MultiEdit/NotebookEdit: only the trust file is guarded
export function decideFileWrite({ filePath }) {
  return typeof filePath === 'string' && TRUST_FILE.test(path.normalize(filePath)) ? protect() : { allow: true };
}

// `git [global options] commit|push`; group 1 holds the options, so a -C elsewhere on the line is not this command's
const GIT_OP = /\bgit((?:\s+(?:-[Cc]\s+\S+|--(?:git-dir|work-tree|namespace)\s+\S+|-\S+))*)\s+(commit|push)\b/g;

export function decide({ command, cwd }) {
  // ponytail: blocks any command that mentions the file (grep, commit messages); accepted false positive. Read and Grep tools are unaffected.
  if (command.includes('jb.local.json')) return protect();
  const ops = [...command.matchAll(GIT_OP)].map((m) => ({
    what: `git ${m[2]}`,
    need: m[2] === 'commit' ? 1 : 2,
    dashC: m[1].match(/(?:^|\s)-C\s+(\S+)/)?.[1],
  }));
  if (/\bgh\s+pr\s+(?:create|new)\b/.test(command)) ops.push({ what: 'gh pr create', need: 2, pr: true });
  for (const op of ops) {
    const repo = targetRepo(command, cwd, op.dashC);
    if (!repo) continue;
    const level = trustLevel(repo);
    if (level < op.need)
      return {
        allow: false,
        reason: `jbstack trust: ${op.what} is blocked in ${repo} at trust level ${level} (needs level ${op.need}+). ${OWNER_ONLY}`,
      };
    if (op.pr) {
      const v = checkVerdict(repo);
      if (!v.ok) return { allow: false, reason: v.reason };
    }
  }
  return { allow: true };
}

function main() {
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    process.exit(0); // unparseable hook input: do not wedge the session
  }
  const ti = input?.tool_input;
  let d = { allow: true };
  if (typeof ti?.command === 'string') d = decide({ command: ti.command, cwd: input.cwd || process.cwd() });
  else if (/^(Write|Edit|MultiEdit|NotebookEdit)$/.test(input?.tool_name)) d = decideFileWrite({ filePath: ti?.file_path ?? ti?.notebook_path });
  if (d.allow) process.exit(0);
  process.stderr.write(d.reason + '\n');
  process.exit(2);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
