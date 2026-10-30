---
name: how
description: "\"how does X work\" 질문, 무언가를 바꾸기 전의 코드 walkthrough, 배치·소유·계층 질문(\"where should this live\", \"which package owns this\", \"is this the right layer\")에 쓴다. 서브시스템 아키텍처, 런타임 흐름, 온보딩용 멘탈 모델을 설명한다. 동기는 why를 쓴다."
disable-model-invocation: true
---

# How

코드베이스를 탐색해 "how does X work?" 질문에 답한다. 서브시스템에 막 합류한 시니어 엔지니어에게 하는 수준의 아키텍처 설명을 만든다. 작동하는 멘탈 모델을 세울 만큼은 담고, 주석 달린 소스 코드처럼 읽힐 만큼은 담지 않는다.

띄우는 서브에이전트는 모두 `subagent_type: "Explore"`인 `Agent` 서브에이전트다. 브리프에 "do not edit files"도 적고, 끝난 뒤 `git status`를 확인한다. explorer는 `model: "sonnet"`을 쓰고, explainer는 모두 `model: "opus"`에 `effort: "xhigh"`를 쓴다. 각 서브에이전트의 추론 수준은 **jb-mode** 스킬의 Subagents 절에 따라 작업에 맞게 고른다.

## 1. Assess complexity

범위가 모호하면 해석을 밝히고 탐색한다. 사용자가 방향을 바꿀 수 있다.

- **단순** (모듈 하나, 작은 유틸리티, "how does function X work" 같은 좁은 질문): explorer를 띄우지 않는다. 탐색과 설명을 한 번에 하는 explainer 하나를 띄운다. `references/explainer-prompt.md`에서 explorer 결과 절을 뺀 프롬프트로 만든다. 4단계로 간다.
- **복잡** (여러 파일이나 서비스에 걸친 서브시스템, 횡단 기능, 전체 아키텍처 개관): 2단계로 간다.

애매하면 단순 경로를 택한다.

## 2. Explore (complex only)

질문을 2~4개 관점으로 나눈다. 각 관점은 서브시스템의 서로 다른 조각이다. explorer를 모두 한 메시지에서 띄운다. 각각 `references/explorer-prompt.md`에 자기 관점을 채워 넣는다.

## 3. Synthesize (complex only)

explorer가 모두 돌아오면 explainer 하나를 띄운다. `references/explainer-prompt.md`에 모든 explorer의 결과를 채워 넣는다.

## 4. Present

explainer의 출력을 제시한다. 명확성을 위한 가벼운 수정이나 대화 맥락의 보충은 괜찮다. 크게 다시 쓰지 않는다.

## Output format

설명은 `references/explainer-prompt.md`에 정의된 절을 쓰고, 해당하지 않는 절은 뺀다: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
