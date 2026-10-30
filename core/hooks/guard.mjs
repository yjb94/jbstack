// ponytail: regex parse of the command; subshells, aliases and env-var indirection slip through. It is a seatbelt, not a sandbox.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

// first `git -C <dir>`, then a leading `cd <dir> &&`, then cwd
export function targetRepo(command, cwd) {
  const c = command.match(/\bgit\s+-C\s+(\S+)/);
  const cd = command.match(/^\s*cd\s+(\S+)\s*&&/);
  const dir = c ? unquote(c[1]) : cd ? unquote(cd[1]) : '.';
  return topOf(path.resolve(cwd, dir));
}

// missing, unreadable, invalid or out-of-range config -> 1
export function trustLevel(repoTop) {
  try {
    const { trust } = JSON.parse(fs.readFileSync(path.join(repoTop, '.claude', 'jb.local.json'), 'utf8'));
    return trust === 0 || trust === 1 || trust === 2 ? trust : 1;
  } catch {
    return 1;
  }
}

export function decide({ command, cwd }) {
  const commit = /\bgit\s+(?:-C\s+\S+\s+)?commit\b/.test(command);
  const push = /\bgit\s+(?:-C\s+\S+\s+)?push\b/.test(command);
  const pr = /\bgh\s+pr\s+create\b/.test(command);
  if (!commit && !push && !pr) return { allow: true };
  const repo = targetRepo(command, cwd);
  if (!repo) return { allow: true };
  const level = trustLevel(repo);
  const block = (what, need) => ({
    allow: false,
    reason: `jbstack trust: ${what} is blocked in ${repo} at trust level ${level} (needs level ${need}+). Set {"trust":${need}} in ${path.join(repo, '.claude', 'jb.local.json')} to allow it.`,
  });
  if (commit && level < 1) return block('git commit', 1);
  if (push && level < 2) return block('git push', 2);
  if (pr && level < 2) return block('gh pr create', 2);
  // Task 7: at level 2, gh pr create must also pass checkVerdict(repo) here
  return { allow: true };
}

function main() {
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    process.exit(0); // unparseable hook input: do not wedge the session
  }
  const command = input?.tool_input?.command;
  if (typeof command !== 'string') process.exit(0);
  const d = decide({ command, cwd: input.cwd || process.cwd() });
  if (d.allow) process.exit(0);
  process.stderr.write(d.reason + '\n');
  process.exit(2);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
