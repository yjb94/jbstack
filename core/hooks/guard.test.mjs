import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decide } from './guard.mjs';

const GUARD = fileURLToPath(new URL('./guard.mjs', import.meta.url));
const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'jb-guard-')));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

const git = (cwd, ...a) => execFileSync('git', a, { cwd, stdio: 'pipe' });
let n = 0;
// a real repo with a bare remote; trust === undefined means no config file
function mkRepo(trust, raw) {
  const dir = path.join(tmp, `r${n++}`);
  const remote = `${dir}-remote.git`;
  fs.mkdirSync(dir);
  git(dir, 'init', '-q');
  git(tmp, 'init', '-q', '--bare', remote);
  git(dir, 'remote', 'add', 'origin', remote);
  if (raw !== undefined || trust !== undefined) {
    fs.mkdirSync(path.join(dir, '.claude'));
    fs.writeFileSync(path.join(dir, '.claude/jb.local.json'), raw ?? JSON.stringify({ trust }));
  }
  return dir;
}

test('no config means level 1: commit allowed, push blocked', () => {
  const r = mkRepo();
  assert.equal(decide({ command: 'git commit -m x', cwd: r }).allow, true);
  assert.equal(decide({ command: 'git push', cwd: r }).allow, false);
  assert.equal(decide({ command: 'gh pr create', cwd: r }).allow, false);
});

test('level 0 blocks commit', () => {
  const r = mkRepo(0);
  assert.equal(decide({ command: 'git commit -m x', cwd: r }).allow, false);
});

test('level 2 allows push', () => {
  const r = mkRepo(2);
  assert.equal(decide({ command: 'git push origin main', cwd: r }).allow, true);
  assert.equal(decide({ command: 'gh pr create --fill', cwd: r }).allow, true);
});

test('blocks chained push at level 1', () => {
  const r = mkRepo(1);
  assert.equal(decide({ command: 'git add -A && git commit -m x && git push', cwd: r }).allow, false);
});

test("uses the cd target repo's level", () => {
  const one = mkRepo(1);
  const two = mkRepo(2);
  assert.equal(decide({ command: `cd ${two} && git push`, cwd: one }).allow, true);
  assert.equal(decide({ command: `cd ${one} && git push`, cwd: two }).allow, false);
});

test('git -C target is honored', () => {
  const one = mkRepo(1);
  const two = mkRepo(2);
  assert.equal(decide({ command: `git -C ${two} push`, cwd: one }).allow, true);
  assert.equal(decide({ command: `git -C ${one} push`, cwd: two }).allow, false);
});

test('invalid config falls back to 1', () => {
  for (const raw of ['{not json', '{"trust":5}', '{"trust":"2"}']) {
    const r = mkRepo(undefined, raw);
    assert.equal(decide({ command: 'git commit -m x', cwd: r }).allow, true, raw);
    assert.equal(decide({ command: 'git push', cwd: r }).allow, false, raw);
  }
});

test('non-git cwd is allowed', () => {
  const d = path.join(tmp, 'plain');
  fs.mkdirSync(d);
  assert.equal(decide({ command: 'git push', cwd: d }).allow, true);
});

test('reason names the repo and level', () => {
  const r = mkRepo(1);
  const d = decide({ command: 'git push', cwd: r });
  assert.match(d.reason, /level 1/);
  assert.ok(d.reason.includes(r));
});

test('main: exit 2 with reason on stderr when blocked, exit 0 when allowed', () => {
  const r = mkRepo(1);
  const run = (command) =>
    spawnSync('node', [GUARD], { input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: r }), encoding: 'utf8' });
  const blocked = run('git push');
  assert.equal(blocked.status, 2);
  assert.match(blocked.stderr, /level 1/);
  assert.equal(run('git status').status, 0);
});
