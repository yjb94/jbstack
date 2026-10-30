# Notion Docs

## What this source contains

- PRD (product requirement document)
- 기술 spec과 RFC
- ADR (architectural decision record)
- 설계 리뷰 회의록
- 도메인 맥락이 담긴 팀 페이지
- 인시던트 postmortem
- 방어 코드를 설명할 수 있는 runbook
- 우선순위를 정하는 전략 문서

Notion은 "why"가 코드가 되기 전에 장문으로 존재하는 경우가 많은 곳이다. 중요한 기능에는 대개 문서가 있다.

## How to search it

Notion MCP를 쓴다.

1. **`notion-search`로 키워드를 검색한다.** 시도할 것:
   - 기능 이름
   - 대상 코드의 핵심 심볼 / 클래스 이름
   - 작성자 핸들 (설계 문서는 코드가 landing하기 전에 작성되는 경우가 많다)
   - 에러 문자열이나 사용자에게 보이는 용어
   - 코드가 출시된 시점을 알면 시간 구간을 한정한 쿼리
2. **`notion-fetch`로 후보 페이지를 가져온다.** 미리보기가 아니라 전체 내용을 읽는다. 근거는 문서 중간에 묻혀 있는 경우가 많다.
3. **백링크와 하위 페이지를 따라간다.** 설계 문서에는 검토한 대안, 부록, 구현 노트용 하위 페이지가 있는 경우가 많다.
4. **관련 데이터베이스를 확인한다.** `notion-query-data-sources`와 `notion-query-meeting-notes`로 그 결정을 논의한 회의록이 나올 수 있다.
5. **작성자 개인 공간을 검색한다.** PR 작성자에게 개인 노트가 있다면(일부 회사에서는 흔하다), 코드에 앞선 탐색적 생각이 담겨 있을 수 있다.

## What good evidence looks like here

- 대상 코드의 목적과 맞는 "Problem statement"나 "Motivation" 절이 있는 PRD
- "Alternatives considered"나 "Rejected approaches" 절
- 대상 코드를 특정 인시던트의 수정으로 지목하는 postmortem
- "Y 때문에 X로 결정했다"고 기록하고 PR과 같은 작성자/기간에 연결되는 회의록
- 내용 있게 채워진 ADR 템플릿 (status, context, decision, consequences)

## Common pitfalls

- **오래된 문서.** spec은 구현 전에 쓰이고 갱신되지 않는 경우가 많다. 문서가 바뀐 계획을 설명하고 있을 수 있다. 실제 PR과 교차 확인한다.
- **문서와 현실의 어긋남.** spec은 "X를 하겠다"고 하는데 코드는 실제로 Y를 할 수 있다. 어긋남을 표시한다. synthesizer가 모순을 드러낼 것이다.
- **상투적인 템플릿.** 어떤 조직은 "Why" 절을 요구하지만 군더더기로 채운다. 구체성을 찾는다.
- **연결되지 않은 문서.** 가장 관련 있는 문서가 어디에서도 링크되지 않았을 수 있다. 넓은 키워드 검색이 도움이 된다.
- **여러 초안.** 주제에 문서가 여러 개면 확정되었거나 가장 최근에 갱신된 것을 찾는다. 날짜를 확인한다.
- **접근이 제한된 페이지.** 페이지에 접근할 수 없으면 gap으로 기록한다.

## What to return

관련 문서마다:
- 제목과 URL
- 작성자와 마지막 갱신일
- 동기를 설명한 텍스트 (원문 인용). 페이지/절 위치를 함께
- 관련 링크된 페이지 (synthesizer가 인용할 수 있게)
- 문서가 확정본인지 초안인지
