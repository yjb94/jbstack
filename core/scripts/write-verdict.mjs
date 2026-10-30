import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const git = (cwd, ...a) => execFileSync('git', a, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

// <git-dir>/jb/verdict.json; the git dir is per worktree
export const verdictPath = (cwd) => path.join(git(cwd, 'rev-parse', '--absolute-git-dir'), 'jb', 'verdict.json');

export function writeVerdict({ cwd, result, inconclusive, criteria }) {
  if (result !== 'PASS' && result !== 'FAIL') throw new Error('--result must be PASS or FAIL');
  if (!fs.existsSync(criteria)) throw new Error(`criteria file not found: ${criteria}`);
  if (git(cwd, 'status', '--porcelain')) throw new Error('working tree is dirty: commit or stash before writing a verdict');
  const file = verdictPath(cwd);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const verdict = { result, tree: git(cwd, 'rev-parse', 'HEAD^{tree}'), inconclusive, criteria, at: new Date().toISOString() };
  fs.writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  return file;
}

function main() {
  try {
    const a = process.argv.slice(2);
    const result = { inconclusive: [] };
    for (let i = 0; i < a.length; i += 2) {
      const v = a[i + 1];
      if (v === undefined) throw new Error(`missing value for ${a[i]}`);
      if (a[i] === '--result') result.result = v;
      else if (a[i] === '--criteria') result.criteria = v;
      else if (a[i] === '--inconclusive') result.inconclusive.push(v);
      else throw new Error(`unknown argument ${a[i]}`);
    }
    if (result.criteria === undefined) throw new Error('--criteria <path> is required');
    console.log(writeVerdict({ cwd: process.cwd(), ...result }));
  } catch (e) {
    process.stderr.write(`write-verdict: ${e.stderr?.toString().trim() || e.message}\n`);
    process.exit(1);
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
