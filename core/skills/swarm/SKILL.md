---
name: swarm
description: "병렬 worker N개를 fan-out하고, 모두 마무리시킨 뒤, 보고서 하나를 돌려준다. /swarm, 'swarm this', 또는 병렬 커버리지, 경쟁(race), gauntlet, 탐색에 쓴다."
disable-model-invocation: true
---

# Swarm

## Start

무엇이든 시작하기 전에 단계마다 항목 하나씩 todo 목록을 연다.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: Frame

1. 완료 조건(done predicate)과 swarm이 돌려줘야 할 산출물 또는 보고서를 적는다.
2. 형태를 고른다. 조각으로 나누거나, 같은 브리프로 worker N개를 경쟁시키거나, 둘을 섞는다. 경쟁이나 혼합 형태면 띄우기 전에 `first pass`, `rank all`, `best-of` 중 하나를 선언한다.
3. worker 모델을 고른다: `model: "sonnet"`. 모델 경쟁이면 각 arm의 모델을 미리 밝힌다. 각 서브에이전트의 추론 수준은 **jb-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.
4. worker가 파일을 쓰면 각자 쓰기 가능한 자기 출력 위치를 준다. worker가 커밋을 검증하거나 측정하면 각 브리프에 정확한 SHA를 적는다. 측정 브리프에는 방법(샘플 수, 샘플 하나가 무엇인지, 순서)도 적는다. worker는 둘 다 결과에 기록한다.

## Phase B: Fan out

worker N개를 한 메시지에서 모두 띄운다. `subagent_type: "general-purpose"`, `isolation: "worktree"`, 3단계에서 고른 모델을 쓴다. 각 worker가 체크아웃할 브랜치나 커밋을 명시한다. worker가 사용자 컴퓨터에 있는 무언가에 접근해야 할 때만 `isolation`을 생략한다.

worker가 기본이 아닌, push된 브랜치에서 시작해야 하면 그 브랜치를 먼저 체크아웃하라고 알려 준다.

브리프는 모두 그것만으로 완결되어야 한다. 목표, 범위, 정확한 조각 또는 경쟁 arm, 검증 방법, 보고할 내용을 넣는다. 보고는 증거와 함께 `PASS`, `ISSUES`, `BLOCKED`를 쓴다. 결함을 증명할 수 있는 worker는 `ISSUES`를 보고하고, 첫 번째만이 아니라 증명할 수 있는 모든 이슈를 나열한다.

worker가 이탈하면 N-1개로 진행하고 기록한다.

## Phase C: Aggregate

최종 결과를 읽는다. 브리프가 요구한 SHA와 방법을 기록하지 않은 결과는 버리고, 그 worker를 한 번 다시 띄운다. 두 번째에도 실패하면 gap으로 기록한다. gap은 통과로 치지 않는다. 커버리지라면 필요한 조각마다 결과가 있어야 한다. 경쟁이라면 미리 선언한 선택 규칙을 적용한다. first pass, rank all, best-of 중 하나를 쓴다. worker의 원본 출력을 그대로 붙여넣지 않는다.

## Phase D: Report

통합 보고서 하나를 채팅으로 돌려준다. 결과 표, 이슈 한 줄 요약, gap이나 이탈, 쓴 경우 경쟁 규칙을 담는다.
