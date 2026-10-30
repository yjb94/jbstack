---
name: verify-fixture
description: Drive the fixture-app `greet` CLI the way a user does and capture its output and exit code as evidence. Use to prove any change to greet's behavior.
---

# Verify fixture-app (greet CLI)

Hand-written for the jbstack smoke run; `/jbstack:create-verification-skill` could not write under `.claude/` in a `-p` acceptEdits session.

## Launch

No server and no dependencies. Each drive is one process: `node bin/greet.mjs [args]` from the repo root. Ready means `node --version` prints v18 or later.

## Doctor

`node --version && node --test` from the repo root. Both exit 0, or the instance is not worth driving.

## Drive

Run the CLI exactly as a user would, one invocation per case, and record stdout, stderr and the exit code:

```bash
node bin/greet.mjs; echo "exit=$?"
node bin/greet.mjs --name Ada; echo "exit=$?"
```

Cover every argument form the change claims to support, and at least one bad input (a flag with no value, an unknown flag).

## Evidence

Paste each command with its full stdout, stderr and exit code into the verdict. A test passing is supporting evidence, not proof; the proof is the CLI run.

## Cleanup

Nothing to tear down. The CLI writes no files; `git status --porcelain` must stay empty after a drive.
