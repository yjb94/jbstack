---
name: arena
description: "같은 작업에 후보 N개를 병렬로 돌리고, 기반 하나를 고르고, 탈락한 후보의 가장 강한 부분을 그 기반에 이식한다. /arena, 'arena this', 'throw it in the arena'에 쓰거나, 사소하지 않은 산출물을 한 번만 시도하면 잘못된 형태로 굳을 때 쓴다."
disable-model-invocation: true
---

# Arena

무엇이든 시작하기 전에 단계마다 항목 하나씩(Frame, Fan out, Cross-judge, Pick, Graft, Verify) todo 목록을 연다.

## Phase A: Frame

모든 후보가 같은 프롬프트를 받는다. 그래서 프롬프트가 계약이다.

1. 각 후보가 만들 산출물을 적는다.
2. 이 작업에서 성공이 어떤 모습인지 보여 주는 구체적이고 채점 가능한 기준 3~6개로 rubric을 도출한다. rubric은 Phase D에서 고르는 쪽이 쓰는 도구다. 후보는 작업만 본다.
3. runner를 정한다. 기본은 `model: "opus"`에 `effort: "xhigh"` 하나와 `model: "sonnet"` 하나씩이다. `Agent` 도구가 모델을 거부하면 그 자리는 세션 모델로 돌리고(`model`을 생략) 그렇게 했다고 밝힌다. arena가 여러 설계 방향을 다루면 runner를 더 띄운다. 일이 판단에 민감하지 않고 생성에 좌우되면 같은 모델을 N번 쓴다. 각 서브에이전트의 추론 수준은 **jb-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.
4. **separate-before-serializing-shared-state** 원칙 스킬에 따라 각 후보에게 자기만의 출력 위치를 준다. 가능하면 git worktree를, 아니면 `/tmp/arena-<slug>/candidate-<n>/`를 쓴다.

## Phase B: Fan out

서브에이전트 N개를 한 메시지에서 모두 띄운다. 각각에게 작업, 공유 grounding의 경로, 자기 출력 경로를 주고, 산출물과 짧은 rationale을 만들라고 지시한다. rationale에는 고려한 대안과 버린 것을 적게 한다.

후보가 출력을 내지 못하면 N-1개로 진행하고 이탈을 기록한다.

## Phase C: Cross-judge

Phase B의 후보가 모두 끝난 뒤, judge 서브에이전트 하나를 `subagent_type: "Explore"`로 띄운다. 모델은 `model: "opus"`에 `effort: "xhigh"`이고, 부모가 opus로 돌았으면 `model: "sonnet"`이다. 브리프에 "do not edit files"를 적는다. `Agent` 도구가 모델을 거부하면 judge를 건너뛰고, Phase D에서 기반을 혼자 고르고, 그렇게 했다고 밝힌다. judge는 rubric과 경로 라벨로 구분된 후보를 보고, 기준마다 점수를 매기고, 근거와 함께 기반을 추천한다. judge는 Phase D에서 네가 읽는 것과 병렬로 돈다. 후보가 아직 쓰는 중이면 띄우지 않는다.

## Phase D: Pick a base

고르기 전에 모든 후보를 처음부터 끝까지 읽는다. 전체적인 느낌이 아니라 rubric 기준마다 점수를 매기고, Phase C에서 judge를 돌렸으면 그 결과와 비교한다. 기반이 일치하면 선택이 확인된 것이다. 일치하지 않으면 한쪽이 편향됐거나 rubric이 모호했다는 뜻이다. 결정하기 전에 양쪽 rationale을 읽는다.

나중의 유지보수자가 불변식을 깨지 않고 가장 쉽게 확장할 수 있는 기반을 고른다. 둘이 비슷해 보이면 Laziness Protocol에 따라 경계가 더 깔끔하거나 API가 더 작은 쪽을 택한다.

## Phase E: Graft

탈락한 후보를 각각 한 번 더 훑어서 기반에 옮길 만한 것을 찾는다. 후보당 보통 한두 가지이고, 대부분을 옮기지는 않는다. **redesign-from-first-principles** 원칙 스킬에 따라 각 이식을 손으로 녹여 넣어 결과가 하나의 멘탈 모델 아래 일관되게 유지되게 한다. 기계적으로 붙여넣지 않는다.

후보들이 하나의 형태로 수렴하면 강한 합의다. 이를 기록하고 합의된 형태를 낸다. 이식은 필요 없다. 후보들이 크게 갈리면 Phase A가 덜 명세된 것이다. 갈린 것을 평균 내지 말고 범위와 요구를 다시 정의해서 다시 돌린다.

## Phase F: Verify

**prove-it-works** 원칙 스킬에 따라 종합한 산출물을 다른 출력과 똑같이 검증한다. 검증에서 arena가 놓친 문제가 나오면 둘 중 하나다. Phase A가 틀렸거나(다시 프레이밍해서 다시 돌린다), 후보가 잡았는데 네가 이식을 놓친 것이다(Phase E로 돌아간다). 덮어 버리지 않는다.

## Outputs

종합한 산출물 하나와, 그 옆에 짧은 종합 노트를 둔다. 노트에는 다음을 적는다. 기반과 그 이유, cross-judge의 판정 또는 Phase C에서 judge를 건너뛰었다는 사실, 이식마다 출처 후보, 버린 것과 그 이유, 수렴이나 이탈, 검증 결과.
