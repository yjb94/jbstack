#!/usr/bin/env node
// Checks skills/ and agents/ under a plugin root: frontmatter, relative links, leftover Cursor terms.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TERMS = [
  ['grok', /\bgrok\b/],
  ['Task', /\bTask\b/],
  ['.cursor/', /\.cursor\//],
  ['Cursor', /\bCursor\b/],
  ['Bugbot', /\bBugbot\b/],
  ['pstack-models', /pstack-models/],
];

const walk = (dir) =>
  !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name === 'node_modules' ? [] : walk(path.join(dir, e.name))) : e.name.endsWith('.md') ? [path.join(dir, e.name)] : []);

export function checkSkills(root) {
  const problems = [];
  const rel = (f) => path.relative(root, f).split(path.sep).join('/');
  for (const file of [...walk(path.join(root, 'skills')), ...walk(path.join(root, 'agents'))]) {
    const r = rel(file);
    const text = fs.readFileSync(file, 'utf8');
    const isSkill = path.basename(file) === 'SKILL.md';
    const isAgent = r.startsWith('agents/') && file.endsWith('.md');

    if (isSkill || isAgent) {
      const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      const field = (k) => fm.match(new RegExp(`^${k}:[ \\t]*(.*)$`, 'm'))?.[1].trim().replace(/^["']|["']$/g, '');
      const name = field('name');
      const expected = isSkill ? path.basename(path.dirname(file)) : path.basename(file, '.md');
      if (!name) problems.push(`${r}: missing name`);
      else if (name !== expected) problems.push(`${r}: name "${name}" != ${isSkill ? 'folder' : 'file'} "${expected}"`);
      if (!field('description')) problems.push(`${r}: missing description`);
    }

    for (const [, link] of text.matchAll(/\]\(([^)#\s]+)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(link)) continue; // http:, https:, mailto:
      if (!/[/.]/.test(link)) continue; // placeholder such as (url)
      if (!fs.existsSync(path.resolve(path.dirname(file), link))) problems.push(`${r}: broken link ${link}`);
    }

    text.split('\n').forEach((line, i) => {
      for (const [term, re] of TERMS) if (re.test(line)) problems.push(`${r}:${i + 1}: cursor term "${term}"`);
    });
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = checkSkills(process.argv[2] ?? 'core');
  problems.forEach((p) => console.log(p));
  process.exit(problems.length ? 1 : 0);
}
