import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSkills } from '../scripts/check-skills.mjs';

const good = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/check-skills/good');

// throwaway root with one skill folder `x`
function skill(frontmatter, body = '') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jb-chk-'));
  fs.mkdirSync(path.join(root, 'skills/x'), { recursive: true });
  fs.writeFileSync(path.join(root, 'skills/x/SKILL.md'), `---\n${frontmatter}\n---\n${body}\n`);
  return root;
}

test('good fixture passes', () => assert.deepEqual(checkSkills(good), []));

test('missing description is reported', () =>
  assert.ok(checkSkills(skill('name: x')).includes('skills/x/SKILL.md: missing description')));

test('name must match folder', () =>
  assert.ok(checkSkills(skill('name: y\ndescription: d')).includes('skills/x/SKILL.md: name "y" != folder "x"')));

test('agent without description is reported', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jb-chk-'));
  fs.mkdirSync(path.join(root, 'agents'));
  fs.writeFileSync(path.join(root, 'agents/a.md'), '---\nname: a\n---\n');
  assert.deepEqual(checkSkills(root), ['agents/a.md: missing description']);
});

test('broken relative link is reported', () =>
  assert.ok(checkSkills(skill('name: x\ndescription: d', '[g](playbooks/gone.md)')).includes('skills/x/SKILL.md: broken link playbooks/gone.md')));

test('http links and anchors are ignored', () =>
  assert.deepEqual(checkSkills(skill('name: x\ndescription: d', '[a](https://e.com/z) [b](#top)')), []));

test('cursor terms are reported', () => {
  const terms = ['grok', 'Task', '.cursor/', 'Cursor', 'Bugbot', 'pstack-models'];
  const body = '\n'.repeat(5) + terms.map((t) => `uses ${t} here`).join('\n') + '\nlowercase task and subtask are fine';
  const out = checkSkills(skill('name: x\ndescription: d', body));
  // frontmatter is 4 lines + body starts with 5 blank lines => first term on line 10
  assert.deepEqual(out, terms.map((t, i) => `skills/x/SKILL.md:${10 + i}: cursor term "${t}"`));
});

test('placeholder link targets are ignored', () =>
  assert.deepEqual(checkSkills(skill('name: x\ndescription: d', '[a](url) [b](gone.md)')), ['skills/x/SKILL.md: broken link gone.md']));

test('node_modules is skipped', () => {
  const root = skill('name: x\ndescription: d');
  fs.mkdirSync(path.join(root, 'skills/x/node_modules/pkg'), { recursive: true });
  fs.writeFileSync(path.join(root, 'skills/x/node_modules/pkg/README.md'), 'uses Cursor [g](gone.md)\n');
  assert.deepEqual(checkSkills(root), []);
});
