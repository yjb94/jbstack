---
name: verify-jbstack
description: jbstack 플러그인(스킬·에이전트 문서, hooks, scripts)의 변경을 사용자가 겪는 방식 그대로 확인한다. 스킬 등록 검사, 스크립트 테스트, 훅 테스트를 돌리고 출력과 종료 코드를 증거로 남긴다. 이 레포의 PR을 critic이 판정할 때, 또는 "플러그인 바뀐 거 확인해줘"에 쓴다.
---

# Verify jbstack

이 레포의 표면은 세 가지다. Claude Code가 읽는 스킬·에이전트 마크다운(`core/skills/*/SKILL.md`, `core/agents/*.md`), `write-criteria.mjs`·`write-verdict.mjs` 스크립트, PreToolUse 훅(`core/hooks/guard.mjs`). 앱 서버나 UI는 없다. 사용자가 겪는 것은 "스킬이 목록에 뜨는가", "스크립트가 맞는 파일을 쓰는가", "훅이 막아야 할 명령을 막는가"다.

## Launch

띄울 서버가 없다. 준비됐다는 것은 레포 루트에서 `node --version`이 v18 이상을 찍고 `git status --porcelain`이 비어 있다는 뜻이다(`write-verdict.mjs`는 더러운 트리를 거부한다). 의존성 설치는 없다.

## Doctor

읽기 전용 검사 하나다. 레포 루트에서 실행한다.

```bash
node scripts/check-skills.mjs core; echo "exit=$?"
```

exit 0이면 모든 `core/skills/*/SKILL.md`와 `core/agents/*.md`가 frontmatter(`name`, `description`), 폴더명 일치, 상대 링크 유효, 금지 용어 검사를 통과한 것이다. 출력이 있으면 그 줄이 어긋난 파일이다. 설치된 캐시(`~/.claude/plugins/cache/jbstack/jbstack/<version>`)와 `core/.claude-plugin/plugin.json`의 `version`이 다르면 이 체크아웃은 아직 설치되지 않은 것이다. 머지 뒤 재설치로 맞춘다.

## Drive

문서 변경은 해당 파일을 읽어 기준이 요구하는 문장이 있는지 확인한다(`grep -n`으로 줄 번호를 남긴다). 스크립트·훅 변경은 테스트를 포그라운드로 돌린다(Bash timeout 600000. 실측 8초).

```bash
node --test tests/check-skills.test.mjs tests/import-pstack.test.mjs core/scripts/write-criteria.test.mjs core/scripts/write-verdict.test.mjs core/hooks/guard.test.mjs 2>&1 | tail -8
```

마지막 줄들의 `pass`·`fail` 수가 증거다. 훅 동작을 실제로 보려면 `core/hooks/guard.test.mjs`가 명령 문자열을 훅에 넣는 방식을 그대로 쓴다. 설치된 플러그인에서 끝까지 보려면 다른 레포에서 `/jbstack:jb-mode`를 띄우는 것이 유일한 경로이며, 이 스킬 범위 밖이다.

## Evidence

레포 루트 `logs/verify-jbstack/<YYYYMMDD-HHMMSS>/`에 둔다(gitignore 대상이 아니므로 커밋에 섞이지 않게 `git add`에서 뺀다). `doctor.txt`(check-skills 출력과 exit), `tests.txt`(node --test 전체 출력), 문서 기준은 `grep -n` 출력을 `docs.txt`에 남긴다. 증명 기준은 "exit 0과 fail 0, 그리고 기준이 말한 문장이 줄 번호와 함께 있다"이다.

## Cleanup

지울 프로세스가 없다. `node --test`가 만든 임시 디렉터리는 OS tmp에 있고 테스트가 스스로 지운다. 증거 폴더는 지우지 않는다. 끝에 `git status --porcelain`으로 `logs/` 외에 변경이 없는지 본다.

## Helpers

별도 스크립트는 없다. 위 명령 세 개가 전부다.
