import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeCriteria } from './write-criteria.mjs';

const CLI = fileURLToPath(new URL('./write-criteria.mjs', import.meta.url));
const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'jb-criteria-')));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

const git = (cwd, ...a) => execFileSync('git', a, { cwd, stdio: 'pipe' }).toString().trim();
function mkRepo(name) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir);
  git(dir, 'init', '-q');
  git(dir, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init');
  return dir;
}

test('writes stdin to git-dir/jb/criteria.md and prints the path', () => {
  const r = mkRepo('a');
  const out = spawnSync('node', [CLI], { cwd: r, input: '- it works\n', encoding: 'utf8' });
  assert.equal(out.status, 0);
  const want = path.join(git(r, 'rev-parse', '--absolute-git-dir'), 'jb', 'criteria.md');
  assert.equal(out.stdout.trim(), want);
  assert.equal(fs.readFileSync(want, 'utf8'), '- it works\n');
});

test('refuses empty input', () => {
  const r = mkRepo('b');
  assert.throws(() => writeCriteria({ cwd: r, text: '  \n' }), /empty/);
  const out = spawnSync('node', [CLI], { cwd: r, input: '', encoding: 'utf8' });
  assert.equal(out.status, 1);
  assert.match(out.stderr, /empty/);
});

test('works in a worktree', () => {
  const r = mkRepo('c');
  const wt = path.join(tmp, 'c-wt');
  git(r, 'worktree', 'add', '-q', '-b', 'wt', wt);
  const p = writeCriteria({ cwd: wt, text: 'x' });
  assert.equal(p, path.join(git(wt, 'rev-parse', '--absolute-git-dir'), 'jb', 'criteria.md'));
  assert.notEqual(p, path.join(git(r, 'rev-parse', '--absolute-git-dir'), 'jb', 'criteria.md'));
});
