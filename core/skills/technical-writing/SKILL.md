---
name: technical-writing
description: "계층형 기술 문서 작성 표준이다. Diátaxis 구조, Google developer style 문장, STE 지시문 규칙, Global English 구문을 쓴다. /technical-writing에 쓰거나, 문서, RFC, readme, PR 설명, 커밋 메시지를 쓰거나 검토할 때 쓴다."
disable-model-invocation: true
---

# Technical writing

지친 엔지니어가 처음 읽고 이해하도록 쓴다. 네 계층을 모두 적용한다.

계층 위에 규칙 세 개가 있다.

- **Cut every word that does no work.** 단어 하나를 빼도 문장이 살아남으면 그 단어를 뺀다. "In order to"는 "to"다. "It is important to note that"은 아무것도 아니다.
- **Use the short, everyday word.** "Use", not "utilize". "Help", not "facilitate". "Do", not "perform". 긴 단어는 정확성으로 그 길이의 값을 치러야 한다.
- **When a rule makes a sentence worse, fix the sentence another way or leave it alone.** 모든 규칙을 따랐는데 기계가 쓴 것처럼 들리는 문장은 실패한 것이다.

코드베이스가 단어 목록이다. 동의어나 설명이 아니라 실제 심볼, 파일, 플래그, 명령 이름을 쓴다.

전문 용어를 지어내지 않는다. 개발자가 소리 내어 말할 단어를 쓴다. "move", "delete", "a budget that only decreases"이지, "evacuate", "ratchet", "endgame"이 아니다. 이름 붙은 패턴은 문서가 처음에 그 뜻을 말해주면 괜찮다. 새로운 문제 단어와 그 대체어는 `unslop`의 abstract-metaphor 규칙에 대한 추가안으로 diff와 함께 답변에 제안한다. 그 스킬은 수정하지 않는다.

## Vary the rhythm

문서가 모든 계층을 지켜도 기계가 쓴 것처럼 읽힐 수 있다. 모든 문장이 짧게 끊기고, 어디에도 관점이 없고, 구체적인 것이 없는 경우다.

- 문장 길이를 일부러 섞는다. 짧은 문장은 요점을 꽂는다. 긴 문장은 사실을 그 조건이나 결과와 함께 나른다.
- 문장 하나에 생각 하나라는 것이 문장마다 길이 하나라는 뜻은 아니다. 생각 둘을 담은 문장은 나눈다. 생각 하나를 담은 긴 문장은 둔다.
- 모드가 허용하는 곳에서는 관점을 가진다. explanation은 트레이드오프를 저울질하니, 장단점을 나열하는 대신 그것을 어떻게 보는지 말한다. reference는 건조하게 둔다.
- 무미건조한 것보다 구체적인 것을 쓴다. "schema changes can cause issues"가 아니라 "a column rename fails the build".

## Pick the mode first (Diátaxis)

문서 하나에 모드 하나. 질문 둘이 모드를 고른다. 내용이 행동(doing)을 위한 것인가 이해(thinking)를 위한 것인가, 그리고 배움에 쓰이는가 일에 쓰이는가.

- 행동 + 배움: **tutorial**.
- 행동 + 일: **how-to**.
- 이해 + 일: **reference**.
- 이해 + 배움: **explanation**.

나침반은 문서 전체에도, 문장 하나에도 쓴다.

**Tutorial: learning by doing.** 학습자의 성공은 학습자가 아니라 작성자의 일이다. 학습자가 "learn"할 것이 아니라 만들 것을 말하며 시작한다. 모든 단계가 눈에 보이는 결과를 일찍, 자주 낸다. 무엇이 보여야 하는지 알려준다. 기대하는 출력, 프롬프트 변화, 로그 한 줄이다. 설명은 한 절과 링크로 줄인다. 구체적으로 쓴다. "we"로, 명령형으로 쓴다. "First, do x. Now, do y."

**How-to: steps to a goal.** 기계가 수행할 수 있는 연산이 아니라 사람이 가진 문제를 푼다. 숙련도를 가정하고 가르치지 않는다. 행동만 쓴다. 곁가지, 배경, 완전성 자체를 위한 서술은 넣지 않는다. 대신 링크한다. 갈림길과 판단은 허용한다. "If you want x, do y." 가이드 이름은 작업으로 짓는다. "How to calibrate the radar array"이지 "Radar array calibration"이 아니다.

**Reference: facts for lookup.** 서술만 한다. 지시도, 설득도, 의견도 없다. 건조하고, 완전하고, 확신 있게 쓴다. 사실, 옵션, 한계, 오류를 얼버무리지 않고 말한다. 기술 대상의 구조를 거울처럼 따라가서 코드와 문서를 함께 탐색할 수 있게 한다. 독자가 기대하는 자리에 내용을 둔다. 가능하면 코드에서 생성한다.

**Explanation: understanding and why.** 경계가 있는 주제 하나이며 제품에서 떨어져서도 읽힌다. 각 제목은 앞에 암묵적인 "About..."을 붙여도 어색하지 않아야 한다. 실제 why 질문에 닻을 내린다. 맥락을 준다. 설계 결정, 역사, 제약, 대안이다. 의견은 여기서만 허용되고 다른 곳에서는 안 된다.

모드를 섞지 않는다. tutorial 안에 reference 표를 넣지 않고, reference 안에서 tutorial처럼 손을 잡아주지 않고, how-to 안에서 논쟁하지 않는다. 나누고 링크한다.

## Write sentences to the reader (Google developer style)

- 독자에게 "you"로, 현재 시제로 말한다. "Will"은 정말로 나중에 일어나는 일에만 쓴다.
- 누가 무엇을 하는지 말한다. "is checked"가 아니라 "the compiler checks". 수동태는 행위자를 모르거나 중요하지 않을 때만 괜찮다.
- 지시는 명령형으로 쓴다. "Click Submit." 사실은 담담하게 쓴다. "should be done"은 절대 쓰지 않는다.
- 조건을 지시 앞에 둔다. "To delete the document, click Delete."
- 흔한 경우를 먼저 쓴다. 예외는 뒤에 쓴다.
- 아는 것이 많은 친구처럼 말한다. 유행어도, 비유적 표현도, 지시문의 "please"도 쓰지 않고, 절차에서 "simply", "easy", "quickly"도 절대 쓰지 않는다. 간단했다면 독자는 여기 없었을 것이다.
- 미리 알리지 않고("we will soon support...") 연속한 문장을 같은 구절로 시작하지 않는다.
- 링크가 어디로 가는지 말하는 단어로 링크한다. 페이지 제목이나 짧은 설명이다. "click here"는 절대 안 된다. 페이지 밖으로 나가는 링크보다 페이지 안의 맥락 한 문장을 우선한다.
- 제목은 주제만이 아니라 요점을 담는다("Modes"가 아니라 "Pick the mode first"). sentence case를 쓴다. 작업 제목은 동사구 그대로 쓴다("Create an instance"). 개념 제목은 명사구로 쓴다. 페이지당 h1은 하나만 쓰고 레벨을 건너뛰지 않는다.
- 순서가 있으면 번호 목록을 쓰고, 나머지는 모두 불릿을 쓴다. 목록은 완전한 문장으로 소개한다. 항목은 평행하게 맞춘다.
- 코드는 code 글꼴로 쓰고 UI 요소는 굵게 쓴다. 직렬 쉼표를 쓴다. "etc."는 빼고, 목록이 일부라는 것을 앞에서 말한다.

## Make statements load one at a time (STE rules)

- 지시 하나에는 문장 하나를 쓴다. 그 밖에서는 문장 하나에 생각 하나를 담는다.
- 약 20단어보다 긴 지시와 약 25단어보다 긴 다른 문장은 나눈다.
- 경고나 조건은 그것이 지키는 단계 앞에 둔다. "If hot oil touches your skin, injuries can occur."
- "the"와 "a"를 남긴다. "Remove backup file"은 두 가지로 읽힌다. "Remove the backup file"은 한 가지로 읽힌다.
- 단어마다 뜻 하나와 역할 하나를 주고, 유지한다. "check"가 inspect를 뜻한다면 restrain에도 쓰지 않는다.
- 동작마다 단어 하나를 골라 고수한다. "start"이지, 여기서는 "start"이고 저기서는 "initiate"가 아니다.
- 절차는 직접 명령으로 쓰고, 서술체나 수동태는 절대 쓰지 않는다. "Install the component"이지 "the component must be installed"가 아니다.
- 가능하면 "-ing" 단어를 피한다.

## Leave no sentence open to two readings (Global English)

- "only"나 "not" 같은 단어는 그것이 바꾸는 단어 옆에 둔다. "only fails on growth"와 "fails only on growth"는 다른 말이다.
- 긴 명사 나열을 끊는다. "the proto import budget check script"는 "the script that checks the proto-import budget"가 된다.
- "it", "they", "this"가 모두 분명한 하나를 가리키게 한다. 의심스러우면 명사를 반복한다. "this"나 "which"로 절 전체를 가리키지 않는다.
- 동사를 빼먹지 않는다. "Phase 1 moves the converters and Phase 2 the runtime"은 Phase 2에 동사가 없다. 동사를 준다.
- "Ensure that the switch is off"의 "that"처럼 구조를 보여주는 작은 단어를 남긴다. 단어 수 때문에 명확성을 맞바꾸지 않는다.
- 오독을 막을 수 있으면 나열에서 관사를 반복한다. 둘이 별개라면 "the client and host"가 아니라 "the client and the host".
- 문장이 두 가지로 묶일 수 있으면 "and"나 "or"가 무엇을 잇는지 말한다. "Both...and", "either...or", "if...then"은 공짜 중의성 해소 장치다.
- 세미콜론이 아니라 마침표를 쓴다. 엠 대시는 새 문장으로 바꾼다.
- 괄호 안의 글은 문법적으로 온전한 단위나 별도 문장으로 만든다. "(s)"로 복수형을 절대 만들지 않는다.
- 슬래시를 쓰지 않는다. "a/b"나 "and/or" 대신 "a, b, or both"라고 쓴다.
- 각 대상을 어디서나 이름 하나로 부른다. 한 가지를 "the gate", "the ratchet", "the budget check"라고 부르는 문서는 세 가지를 가르친다. 바뀌지 않은 것을 바꾸지 않는다.
- 관용구, 구어체, 라틴어 약어, 은유는 쓰지 않는다.

## Voice and repo specifics

- 이 스킬이 건드리는 모든 문서에 **unslop** 스킬을 적용한다. slop 패턴 목록(AI 어휘, 군더더기, 얼버무림, 서식 티)은 그 스킬이 소유한다.
- PR 설명과 커밋 메시지도 글이다. Diátaxis를 제외한 모든 계층이 적용된다. PR 본문은 리뷰어가 1분 안에 읽는 브리핑이다. 스웜 로그, SHA 목록, 지표 표를 붙여 넣지 않는다. 링크한다.
- 제품 UI 문자열은 문서가 아니다. 그런 것은 제품의 카피 가이드라인을 쓴다.
- 코드 스니펫은 탭으로 들여쓴다. 실제 경로를 쓴다. 개수나 트리에 대한 모든 주장은 그것을 반영하는 커밋에서 참이 되게 하고, 그것을 다시 생성하는 명령을 함께 적는다.

## Worked example

Before:

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

After:

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.
