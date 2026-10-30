import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { importPstack } from '../scripts/import-pstack.mjs';

const w = (root, rel, body) => {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
};

// builds a throwaway git repo shaped like cursor/plugins
function fixture() {
  const src = fs.mkdtempSync(path.join(os.tmpdir(), 'jb-src-'));
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jb-out-'));
  const cc = 'harness/pstack/claude-code';
  w(src, `${cc}/LICENSE`, 'pstack license\n');
  w(src, `${cc}/skills/poteto-mode/SKILL.md`, 'mode\n');
  w(src, `${cc}/skills/poteto-mode/scripts/run.ts`, Buffer.from([0, 1, 2, 255]));
  for (const p of ['feature', 'bug-fix', 'shipping']) w(src, `${cc}/skills/poteto-mode/playbooks/${p}.md`, `${p}\n`);
  w(src, `${cc}/skills/how/SKILL.md`, 'how\n');
  w(src, `${cc}/agents/poteto-agent.md`, 'agent\n');
  w(src, 'cursor-team-kit/LICENSE', 'cursor license\n');
  w(src, 'cursor-team-kit/skills/deslop/SKILL.md', 'deslop\n');
  const git = (...a) => execFileSync('git', ['-C', src, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a]);
  git('init', '-q');
  git('add', '.');
  git('commit', '-qm', 'init');
  const commit = git('rev-parse', '--short=7', 'HEAD').toString().trim();
  const list = {
    commit,
    skills: ['poteto-mode', 'how'],
    modePlaybooks: ['feature', 'bug-fix'],
    agents: ['poteto-agent'],
    extra: [
      { from: 'cursor-team-kit/skills/deslop', to: 'skills/deslop' },
      { from: 'cursor-team-kit/LICENSE', to: 'skills/deslop/LICENSE' },
    ],
  };
  return { src, out, list, cc };
}

test('copies listed skills verbatim', () => {
  const { src, out, list, cc } = fixture();
  importPstack({ src, out, list });
  for (const f of ['skills/how/SKILL.md', 'skills/poteto-mode/SKILL.md', 'skills/poteto-mode/scripts/run.ts', 'agents/poteto-agent.md']) {
    assert.deepEqual(fs.readFileSync(path.join(out, f)), fs.readFileSync(path.join(src, cc, f)));
  }
  assert.equal(fs.readFileSync(path.join(out, 'skills/deslop/SKILL.md'), 'utf8'), 'deslop\n');
  assert.equal(fs.readFileSync(path.join(out, 'skills/deslop/LICENSE'), 'utf8'), 'cursor license\n');
});

test('copies only listed playbooks', () => {
  const { src, out, list } = fixture();
  importPstack({ src, out, list });
  const dir = path.join(out, 'skills/poteto-mode/playbooks');
  assert.deepEqual(fs.readdirSync(dir).sort(), ['bug-fix.md', 'feature.md']);
});

test('refuses wrong commit', () => {
  const { src, out, list } = fixture();
  list.commit = 'c742dd6';
  assert.throws(() => importPstack({ src, out, list }), /expected c742dd6/);
  assert.deepEqual(fs.readdirSync(out), []);
});

test('writes UPSTREAM.md and LICENSE-pstack', () => {
  const { src, out, list } = fixture();
  const { copied } = importPstack({ src, out, list });
  const up = fs.readFileSync(path.join(out, 'UPSTREAM.md'), 'utf8');
  assert.ok(up.includes(list.commit));
  for (const c of copied) assert.ok(up.includes(c), c);
  assert.ok(copied.includes('skills/how'));
  assert.equal(fs.readFileSync(path.join(out, 'LICENSE-pstack'), 'utf8'), 'pstack license\n');
});
