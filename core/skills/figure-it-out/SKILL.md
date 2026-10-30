---
name: figure-it-out
description: "더 좁은 playbook이 맞지 않을 때 감사 가능한 playbook을 설계한다. 대규모 마이그레이션, 야심찬 다중 파트 변경, 사람이 자리를 비웠다 돌아와 검토하는 작업에 쓴다. 작업에 맞춰 엄밀함을 조절하고, 가설 루프를 돌리고, 결정을 기록한다. /figure-it-out 또는 'figure it out'에 쓴다."
disable-model-invocation: true
---

# Figure it out

작업에 맞는 playbook이 없으면 playbook을 설계한다. 코드 전에 내놓을 산출물은 워크플로 자체다. 작업에 맞춰 엄밀함을 조절하고, 과학적 방법을 돌리고, 사람이 자리를 비웠다 돌아와 감사할 수 있는 결정 기록을 남기는 단계들의 순서다.

## Start

첫 항목이 **jb-mode** 스킬의 Principles 절을 읽는 것인 todo 목록을 연다. 그다음 아래 단계들을 todo로 추가한다.

## Phase A: Frame

먼저 grounding하고, 그다음 확정한다. 다음을 적을 수 있을 때까지 실행을 시작하지 않는다:

- 반증 가능한 조건으로 쓴 완료 정의(**prove-it-works** 원칙 스킬).
- 정량화한 범위. 대략의 단위와 노력, 그리고 grounding에서 드러난 blocker.
- 엄밀함 수준. 높은 쪽으로 치우치게 잡는다. 되돌릴 수 없는 결정(one-way door)과 영향 범위가 큰 일은 더 높게, 되돌릴 수 있고 위험이 낮은 단계는 더 낮게 잡는다. 엄밀함은 gate와 산출물이지 "더 열심히 하기"가 아니다.

긴 실행을 확정하기 전에 프레이밍과 tradeoff를 제시한다. 되돌릴 수 있는 일은 진행하지만(**never-block-on-the-human** 원칙 스킬), 여러 시간짜리 실행에는 체크포인트를 한 번 둔다.

## Phase B: Design the workflow

독립적으로 landing할 수 있는 원자적 단위로 분해한다. 가장 위험한 미지수부터 순서를 잡는다. scaffold와 검증이 기능보다 먼저 온다(**foundational-thinking** 원칙 스킬).

- 작업 전에 검증 harness를 만든다. baseline은 변경 전 상태에서 확보해서 검사가 "이전 값 대 새 값"으로 읽히게 한다.
- 되돌릴 수 없는 설계 결정에는 **architect** 스킬을 실행한다(이 스킬은 **arena**를 실행한다). 형태가 이미 구체적인 기계적 작업에는 건너뛴다. 이미 확정된 설계 위에 arena를 한 번 더 돌리는 것은 과잉 설계다(**laziness-protocol** 원칙 스킬).
- 무엇을 fan-out할지 정한다. 이음새(seam)를 따라서만 병렬화하고, 각 worker에게 자기 worktree나 브랜치를 준다(**separate-before-serializing-shared-state** 원칙 스킬). 과하게 fan-out하지 않는다. 각 서브에이전트의 추론 수준은 **jb-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.
- 설계한 단계 목록을 적어 둔다. 사람이 검토하는 것은 그 목록이다.

그다음 설계를 실행한다. 그 단계들을 Phase C와 Phase D 항목 사이에 구체적인 항목으로 todo 목록에 추가한다. 각 단계를 Phase C 루프 규율 아래 실행하고, Phase D 기록을 그 사이사이에 엮는다. 단계가 landing할 때마다 한 행씩 쓰고, 기록 전체를 끝까지 미뤄 두지 않는다.

## Phase C: Run the loop

각 단위는 실험이다. 가설을 적고, 가장 작은 변경을 하고, 실제 산출물에서 조건에 비춰 측정한다. 진전이 있으면 유지하고 없으면 되돌린다. **sequence-verifiable-units** 원칙 스킬을 적용해서, 검사를 끝에 몰아서 하지 말고 다음 단위를 시작하기 전에 각 단위를 검증한다.

- 자기 보고가 아니라 산출물을 직접 살펴서 검증한다. 무언가가 너무 쉽게 통과하면 시스템보다 먼저 관찰 방법을 의심한다.
- 위임한 작업에는 judge를 짝지운다. worker가 gate를 속이면 초기화하고 계약을 강화한다. gate 자체가 틀렸으면 우회하지 말고 별도 변경으로 gate를 고친다.
- 판정은 VERIFIED, NOT VERIFIED, INCONCLUSIVE 중 하나다. 미확정은 통과가 아니다. 부정적인 결과를 숨기지 않는다.

## Phase D: Keep the audit trail

**show-me-your-work** 스킬로 실행을 기록한다. figure-it-out의 작업은 대개 기록을 커밋해서 검토자가 PR에서 읽을 수 있을 만큼 야심차다. 기록과 diff가 함께 있어야 사람이 돌아와서 작업을 신뢰할 수 있다.

## Phase E: Verify and hand back

harness만이 아니라 실제 제품에서 Phase A 조건에 비춰 전체를 검사한다. 반복되는 교정은 gate, lint 규칙, 검사, 스크립트로 인코딩한다(**encode-lessons-in-structure** 원칙 스킬).

**Reply:** 설계한 playbook, 엄밀함 수준과 그 이유, 결정 기록 경로, 조건에 비춰 검증된 것, 아직 열려 있는 것.
