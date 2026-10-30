---
name: show-me-your-work
description: "장시간 또는 무인으로 도는 작업의 검토 가능한 판단 기록을 남긴다. 판단 하나당 한 행(무엇, 왜, 증거, 결과)인 TSV 로그다. 기본은 로컬에 두고, 리뷰어가 결과를 믿으려면 기록이 필요할 때 커밋한다. /show-me-your-work, 자율 실행이나 여러 단계에 걸친 실행, 사람이 자리를 비운 뒤 검토하는 작업에 쓴다."
disable-model-invocation: true
---

# Show me your work

정본 로그를 하나만 둔다.

## The format

TSV 파일 하나에 판단 하나당 한 행을 쓴다. 셀은 한 줄로 유지한다. 증거는 설명문이 아니라 포인터다.

깨끗한 로그로 시작하려면 `references/decision-log-template.tsv`(헤더 행)를 복사한다. 열은 다음과 같다.

- **ts.** ISO8601 타임스탬프.
- **phase.** 단계 또는 작업 흐름.
- **decision.** 선택했거나 한 일을 한 줄로.
- **why.** 이유를 평이한 말로. 원칙이 판단을 이끌었다면 전문 용어 태그로 쓰지 말고 평이하게 말한다.
- **evidence.** 그것을 증명하는 링크나 경로. 커밋 SHA, PR 번호, `file:line`, 아티팩트·트레이스·스크린샷 경로. 문단은 절대 안 된다.
- **result.** 결과 또는 술어(predicate)의 상태. `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open` 같은 값.

리뷰어가 한눈에 읽도록 평이하게 쓴 예다.

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## Logging a row

각 항목은 동료에게 한 일을 말하듯 쓴다. 평이한 말, 구체적인 행동으로 쓰고, AI 말투나 추상적인 전문 용어는 쓰지 않는다(**unslop** 스킬은 로그 텍스트에도 적용된다).

`scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>` 헬퍼를 쓴다. 이 헬퍼는 `ts`를 찍고, 처음 쓸 때 헤더를 쓰고, 섞여 든 탭과 줄바꿈을 제거하고, `=`, `+`, `-`, `@`로 시작하는 셀 앞에 작은따옴표 하나를 붙인다. 순수 `printf`로 행을 덧붙여도 되지만, 셀이 생성된 텍스트나 사용자가 준 텍스트에서 오면 같은 바이트를 조심한다.

모든 행동이 아니라 판단 지점과 체크포인트를 기록한다. 고른 갈림길, 검증 결과와 함께 끝낸 단위, 계기와 함께 한 방향 전환이나 되돌림, 드러난 블로커, 고친 게이트가 그런 예다. 루프 실행에서는 반복마다 한 행을 쓴다. 사소하거나 자명한 것은 건너뛴다.

실행(run)은 에이전트 대화 하나이며, 이후 턴과 그 요약도 포함한다. 인수받은 에이전트, 교체된 에이전트, 새 채팅은 새 실행을 시작한다. 실행이 이미 행이 있는 로그에 덧붙일 때 그 첫 행의 phase는 `start`이다. 이 실행이 쓴 첫 행이 다른 실행의 `start` 행 뒤에 온다면 그 행도 phase는 `start`이다. 그래서 이후 턴에서 로그로 돌아온 실행은 먼저 로그의 마지막 행들을 읽고 그사이 다른 실행이 썼는지 확인한다. `start` 행은 이 실행이 쓰지 않은 앞선 행들의 `ts` 범위를 밝히고, evidence에는 에이전트 id처럼 이 실행을 가리키는 값을 적는다. phase `start`는 다른 용도로 쓰지 않는다.

## Where it lives

기본적으로 로그는 커밋하지 않는 작업 산출물이다. 작업 디렉터리의 `decisions.tsv`에 두고, 여러 작업이 동시에 돌 때는 `.audit/<task-slug>.tsv`에 두며, git에는 넣지 않는다.

작업 규모가 커서 리뷰어가 결과를 믿으려면 기록이 필요할 때만 커밋한다.

## Rules

- 추가만 한다. 틀린 판단은 그것을 대체하는 새 행으로 정정한다. 기록을 절대 고치거나 지우지 않는다.
- 손으로 만든 일회성 증거보다 커밋된 스크립트가 만든 증거를 우선한다(**encode-lessons-in-structure** 원칙 스킬).

## Audit the log against the transcript

실행이 끝나고 넘기기 전에 로그가 사실을 말하는지 확인한다. 이 실행의 transcript를 읽는다. `~/.claude/projects/<slug>/` 바로 아래에서 가장 최신인 `.jsonl`이며, slug는 작업 공간 경로의 `/`와 `.`를 각각 `-`로 바꾼 것이다. `~/.claude/projects/*/` 전체에 glob을 걸지 않는다. 무관한 비공개 채팅을 읽게 된다. 이 실행의 행들을 실제로 일어난 일과 대조한다. 각 구간은 이 실행의 `start` 행에서 시작하고(이 실행이 로그를 만들었다면 첫 행에서 시작하고) 다른 실행의 다음 `start` 행에서 끝난다.

- 모든 행이 실제 판단이나 행동에 대응하는지 확인한다.
- 각 행의 evidence가 가리키는 대상이 실제로 있고 행이 주장하는 내용을 보여주는지 확인한다.
- 작업을 형성했지만 기록되지 않은 갈림길, 방향 전환, 포기한 접근은 공백이다. 추가한다.

고치는 대상은 이야기가 아니라 로그다. 감사는 행을 고치거나 지우지 않으며, 꾸며낸 행도 마찬가지다. 행이 실제 판단도 실제 행동도 기록하지 않거나 주장이나 증거가 틀렸다면, 실제로 일어난 일과 실제로 찾아지는 포인터를 담은 대체 행을 추가한다. 이 감사는 이 실행의 구간 밖 행은 확인하지 않는다. 이 실행의 작업이 그중 하나가 틀렸음을 보여주면 다른 틀린 판단처럼 대체 행으로 정정한다.

## Cross-model review of the trail

넘기기 전에 새 서브에이전트를 `model: "opus"`, `effort: "xhigh"`로 띄운다. 작업이 opus에서 돌았다면 `model: "sonnet"`을 쓴다. 자기 리뷰는 대체가 되지 않는다. 서브에이전트는 감사 기록과 이 실행의 transcript를 읽고 사용자가 주목해야 할 점을 표시한다. 작업을 다시 하는 것이 아니라, 차선이거나 위험한 것을 훑는 일이다. 각 서브에이전트의 추론 수준은 **jb-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.

- 증거가 약하거나 없이 기록된 판단.
- transcript에서 건너뛰었거나 증명 없이 완료로 주장한 검증 단계.
- 돌이켜 보면 위험해 보이는 선택(성급함, 범위 확대, 증상 덮기).
- 가볍게 훑으면 사용자가 놓칠 공백.

기록을 남긴 실행의 모든 답변은 "Attention" 절로 끝낸다. 리뷰어의 모델을 한 줄에 단독으로 먼저 쓰고(`reviewed by <model>`), 각 지적을 특정 행이나 시점과 함께 나열한다. "No flags"는 유효한 값이다. 모델 이름만 적는 것은 유효한 값이 아니다.

## Reviewing the trail

위에서 아래로 읽고, 증거 포인터를 따라가고, 표본 점검을 한다. GitHub은 커밋된 TSV를 표로 렌더링한다. 터미널에서는 `column -s$'\t' -t decisions.tsv`로 렌더링한다.

## Composing this skill

다른 스킬은 자체 기록을 만들지 말고 감사 기록을 여기로 넘긴다. 이름으로 참조하고 형식은 이 스킬에 맡긴다. 열을 다시 쓰지 않는다.
