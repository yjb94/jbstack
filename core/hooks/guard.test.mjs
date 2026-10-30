import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decide } from './guard.mjs';
import { writeVerdict } from '../scripts/write-verdict.mjs';

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
  assert.equal(decide({ command: 'gh pr create --fill', cwd: r }).allow, false); // verdict gate, see below
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

test('cd ~/ and $HOME/ targets are expanded; missing target falls back to cwd', () => {
  const one = mkRepo(1);
  const home = path.join(tmp, 'home');
  fs.mkdirSync(home);
  const two = path.join(home, 'two');
  fs.mkdirSync(two);
  git(two, 'init', '-q');
  fs.mkdirSync(path.join(two, '.claude'));
  fs.writeFileSync(path.join(two, '.claude/jb.local.json'), '{"trust":2}');
  const saved = process.env.HOME;
  process.env.HOME = home; // os.homedir() reads HOME on POSIX
  try {
    for (const p of ['~/two', '$HOME/two', '${HOME}/two'])
      assert.equal(decide({ command: `cd ${p} && git push`, cwd: one }).allow, true, p);
    assert.equal(decide({ command: 'cd ~/nope && git push', cwd: one }).allow, false);
    assert.equal(decide({ command: `cd ${home} && git push`, cwd: one }).allow, true);
  } finally {
    process.env.HOME = saved;
  }
});

// level-2 repo with one commit; pushed unless `push === false`
function mkPrRepo(push = true) {
  const r = mkRepo(2);
  fs.writeFileSync(path.join(r, '.gitignore'), '.claude/\n');
  git(r, 'add', '.gitignore');
  git(r, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'init');
  if (push) git(r, 'push', '-q', '-u', 'origin', 'HEAD');
  return r;
}
const verdict = (r, result, inconclusive = []) => writeVerdict({ cwd: r, result, inconclusive, criteria: 'c.md' });
const pr = (r) => decide({ command: 'gh pr create --fill', cwd: r });

test('pr create without upstream is blocked', () => {
  const d = pr(mkPrRepo(false));
  assert.equal(d.allow, false);
  assert.match(d.reason, /push first/);
});

test('pr create without verdict is blocked', () => {
  const d = pr(mkPrRepo());
  assert.equal(d.allow, false);
  assert.match(d.reason, /critic/);
});

test('FAIL verdict is blocked', () => {
  const r = mkPrRepo();
  verdict(r, 'FAIL');
  const d = pr(r);
  assert.equal(d.allow, false);
  assert.match(d.reason, /FAIL/);
});

test('stale verdict is blocked', () => {
  const r = mkPrRepo();
  verdict(r, 'PASS');
  fs.writeFileSync(path.join(r, 'f'), 'x');
  git(r, 'add', 'f');
  git(r, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'more');
  git(r, 'push', '-q');
  const d = pr(r);
  assert.equal(d.allow, false);
  assert.match(d.reason, /stale/);
});

test('PASS verdict matching upstream tree is allowed', () => {
  const r = mkPrRepo();
  verdict(r, 'PASS');
  assert.equal(pr(r).allow, true);
});

test('inconclusive items do not block a PASS', () => {
  const r = mkPrRepo();
  verdict(r, 'PASS', ['could not run e2e']);
  assert.equal(pr(r).allow, true);
});
