---
name: unslop
description: 모든 글에서 AI 티를 걷어낸다.
disable-model-invocation: true
---

# Unslop

텍스트를 고쳐 AI 패턴을 없앤다. 아래 패턴을 훑은 뒤 다시 쓴다. 뜻을 보존하고 의도한 어조에 맞춘다.

## Patterns to detect and fix

규칙 번호는 다른 스킬이 인용하는 고정 id다. 삭제된 규칙은 빈 번호로 남는다.

### Content

3. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". 지우거나 실제 출처로 풀어 쓴다.
5. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some critics argue". 출처를 밝히거나 지운다.

### Language

7. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. 평이한 단어로 바꾼다.
8. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". "is"나 "has"라고 쓴다.
9. **"Not just X, but Y."** 대신 요점을 직접 말한다.
10. **Rule of three.** 생각을 억지로 셋씩 묶지 않는다. 자연스러운 개수를 쓴다.
11. **Synonym cycling.** Protagonist, main character, central figure, hero를 한 문단에 모두 쓰는 것. 하나를 골라 반복한다.
12. **False ranges.** X와 Y가 의미 있는 척도 위에 있지 않은 "from X to Y". 주제를 바로 나열한다.

### Style

13. **Em dash overuse.** 엠 대시를 아예 쓰지 않는다. 마침표나 쉼표만 쓴다(괄호, 엔 대시, 대시 대용 하이픈도 안 된다). 생각을 떼어놓아야 하면 문장을 끝내거나 쉼표를 쓴다.
14. **Colon overuse.** 콜론은 목록이나 예시 앞에서는 괜찮지만, 문장 중간의 연결어로는 안 된다. "If you're coming from traditional automation: instead of registering event handlers, you describe conditions"는 콜론이 아무것도 더하지 않는다. 비교 틀 없이 요점이 스스로 서도록 다시 쓴다. "Describing when the scheduler should fire works best as plain English." 뜻은 같고, 기댈 구두점은 없다.
15. **Boldface overuse.** 고유명사나 약어마다 굵게 쓰지 않는다.
16. **Inline-header lists.** 티가 나는 지점은 줄 내용을 되풀이하는 굵은 레이블과 콜론이다. "**Performance:** Performance improved...". 이런 것은 산문으로 바꾼다. 마침표로 끝나고, 항목 이름을 밝히고, 뒤에 정말 새로운 세부가 오는 굵은 도입부("**Schema in TypeScript.** Tables live in one file.")는 괜찮다. 티가 아니다.
17. **Title case headings.** sentence case를 쓴다.
18. **Decorative emojis.** 제목과 불릿에서 지운다.
19. **Curly quotes.** 곧은 따옴표를 쓴다.

### Communication artifacts

20. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" 지운다.
22. **Sycophantic tone.** "Great question! You're absolutely right!" 바로 답한다.

### Filler

23. **Filler phrases.** "In order to"는 "To"로, "Due to the fact that"은 "Because"로 바꾼다. "It is important to note that"은 지운다.
24. **Excessive hedging.** "could potentially possibly be argued that it might"은 "may"로 바꾼다.
25. **Generic conclusions.** "The future looks bright." 구체적인 계획이나 사실을 쓴다.

### Jargon

26. **Abstract metaphor nouns.** Substrate (base), wedge, wedge in (add), vector (way, method), locus, vantage, nexus, primitive as a noun, harness as a metaphor, surface as in "API surface", bedrock, scaffolding as a metaphor, modality, paradigm, gold-plating (more than the job needs), ratchet as a metaphor (the mechanism's real name, or a limit that only tightens), evacuate for moving code (move out), endgame (the last phase), north star, flywheel. 이런 말은 기술적으로 읽히지만 대개 더 평이하고 구체적인 단어가 있다. 구체적인 단어를 고른다.

### Plain speech

27. **Say what it does, not how it feels.** "the database stays close at hand", "SQL you can read", "types that follow your schema"는 느낌을 이름 붙인 것이다. 고치려면 메커니즘이나 숫자를 쓴다. "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". 그 문장이 독자에게 무엇을 하거나 알라고 말하는지 물은 다음 그것을 쓴다. 구체적인 지시, 사실, 숫자로 다시 말할 수 없다면 지운다. 한 가지 더 확인한다. 그 문장이 다른 프로젝트의 문서에 그대로 나와도 어색하지 않다면, 이 프로젝트에 대해 아무 말도 하지 않은 것이다. 지운다.
28. **Shorten or split dense sentences.** 독자가 문장을 해석하려고 되돌아가야 한다면 둘로 나누거나 절을 덜어낸다. 문장 하나에 생각 하나를 담는다.
29. **Active voice.** 능동태를 우선한다. "is/are/was/were + past participle"를 잡아서 행위자를 밝힌다. "queries are validated"는 "the compiler validates queries"로, "the file is parsed by the loader"는 "the loader parses the file"로 바꾼다. 수동태는 행위자를 모르거나 정말로 중요하지 않을 때만 괜찮다.
30. **Cut adverbs, or use a stronger verb.** "runs quickly"는 "is fast"나 그 수치로, "significantly improves"는 측정된 변화량으로 바꾼다. 약한 동사를 부사로 떠받치고 있다면 동사가 틀린 것이다.
31. **Prefer the plain word.** "utilize"와 "leverage"는 "use"로, "facilitate"는 "help"로, "numerous"는 "many"로, "in the event that"은 "if"로 바꾼다. 더 멋 부린 동의어가 더 분명한 경우는 드물다.
32. **Mannered prose.** 글자 그대로의 표현이 있는데 은유나 수사를 쓰는 것. 아포리즘("wire it or delete it"), 효과를 노린 수사적 파편, 의인화된 코드("the plan holds it"), 비유 동사("rides along", "stands on"), 상투적인 틀 문구. "A dial worth turning"은 "a parameter worth varying"으로 바꾼다. 하려는 말을 그대로 한다. 은유 명사는 26번 규칙이 다룬다.
33. **Over-compression.** 관사 생략, 동사 없는 파편, 기호 말투, 독자가 읽는 대신 해독하게 만드는 약어. "Parser rejects bad date → exit 2, no write"는 "The parser rejects a bad date, exits with code 2, and writes nothing."으로 바꾼다. 관사와 동사를 갖춘 온전한 문장을 쓰고, 화살표와 약어는 풀어 쓴다.
