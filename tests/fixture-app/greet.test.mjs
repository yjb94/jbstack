import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const greet = fileURLToPath(new URL('bin/greet.mjs', import.meta.url));

test('greet prints the default greeting', () =>
  assert.equal(execFileSync('node', [greet]).toString(), 'Hello, world!\n'));
