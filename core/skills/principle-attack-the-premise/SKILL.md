---
name: principle-attack-the-premise
description: "같은 전제를 공유하는 수정이 둘 이상 같은 게이트에서 실패했을 때 적용한다. 그 전제를 가정하는 수정을 또 쓰기 전에, 전제를 글로 적고 직접 시험한다."
disable-model-invocation: true
---

# Attack the Premise

같은 전제를 공유하는 수정이 둘 이상 같은 게이트에서 실패했다면, 수정이 아니라 전제를 의심한다.

**이유:** 실패한 수정은 모두 그 수정이 가정한 믿음에 반하는 증거다. 같은 전제 위에서 세 번째 수정을 하면, 증거가 이미 원인이 아니라고 말하는 곳에 노력을 쓰게 된다.

**패턴:**
- **전제를 글로 적는다.** 전제는 실패한 모든 수정이 가정한 한 문장이다.
- **다음 수정 전에 전제를 시험한다.** 전제가 틀렸다면 다르게 나올 관찰을 찾아 직접 해 본다. 실패가 얼마나 큰지만 보지 말고 어떻게 분포하는지도 본다. 그 확인은 [Build the Lever](../principle-build-the-lever/SKILL.md)에 따라 다시 실행할 수 있게 만든다.
- **증거를 따른다.** 증거가 전제와 모순되면 원인은 다른 곳에 있다. 전제가 예측하지 못한, 실패들의 공통점을 찾는다. 증거가 전제를 확인해 주면 [Fix Root Causes](../principle-fix-root-causes/SKILL.md)에 따라 다음 "왜"를 묻는다. 앞선 수정들은 원인이 아니라 결과를 다뤘을 수 있다.
- **조건을 보정하지 말고 없앤다.** [Laziness Protocol](../principle-laziness-protocol/SKILL.md)에 따른다. 증거가 어떤 부분이 늘 지는 쪽에 놓인다고 보여 주면, 그렇게 놓이게 하는 것을 바꾼다. 뒤처리를 하는 장치는 원인을 그대로 두고 매 실행마다 일을 더한다.

**중단:** 전제를 적고 시험하기 전에는 다음 수정을 시작하지 않는다.

이 원칙은 [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md)와 다르다. 그쪽은 새 요구사항을 중심으로 설계를 다시 짓는다. 이 원칙은 현재 설계가 가정하는 사실을 의심한다.
