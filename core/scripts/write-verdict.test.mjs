import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeVerdict } from './write-verdict.mjs';

const CLI = fileURLToPath(new URL('./write-verdict.mjs', import.meta.url));
const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'jb-verdict-')));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

const git = (cwd, ...a) => execFileSync('git', a, { cwd, stdio: 'pipe' }).toString().trim();
function mkRepo(name) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir);
  git(dir, 'init', '-q');
  git(dir, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init');
  return dir;
}

test('writes HEAD tree into git-dir/jb/verdict.json', () => {
  const r = mkRepo('a');
  const p = writeVerdict({ cwd: r, result: 'PASS', inconclusive: ['x'], criteria: 'c.md' });
  assert.equal(p, path.join(git(r, 'rev-parse', '--absolute-git-dir'), 'jb', 'verdict.json'));
  const v = JSON.parse(fs.readFileSync(p, 'utf8'));
  assert.equal(v.result, 'PASS');
  assert.equal(v.tree, git(r, 'rev-parse', 'HEAD^{tree}'));
  assert.deepEqual(v.inconclusive, ['x']);
  assert.equal(v.criteria, 'c.md');
  assert.ok(!Number.isNaN(Date.parse(v.at)));
});

test('refuses dirty working tree', () => {
  const r = mkRepo('b');
  fs.writeFileSync(path.join(r, 'f'), 'x');
  assert.throws(() => writeVerdict({ cwd: r, result: 'PASS', inconclusive: [], criteria: 'c' }), /commit or stash/);
});

test('works in a worktree', () => {
  const r = mkRepo('c');
  const wt = path.join(tmp, 'c-wt');
  git(r, 'worktree', 'add', '-q', '-b', 'wt', wt);
  const p = writeVerdict({ cwd: wt, result: 'FAIL', inconclusive: [], criteria: 'c' });
  assert.equal(p, path.join(git(wt, 'rev-parse', '--absolute-git-dir'), 'jb', 'verdict.json'));
  assert.notEqual(p, path.join(git(r, 'rev-parse', '--absolute-git-dir'), 'jb', 'verdict.json'));
  assert.equal(JSON.parse(fs.readFileSync(p, 'utf8')).result, 'FAIL');
});

test('CLI: writes with repeated --inconclusive, prints path; rejects bad --result', () => {
  const r = mkRepo('d');
  const run = (...a) => spawnSync('node', [CLI, ...a], { cwd: r, encoding: 'utf8' });
  const ok = run('--result', 'PASS', '--criteria', 'c.md', '--inconclusive', 'a', '--inconclusive', 'b');
  assert.equal(ok.status, 0);
  const v = JSON.parse(fs.readFileSync(ok.stdout.trim(), 'utf8'));
  assert.deepEqual(v.inconclusive, ['a', 'b']);
  const bad = run('--result', 'MAYBE', '--criteria', 'c.md');
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /PASS or FAIL/);
});
