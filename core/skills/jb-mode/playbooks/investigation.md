### Investigation

**답은 네가 책임진다. 계획하고, 경로를 정하고, 쓴다.**

Investigation 요청은 읽기 전용이다. 코드 변경이 아니라 출처를 단 설명이나 권고를 낸다.

1. **how** 스킬로 보낸다. 동기를 묻는 질문이면 **why** 스킬로도 보낸다.
2. throughput checkpoint는 한 줄로 둔다: `throughput checkpoint: n/a, read-only investigation`.
3. `how` 형태의 출력(Overview / Key Concepts / How It Works / Where Things Live / Gotchas)을 내거나, 요청이 대안 사이의 결정이면 tradeoff 표가 있는 권고를 낸다.
4. 회신에 **unslop** 스킬을 적용한다.

조사가 코드 변경보다 먼저 오는 경우가 아니면 PR도, babysit도, `architect`도 없다. 먼저 오는 경우라면 사용자에게 넘기고 Bug fix나 Feature로 다시 보낸다.

**회신:** 조사 출력. "확실해?" 류의 답에는 이유와 함께 진짜 판단을 담는다. 전제가 틀렸으면 반박한다(Autonomy 참고).
