---
name: principle-migrate-callers-then-delete-legacy-apis
description: "옛 호출자가 남아 있는 상태에서 새 내부 API를 도입할 때 적용한다. 호환 레이어를 보존하지 말고, 같은 웨이브에서 호출자를 이전하고 옛 API를 삭제한다."
disable-model-invocation: true
---

# Migrate Callers Then Delete Legacy APIs

- 테스트는 새 계약을 단언하도록 바꾸고, 리팩터링 이전의 구현 세부만 지키는 테스트는 삭제한다

**적용되는 경우:**
- 하위 호환성에 의존하는 외부 사용자가 없다
- 프로젝트가 조율된 호환성 파괴 변경을 감당할 수 있다
- 새 API가 단순화나 리팩터링 이니셔티브의 일부다
