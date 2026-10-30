---
name: principle-laziness-protocol
description: "리팩터링할 때, diff 크기를 평가할 때, 추상화·레이어·신호를 여러 층에 걸쳐 넘기는 것을 추가하고 싶어질 때 적용한다. 삭제와, 문제를 푸는 가장 작은 변경 쪽으로 치우친다."
disable-model-invocation: true
---

# Laziness Protocol

- **결정을 통합한다.** 같은 선택을 여러 곳에서 반복하지 않는다. 단일 진실 공급원 뒤에 두고, 결과는 단순한 플래그로 넘긴다.
- **diff를 최소화한다.** 문제를 푸는 가장 작은 변경을 한다. 줄이 적은 쪽이 "우아한" 보일러플레이트보다 낫다.
