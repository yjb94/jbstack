---
name: why
description: "'why does X work this way', 'why we picked Y', 설계 근거, 회귀, postmortem, 데이터에 근거한 임계값에 쓴다. 사용 가능한 MCP를 찾아내고 증거 범주별(소스 컨트롤, 이슈 트래커, 장문 문서, 실시간 채팅, 인프라 observability, 에러 추적, 제품 분석 웨어하우스)로 병렬 조회한 뒤, 결정과 tradeoff에 대해 출처를 단 해석을 돌려준다. 런타임 동작은 how를 쓴다."
disable-model-invocation: true
---

# Why

코드 뒤에 있는 동기와 의도를 조사한다. 짝이 되는 `how` 스킬은 코드가 무엇을 하고 어떻게 동작하는지에 답한다. `why`는 어떤 힘이 코드를 지금의 형태로 이끌었는지에 답한다.

아래에서 띄우는 서브에이전트는 각각 모델을 명시한다. 각 서브에이전트의 추론 수준은 **jb-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.

띄우는 서브에이전트는 모두 `subagent_type: "general-purpose"`이고, 그래야 세션의 MCP 서버가 유지된다. **`Explore`를 쓰지 않는다.** MCP를 쓰는 investigator와 synthesizer의 인용 표본 확인에 MCP가 필요하다. 그래도 investigator는 아무것도 수정하거나 작성하지 않는다.

## Operating Posture

**신중하고 조심스럽고 정밀한 조사자**로 일한다. 아는 것과 추론하는 것을 솔직하게 구분한다. 신뢰도 프레임워크 전체와 표현 가이드는 `references/epistemics.md`를 읽는다. synthesizer는 이를 따라야 한다.

## Step 1. Understand the Target and the Question

**대상(target)**은 대개 코드 덩어리, 패턴, 기능, 이름 붙은 설계 결정이다. **질문(question)**은 대개 설계 근거, tradeoff, 동기가 된 엣지 케이스, 외부 제약, 죽은 코드, 또는 넓은 이력 훑기다.

대상이 모호하면("why do we do it this way?"만 있고 가리키는 것이 분명하지 않으면) 대화 맥락(열린 파일, 최근 수정, 커서 위치, 방금 논의한 것)에서 가장 그럴듯하게 추측한다. 틀렸을 때 사용자가 방향을 바꿀 수 있도록 해석을 짧게 밝히고 진행한다.

## Step 2. Establish the Code Anchor

investigator를 띄우기 전에 시드 맥락을 직접 만든다. 파일 경로와 줄 범위, 핵심 심볼(함수, 클래스, 상수), 대상을 건드린 최근 커밋 몇 개, 머지 커밋의 PR 번호(제목 줄의 `(#1234)` 패턴), 연결된 티켓 ID. 마지막으로 건드린 커밋은 `git blame -L <start>,<end> <file>`로, 이름 변경을 가로지르는 패치 포함 전체 이력은 `git log --follow -p -- <file>`로, PR 번호가 보이는 최근 커밋은 `git log --oneline -20 -- <file>`로, PR 번호 추출은 `git log -1 --format=%B <commit>`로 얻는다. 그다음 실질적인 커밋마다 PR 본문과 논의를 가져온다: `gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews`. 이 anchor를 모든 investigator와 synthesizer에게 준다.

## Step 3. Spawn Parallel Investigators

**기본은 전체 병렬 조사다.** 목표는 최소한이 아니라 완전한 커버리지 지도다. 검색을 건너뛰지 말고 없음(null)을 기록한다.

### Discovery

investigator를 띄우기 전에 세션의 도구 목록에서 사용 가능한 MCP를 나열한다. available-tools 지도가 있으면 그것을 쓴다.

사용 가능한 MCP를 각각 증거 범주 하나에 대응시킨다:

1. 소스 컨트롤 이력
2. 이슈 / 티켓 트래커
3. 장문 문서
4. 실시간 팀 채팅
5. 인프라 observability
6. 에러 / 예외 추적
7. 제품 분석 웨어하우스

소스 컨트롤은 git과 `gh`로 항상 쓸 수 있다. 나머지 여섯은 MCP 이름, 서버 지침, 도구 이름, 리소스 descriptor로 분류한다. MCP가 둘 이상의 범주에 맞을 수 있으면 주된 증거에 맞는 범주를 고른다. 모호한 경우는 커버리지 지도에 기록한다.

맞는 MCP가 있는 범주마다 investigator를 하나씩, 모두 한 메시지에서 띄워 동시에 돌린다. 각 investigator는 도구나 MCP를 정확히 하나만 맡는다. 에이전트 하나에게 MCP 여러 개를 맡기지 않는다. `model`: `"sonnet"`.

각 investigator의 프롬프트는 `references/investigator-prompt.md`를 채운 것에 다음을 더한 것이다:
- 선택한 MCP의 범주 playbook `references/sources/<source>.md`. `references/source-playbook.md`의 예시를 바탕으로 맞춘다
- **대상 코드가 방어적으로 보이면**(null 검사, 재시도 로직, 타임아웃 처리, rate limiting, feature flag, egress guard, OOM handler) `references/sources/incident-postmortem.md`
- code anchor와 사용자의 원래 질문

### Investigator roster, one per available evidence category

아래 범주는 각각 "why"의 한 가지 모양을 드러내는 데 독보적인 위치에 있고, 그것이 "강점" 뒤에 나온다. 무엇이 돌아올지 예상하고, 범주가 빈손으로 돌아왔을 때 gap을 명명하고, 드물게 무관함이 증명된 경우에만 건너뛰는 근거로 쓴다.

1. **소스 컨트롤** (git 이력, PR용 `gh`, 코드 주석, 테스트). 항상 띄운다. 유일하게 보장된 출처다. 강점: *리뷰 중에 포착된 구현 시점의 근거*.
2. **이슈 / 티켓 트래커** (예: Linear, Jira, GitHub Issues, Plane, Shortcut MCP). 강점: *제품 또는 비즈니스상의 강제 요인*. why가 엔지니어링 바깥에 있을 때 가장 강하다.
3. **장문 문서** (예: Notion, Confluence, Google Docs, Coda MCP). 강점: 코드가 되기 전에 글로 풀어 쓴 *장문의 설계 근거*.
4. **실시간 팀 채팅** (예: Slack, Discord, Microsoft Teams, Mattermost MCP). 강점: *문서까지 가지 못한 실시간 숙의*. 소스 컨트롤, 티켓, 문서의 기록이 빈약할 때 특히 중요하다.
5. **인프라 observability** (예: Datadog, New Relic, Honeycomb, Grafana, Splunk MCP). 강점: *코드를 낳은 인프라와 런타임의 현실*. 대상이 인프라 신호(타임아웃, 재시도, rate limit, circuit breaker)에 반응할 때 가장 강하다.
6. **에러 / 예외 추적** (예: Sentry, Rollbar, Bugsnag, Airbrake MCP). 강점: *방어 코드나 교정 코드를 낳은 구체적인 예외와 에러 궤적*. catch 블록, null 가드, 타입 검사, 재시도 같은 방어에 가장 강하다.
7. **제품 분석 웨어하우스** (예: Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift MCP). 강점: *코드를 빚은 제품과 데이터의 현실*. flag로 막힌 코드, 실험이 이끈 출시, 데이터 마이그레이션, "이 숫자는 어디서 왔나" 질문에 가장 강하다.

### When to skip an investigator

최종 Sources Consulted에 들어가는 **명시적이고 서면으로 된 근거**가 있을 때만 건너뛴다. 유효한 이유는 둘이다:

- 이 환경에 **그 범주의 MCP가 없다**. 선택이 아니라 gap으로 표시한다: "실시간 팀 채팅 건너뜀. 일치하는 MCP가 없어 대화 기록을 검색할 수 없었다."
- 출처가 "아마 무관할 것"이 아니라 **무관함이 증명되었다**. 기준이 높다: "에러 / 예외 추적 건너뜀. 대상은 런타임 코드 경로가 없는 빌드 시점 스크립트다."

범위 평가에서 대상이 단일 커밋짜리 사소한 것이고 PR 설명에 완전한 답이 이미 들어 있다고 보이면, 사용 가능한 일곱 범주 검색이 모두 중복일 것임을 확인한 **뒤에만** 직접 답해도 된다. 그렇다고 명시적으로 밝힌다. 이런 경우는 드물어야 한다.

## Step 4. Synthesize

synthesizer 하나를 띄운다. `model`: `"opus"`, `effort`: `"xhigh"`. 받는 것:
1. investigator의 결과. 모든 null 결과와 근거를 달고 건너뛴 범주를 포함한다
2. code anchor
3. 사용자의 원래 질문
4. `references/epistemics.md`의 epistemics 프레임워크
5. `references/synthesizer-prompt.md`의 synthesizer 프롬프트 템플릿

## Step 5. Present

synthesizer의 출력을 사용자에게 제시한다. 명확성을 위해 가볍게 수정하거나 대화의 맥락을 덧붙여도 되지만, **신뢰도 표현은 다시 쓰지 않는다**.

## Output Format

구조는 `references/synthesizer-prompt.md`에 있는 것이다: The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted, Confidence Summary. 필요하면 조정하되 신뢰도의 구분은 그대로 유지한다. Sources Consulted는 investigator마다 한 줄로 쓰고, 아무것도 돌려주지 못했거나 건너뛴 investigator도 이유와 함께 포함한다.

Sources Consulted 뒤에, 사용자의 `why` 질문이 이 코드를 바꾸기 위한 선행 작업이라면 계보(lineage) 발견을 변경 계획용 Preserve / Change / Avoid / Risk 제약 집합으로 바꾼다.

## Common Failure Modes to Avoid

- **최신성 편향(Recency bias)**. 가장 최근 커밋이 권위 있다고 가정한다. 현재의 형태는 여러 이전 결정이 쌓인 결과인 경우가 많다. 거슬러 올라가 추적한다.
