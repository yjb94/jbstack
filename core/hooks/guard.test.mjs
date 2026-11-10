import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decide, decideFileWrite } from './guard.mjs';
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
const verdict = (r, result, inconclusive = []) => {
  const criteria = path.join(tmp, `${path.basename(r)}-criteria.md`);
  fs.writeFileSync(criteria, '- c\n');
  return writeVerdict({ cwd: r, result, inconclusive, criteria });
};
const BODY = '## 이유\n\nwhy\n\n## 작업 범위\n\n- scope\n';
const pr = (r) => decide({ command: `gh pr create --title t --body "${BODY}"`, cwd: r });

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

test('PASS verdict without the playbook body is blocked', () => {
  const r = mkPrRepo();
  verdict(r, 'PASS');
  for (const command of ['gh pr create --fill', 'gh pr create --title t --body "## Summary\n\n- x"', 'gh pr create --title t --body "## 이유\n\nwhy"']) {
    const d = decide({ command, cwd: r });
    assert.equal(d.allow, false, command);
    assert.match(d.reason, /opening-a-pr\.md/, command);
  }
});

test('playbook body in --body-file is read from disk', () => {
  const r = mkPrRepo();
  verdict(r, 'PASS');
  const good = path.join(tmp, `${path.basename(r)}-body.md`);
  const bad = path.join(tmp, `${path.basename(r)}-bad.md`);
  fs.writeFileSync(good, BODY);
  fs.writeFileSync(bad, '## Summary\n');
  assert.equal(decide({ command: `gh pr create --title t --body-file ${good}`, cwd: r }).allow, true);
  assert.equal(decide({ command: `gh pr create --title t -F "${good}"`, cwd: r }).allow, true);
  assert.equal(decide({ command: `gh pr create --title t --body-file ${bad}`, cwd: r }).allow, false);
  assert.equal(decide({ command: 'gh pr create --title t --body-file missing.md', cwd: r }).allow, false);
});

test('inconclusive items do not block a PASS', () => {
  const r = mkPrRepo();
  verdict(r, 'PASS', ['could not run e2e']);
  assert.equal(pr(r).allow, true);
});

test('malformed verdict is blocked', () => {
  const r = mkPrRepo();
  const file = verdict(r, 'PASS');
  for (const body of ['null', '[]', '7', '"x"', '{not json']) {
    fs.writeFileSync(file, body);
    const d = pr(r);
    assert.equal(d.allow, false, body);
    assert.match(d.reason, /malformed|no verdict found/, body);
  }
});

test('block reason does not reveal how to raise trust', () => {
  const r = mkRepo(1);
  const d = decide({ command: 'git push', cwd: r });
  assert.equal(d.allow, false);
  assert.match(d.reason, /level 1/);
  assert.match(d.reason, /needs level 2/);
  assert.match(d.reason, /set by the repo owner\. Report instead of retrying/);
  assert.doesNotMatch(d.reason, /jb\.local|\.claude|"trust"|\{/);
});

test('bash command touching jb.local.json is blocked', () => {
  const r = mkRepo(1);
  for (const command of [`echo '{"trust":2}' > ${r}/.claude/jb.local.json`, 'sed -i s/1/2/ .claude/jb.local.json', 'cat .claude/jb.local.json']) {
    const d = decide({ command, cwd: r });
    assert.equal(d.allow, false, command);
    assert.doesNotMatch(d.reason, /\{/);
  }
});

test('Write to .claude/jb.local.json is blocked', () => {
  const r = mkRepo(1);
  assert.equal(decideFileWrite({ filePath: path.join(r, '.claude', 'jb.local.json') }).allow, false);
  assert.equal(decideFileWrite({ filePath: path.join(r, 'sub', '..', '.claude', 'jb.local.json') }).allow, false);
  const run = (tool_name, tool_input) =>
    spawnSync('node', [GUARD], { input: JSON.stringify({ tool_name, tool_input, cwd: r }), encoding: 'utf8' });
  for (const [name, input] of [
    ['Write', { file_path: path.join(r, '.claude', 'jb.local.json') }],
    ['Edit', { file_path: '.claude/jb.local.json' }],
    ['MultiEdit', { file_path: path.join(r, '.claude', 'jb.local.json') }],
    ['NotebookEdit', { notebook_path: path.join(r, '.claude', 'jb.local.json') }],
  ]) {
    const out = run(name, input);
    assert.equal(out.status, 2, name);
    assert.doesNotMatch(out.stderr, /\{/);
  }
});

test('Write elsewhere is allowed', () => {
  const r = mkRepo(1);
  assert.equal(decideFileWrite({ filePath: path.join(r, 'src', 'a.js') }).allow, true);
  assert.equal(decideFileWrite({ filePath: path.join(r, '.claude', 'settings.json') }).allow, true);
  assert.equal(decideFileWrite({ filePath: undefined }).allow, true);
  const out = spawnSync('node', [GUARD], {
    input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: path.join(r, 'a.js') }, cwd: r }),
    encoding: 'utf8',
  });
  assert.equal(out.status, 0);
});

test("worktree inherits the main checkout's level", () => {
  for (const [trust, pushAllowed, commitAllowed] of [[2, true, true], [0, false, false]]) {
    const r = mkPrRepo();
    fs.writeFileSync(path.join(r, '.claude/jb.local.json'), JSON.stringify({ trust }));
    const wt = `${r}-wt`;
    git(r, 'worktree', 'add', '-q', '-b', 'wt', wt);
    assert.equal(decide({ command: 'git push', cwd: wt }).allow, pushAllowed, `level ${trust} push`);
    assert.equal(decide({ command: 'git commit -m x', cwd: wt }).allow, commitAllowed, `level ${trust} commit`);
  }
});

test('-C is taken only from the commit/push command itself', () => {
  const one = mkRepo(1);
  const two = mkRepo(2);
  assert.equal(decide({ command: `git -C ${two} status && git push`, cwd: one }).allow, false);
  assert.equal(decide({ command: `git -C ${two} -c k=v push`, cwd: one }).allow, true);
});

test('git global options before the subcommand are seen through', () => {
  const zero = mkRepo(0);
  const one = mkRepo(1);
  for (const command of ['git -c k=v push', 'git --no-pager push', 'git -c a=b --no-pager push origin main'])
    assert.equal(decide({ command, cwd: one }).allow, false, command);
  assert.equal(decide({ command: 'git -c user.name=x commit -m y', cwd: zero }).allow, false);
});

test('gh pr new is gated like gh pr create', () => {
  assert.equal(decide({ command: 'gh pr new --fill', cwd: mkRepo(1) }).allow, false);
  assert.equal(decide({ command: 'gh pr new --fill', cwd: mkPrRepo() }).allow, false); // no verdict
});
