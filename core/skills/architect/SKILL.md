---
name: architect
description: "코드 전에 타입, 시그니처, 모듈 구조를 스케치하고, 구현이 채워지는 동안 루프에 남는다. /architect, 'architect this', 'design this'에 쓰거나, 바로 코드로 뛰어들면 잘못된 형태로 굳을 사소하지 않은 작업에 쓴다."
disable-model-invocation: true
---

# Architect

타입, 함수 시그니처, 클래스 형태, 모듈 경계를 `not implemented` 본문과 의사코드로 스케치한다. 여러 모델의 관점을 종합한 다음, 선택한 스케치에 맞춰 코드를 채운다.

## Start

시작하기 전에 단계마다 항목 하나씩 todo 목록을 연다.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: Ground the problem

새 코드가 건드리는 모든 시스템에 대해 실제 멘탈 모델을 세운다. 관련 서브시스템에 **how** 스킬을 실행한다. 파일 이름을 대는 것은 grounding이 아니다. `how`가 규정한 아키텍처 설명을 만든다. 설계가 소유권이나 계층을 다시 정의한다면, 기존 형태에도 **why** 스킬을 실행해서 그 이유를 추측이 아닌 제약으로 만든다.

통합할 주변 시스템이 없는 진짜 greenfield 작업일 때만 Phase A를 건너뛴다.

## Phase B: Sketch

설계 스케치 작업과 Phase A의 grounding 산출물로 **arena** 스킬을 실행한다. `references/runner-prompt.md`를 각 runner의 프롬프트로 넘긴다.

**arena** 스킬의 Phase A 3단계가 고르는 runner를 쓴다.

두 번 설계한다. 첫 번째 안이 충분해 보여도 종합 전에 구조적으로 다른 후보를 최소 둘 요구한다. 이것이 **exhaust-the-design-space** 원칙 스킬을 구체화한 것이다. 한 형태 안의 부분 수정이 아니라 형태 전체의 대안이어야 한다.

종합 전에 모든 후보를 [`references/design-red-flags.md`](references/design-red-flags.md)로 거른다. 다음 기여자는 자기가 연 파일만 보고, 가장 가까운 예를 복사하고, 컴파일되는 가장 짧은 길을 택하는 에이전트라고 가정한다. 한 파일에서 보기에 옳은 변경이 레포 전체에서도 옳은 설계를 택한다.

타당한 후보들은 인터페이스 깊이로 비교한다. 더 작고 단순한 공개 표면 뒤에 더 많은 복잡성을 숨기는 설계를 택한다. 풍부한 인터페이스는 능력을 여러 계층에 흩뿌리는 대신 한곳에 모아 호출 체인을 짧게 유지할 수 있다.

arena는 종합된 설계 패키지 하나를 돌려준다. 그 종합 결정이 rationale의 "Synthesis decision" 절을 채운다.

## Phase C: Agree (opt-in)

기본: 종합된 설계로 곧바로 구현에 들어간다. 사람의 체크포인트는 없다.

호출자가 "/architect with checkpoint", "stop and show me before implementing" 같은 말로 명시적으로 요청하면 체크포인트를 선택한다. 그러면 종합된 설계를 보여 주고 승인을 받을 때까지 멈춘다.

어느 쪽이든 종합본은 **foundational-thinking** 원칙 스킬의 "scaffold first" 방식으로 별도 커밋으로 낼 수 있다. **outcome-oriented-execution** 원칙 스킬에 따라, 채워 넣는 동안 계획되고 범위가 정해진 깨짐은 괜찮다. 구현 전에 설계에 적대적 압력을 가하려면 종합된 스케치에 **interrogate** 스킬을 실행한다.

사람이 형태에 이의를 제기하면(체크포인트에서든 사후든) 그것을 Phase A의 증거로 다룬다. 코드를 더 쓰기 전에 다시 grounding하고 Phase B를 다시 실행한다.

## Phase D: Implement against the sketch

`not implemented` 본문을 코드로, 의사코드를 로직으로 바꾼다. 종합된 스케치가 계약이다. 스케치에서 벗어나는 것은 조용히 흡수할 마찰이 아니라 드러내야 할 신호다. 함수에 스케치가 예상하지 못한 파라미터가 필요하면 물어본다. 스케치가 틀렸는가, 요구사항을 놓쳤는가, 구현이 과하게 나아간 것인가.

## Phase E: Scrap when the architecture is wrong

구현에서 스케치가 흡수하지 못하는 마찰이 계속 나오면 스케치를 버린다. **redesign-from-first-principles**와 **fix-root-causes** 원칙 스킬에 따라 틀린 설계에 수정을 덧대지 않는다.

신호는 개별 사례가 아니라 *패턴*이다. 징후:

- 같은 형태의 우회책이 관련 없는 코드 곳곳에 반복해서 나타난다.
- 관련 없는 엣지 케이스 여러 개가 모두 특수 분기를 요구한다.
- 컴파일하려면 탈출구(`any`, 캐스트, 실제로는 항상 설정되는 optional 필드)가 필요한 타입.
- 스케치가 상태는 공유되지 않는다고 했는데 "락이 필요하다"는 반사 반응이 나온다.
- 호출자가 추상화를 쓰려면 그 내부 규칙을 알아야 한다.
- 구현 전반에서 같은 형태의 Phase D 이탈이 독립적으로 둘 이상 나온다.

판단해서 쓴다. 엣지 케이스 몇 개로 아키텍처를 단죄하지 않는다. 어떤 문제는 정당하게 복잡하다. 데이터의 복잡성은 설계의 복잡성이 아니다.

버릴 때:

1. 지금까지 만든 것에 **how** 스킬을 다시 실행한다.
2. 새 제약이 첫날부터의 가정이었던 것처럼 다시 설계한다(redesign-from-first-principles).
3. **subtract-before-you-add** 원칙 스킬에 따라 더하기 전에 뺀다. 새 스케치는 커지기 전에 옛 스케치보다 작아야 한다.
4. Phase B로 돌아가 arena를 다시 실행한다.

## Outputs

호출자의 사용법을 먼저 쓰고, 타입 스케치는 거기서 도출한다. 작은 변경이면 새 타입과 시그니처를 담은 파일 하나. 큰 작업이면 모듈 지도와 타입 정의. rationale은 `references/rationale-template.md`에 맞춘 형태로 함께 낸다. 사용법 스케치와 종합 결정을 포함한다.
