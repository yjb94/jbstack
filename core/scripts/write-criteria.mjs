import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdictPath } from './write-verdict.mjs';

// <git-dir>/jb/criteria.md. Claude Code refuses direct writes under .git/, so the critic's input goes through here.
export function writeCriteria({ cwd, text }) {
  if (!text.trim()) throw new Error('criteria are empty: pipe the acceptance criteria on stdin');
  const file = path.join(path.dirname(verdictPath(cwd)), 'criteria.md');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return file;
}

function main() {
  try {
    console.log(writeCriteria({ cwd: process.cwd(), text: fs.readFileSync(0, 'utf8') }));
  } catch (e) {
    process.stderr.write(`write-criteria: ${e.stderr?.toString().trim() || e.message}\n`);
    process.exit(1);
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
