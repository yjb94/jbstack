# Explorer Prompt Template

이 템플릿으로 각 explorer 서브에이전트의 프롬프트를 만든다. placeholder를 채운다.

---

다른 explorer들이 같은 서브시스템의 다른 조각을 병렬로 조사하고 있다. 전부 다루려 하지 않는다. 맡은 관점에 집중해서 깊이 판다.

## Question

> {QUESTION}

## Your Exploration Angle

{EXPLORATION_ANGLE}

## Output

### Components Found
핵심 타입, 서비스, 클래스, 추상화. 각각 이름, 파일 경로, 하는 일을 한 문장으로 적는다.

### Flow
실행 흐름을 단계별로 적는다. 단계마다 어떤 함수/메서드가 실행되는지, 어느 파일에 있는지, 무엇을 하는지, 다음에 무엇을 호출하는지 적는다. 단계 사이를 흐르는 데이터도 포함한다.

### Files Read
탐색하며 읽은 모든 파일. explainer가 참조할 수 있게 한다.

### Boundaries
이 서브시스템이 코드베이스의 다른 부분과 만나는 곳. 입력과 출력.

### Non-Obvious Things
놀라운 것, 역사적 이유가 있는 것, 틀리기 쉬운 것. 한 방식으로 동작할 것 같은데 실제로는 다르게 동작하는 것.

### Open Questions
끝까지 추적하거나 이해하지 못한 것. 빈틈을 솔직하게 적는다.
