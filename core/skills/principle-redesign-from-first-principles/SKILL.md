---
name: principle-redesign-from-first-principles
description: "기존 설계에 새 요구사항을 통합할 때 적용한다."
disable-model-invocation: true
---

# Redesign From First Principles

변경을 통합할 때는 기존 설계에 덧붙이지 않는다. 그 요구사항이 처음부터 기초 가정이었던 것처럼 다시 설계한다.

- 영향받는 파일을 모두 읽고 현재 설계를 이해한다
- 묻는다. "이 새 요구사항을 두고 처음부터 쓴다면 무엇을 만들겠는가?"
- 변경을 모든 참조에 전파한다. 타입, 문서, 예시, 근거 절.
- 재설계 전체를 생각하되, 전달은 점진적으로 한다

이것은 기존 설계에 변경을 통합할 때 선택 가치를 지키는 방법이다.
