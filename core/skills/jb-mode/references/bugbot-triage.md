# CodeRabbit triage

Babysit playbook(`../playbooks/babysit.md`)이 CodeRabbit이나 리뷰 자동화 댓글을 처리할 때 이 참조를 쓴다. 목표는 CodeRabbit을 기본으로 무시하는 것이 아니다. 목표는 모든 댓글을 반드시 해야 할 코드 변경으로 취급하는 일을 멈추는 것이다.

## Decision rubric

행동하기 전에 각 CodeRabbit 스레드를 분류한다:

- `fix`: 댓글이 그럴듯한 정확성, 보안, 개인정보, 데이터 손실, 인증, 결제, 마이그레이션, 멱등성, race, 또는 출시된 동작 문제를 짚는다. 그 코드를 소유하는 가장 아래쪽 PR에서 고친 뒤, 커밋 SHA로 답글을 달고 스레드를 resolve한다.
- `dismiss`: 댓글이 문서화된 저위험 잡음 패턴에 맞고, 현재 코드/맥락이 그 우려에 코드 변경이 필요 없음을 증명한다. 짧은 이유로 답글을 달고 스레드를 resolve한다.
- `ask`: 댓글이 새로운 유형이거나, 심각도가 높거나, 보안/개인정보/데이터 관련이거나, 모호하다. 추측하지 말고 사용자에게 묻는다.

애매하면 묻는다. 잡음 같은 코드 품질 댓글을 건너뛰는 비용은 작다. 실제 데이터 버그나 보안 버그를 건너뛰는 비용은 작지 않다.

## Learned pattern format

앞으로의 패턴은 이 형태로 추가한다:

```markdown
### <short pattern name>

- Confidence: candidate | recurring | strong
- Skip when: <conditions that must be true>
- Do not skip when: <risk boundaries>
- Example signal: <phrases or code context that identify the pattern>
- Source: <PR/comment URL or short historical note>
```

예시가 한두 개면 `candidate`를 쓴다. 실제 기각이 여러 번 쌓인 뒤에는 `recurring`을 쓴다. `strong`은 패턴이 좁고, 반복해서 검증됐고, 위험이 낮을 때만 쓴다.

## Recurring skip candidates

### Intentional UI or design-system visual changes

- Confidence: candidate
- Skip when: PR 설명, 스크린샷, 디자인 리뷰, 또는 주변 코드가 시각적 변경을 명시하고, CodeRabbit 댓글은 공유 시각 기본값이 바뀌었다는 사실을 되풀이할 뿐이다.
- Do not skip when: 댓글이 접근성, focus 가시성, 키보드 탐색, 색 대비, 또는 PR이 의도적으로 바꾸지 않은 컴포넌트 API 계약을 가리킨다.
- Example signal: focus outline, 버튼 크기, 간격, 공유 컴포넌트의 시각 기본값에 관한 댓글에 owner가 "intentional"이나 "intended"라고 답한 경우.

### Upstack or stack-local usage CodeRabbit cannot see

- Confidence: candidate
- Skip when: CodeRabbit이 export, 컴포넌트, helper, 파일을 미사용으로 지적하고, GitHub PR 목록과 diff, 위쪽 stack의 diff, 또는 PR 맥락이 stack의 뒤쪽 PR에서 그것을 쓴다는 것을 보여 준다.
- Do not skip when: 현재 PR이 stack에 속하지 않거나, 그 심볼이 공개 API이거나, 위쪽 stack에서 쓴다는 주장을 검증할 수 없다.
- Example signal: "Exported component is never used"에 사람이 "used upstack"처럼 답한 경우.

### Temporary duplication during parallel implementation

- Confidence: candidate
- Skip when: 삭제되거나, 교체되거나, 검증 중인 옛 경로와 새 경로를 나란히 유지하려고 PR이 의도적으로 적은 양의 코드를 중복한다.
- Do not skip when: 중복된 코드가 보안, 결제, 데이터 접근, API 동작을 바꾸거나, 오래 쓸 공유 추상화가 위험을 분명히 줄여 준다.
- Example signal: "Significant duplication"이나 "duplicated validation logic"에 owner가 옛 경로는 삭제될 것이라거나 중복 로직은 의도적으로 로컬에 둔 것이라고 설명한 경우.

### Existing framework or component invariant covers the warning

- Confidence: candidate
- Skip when: 그 우려를 현재 diff나 주변 코드에 보이는 공유 컴포넌트, 프레임워크 계약, 타입 불변식, 또는 단일 진실 공급원이 이미 보장한다.
- Do not skip when: 불변식이 가정만 되고 강제되지 않거나, 타이밍에 의존하거나, 값이 갈라질 수 있는 async/상태 경계를 넘는다.
- Example signal: 공유 popover가 viewport 경계를 강제하는데 안쪽 popover에 max-height가 없다는 댓글, 또는 지역에서 검사한 값과 넘기는 값이 같은 출처를 공유하는데 nullable 값을 지적하는 댓글.

### Owner-declared follow-up or deferred cleanup

- Confidence: candidate
- Skip when: PR owner가 그 문제를 알려진 후속 작업이라고 명시하고, 현재 PR이 그 동작을 더 나쁘게 만들지 않으며, 댓글이 고위험 영역에 관한 것이 아니다.
- Do not skip when: 에이전트가 owner 입력 없이 움직이거나, 문제가 중간/높은 심각도의 제품 동작이거나, 미루면 새 회귀가 merge된다.
- Example signal: "I'll worry about that later"나 "we'll delete this eventually".

### Self-withdrawn or explicit false-positive rule comments

- Confidence: recurring
- Skip when: 댓글 본문이나 이후 CodeRabbit 답글이 그 지적을 철회했다, 규칙을 준수한다, 또는 false positive라고 명시하고, 에이전트가 관련 규칙을 로컬에서 검증할 수 있다.
- Do not skip when: 고위험 문제에 대해 사람이 설명 없이 "false positive"라고 한 것이 유일한 증거다.
- Example signal: 본문에 파일이 이미 규칙을 준수한다고 적힌 파일 이름 규칙 댓글.

## Ask by default

이전 PR이 비슷한 것을 기각했더라도, 다음 범주는 자동으로 건너뛰지 않는다:

- 보안, 개인정보, 인증, 결제, 데이터 보존, 학습 데이터, 권한 경계에 관한 지적.
- 심각도가 높은 지적.
- 마이그레이션, 스키마, 멱등성, 동시성, 시스템 간 동작에 관한 지적.
- 제안된 수정이 작고, 제품 의도를 바꾸지 않으면서 위험을 분명히 줄이는 댓글.

과거 데이터를 보면 사람이 보안/데이터 흐름 댓글을 기각한 경우가 가끔 있었다. 그런 경우는 팀 전체의 건너뛰기 규칙이 아니라 owner의 판단으로 취급한다.

## Candidate learnings from recent babysits

팀에 유용해 보이지만 아직 성숙하지 않은 후보 학습은 babysit 도중이나 이후에 여기에 덧붙인다. 여러 PR이 패턴을 확인하면 반복되는 후보를 위 절로 올리는 쪽을 택한다.

### Manual reimplementations of native browser behavior

- Confidence: candidate
- Skip when: 사실상 없다. diff가 브라우저 기본 동작을 수동 구현으로 대체하면(native sticky → JS로 위치를 잡는 복제본, native scroll targeting → 전달된 wheel/touch 이벤트, paint-order occlusion → mask/clip-path), 그 코드에 대한 리뷰 봇의 로직 버그 지적은 일관되게 정당했다.
- Do not skip when: 지적이 이벤트 전달의 빈틈(wheel deltaMode, touch pan, 가장자리의 scroll-chaining, tap slop), mask/clip의 hit-testing 불일치, 또는 그런 코드에서 observer와 React 상태 사이의 타이밍 race에 관한 것이다. 기본은 fix다.
- Example signal: "masks do not affect hit-testing", "overlay blocks wheel scroll", "ignores deltaMode", "runs in the IntersectionObserver callback before React applies state".
- Source: sticky-occlusion PR 하나. 리뷰 봇 패스 여섯 번, 지적 약 열여덟 개, 모두 기각하지 않고 고쳤다.

### Contract-test drift claims are cheaply verifiable — run the test first

- Confidence: candidate
- Skip when: 검증 자체는 절대 건너뛰지 않는다. 명령 하나면 된다. PR이
  프로토콜이나 문서 산문을 고정하는 contract test(SKILL.md에 대한 정규식,
  문서 문구의 snapshot)를 함께 내보내고, CodeRabbit이 "the test no longer
  matches the doc"(또는 그 반대)라고 주장하면, 분류하기 전에 PR tip에서 그
  테스트를 돌린다. 빨간 결과는 주장을 경험적으로 확인하고, 초록 결과는
  기각 답글에 쓸 구체적 반증이다.
- Do not skip when: n/a — 이것은 검증 지름길이지 기각 패턴이 아니다.
  반복 패스에서 기각 쪽으로 기우는 휴리스틱은 여기서 오작동할 것이라는 점에 주의한다.
  산문을 고정하는 테스트가 어긋나는 것은 정확히 앞선 수정 라운드들이 산문을 고치기 **때문**이다.
- Example signal: 앞선 수정 커밋이 고정된 문단을 바꿔 쓴 PR에서 "Contract test
  omits the pre-fix wait"라는 지적. tip에서 돌린 테스트가 정확히 지적된
  단언에서 실패했다.
- Source: 리뷰 봇 패스 여덟 번을 거친 산문 고정 PR 하나. 앞선 패스가 모두
  고쳐지고 resolve됐는데도 7번째 패스의 주장은 사실이었다.

### Stale security-review finding already fixed later in the same PR

- Confidence: candidate
- Skip when: agentic security review(또는 비슷한 것)가 authz/검증 호출이 빠졌다고 주장하는데, 현재 PR tip에 바로 그 게이트가 (테스트와 함께) 분명히 들어 있다. 보통 리뷰가 돈 뒤의 hardening 커밋에서 추가된 경우다.
- Do not skip when: 인용된 helper가 논의 중인 principal에게는 no-op이거나, 검사가 그것이 막으려는 부수 효과 뒤에 실행되거나, 주장된 principal에 대한 커버리지가 없다.
- Example signal: tip에서 바로 그 가드가 부수 효과 전에 이미 호출되는데 HIGH "missing authorization check" 지적이 나온 경우.
- Source: hardening 커밋이 리뷰 실행보다 나중이었던 webhook 엔드포인트 PR 하나.

### Widening a deliberately narrow error condition would mask the real error

- Confidence: candidate
- Skip when: 지적이 좁은 에러 조건(특정 `errno`, 에러 코드, 상태 클래스)을
  catch-all로 넓히라고 요구하고, 그 좁음이 실제 구분을 담고 있다. 대표적인
  형태는 `ENOENT`로 제한한 의존성 fallback이다. "바이너리가 설치되지 않음"은
  "명령이 실행됐고 실패함"과 다른 상황이다. 0이 아닌 모든 종료 코드에서
  재시도하면 정당한 실패(not found, 만료된 인증, 네트워크)를 fallback으로 다시
  실행하고, fallback의 에러를 보고해 진짜 에러를 가린다.
- Do not skip when: 좁은 조건이 바로 **같은** 범주의 경우(`EACCES` 같은 또 다른
  "바이너리를 쓸 수 없음" errno, 또 다른 전송 계층 실패)를 놓치거나, 처리되지
  않은 경로가 데이터를 잃거나 부분 상태를 남기거나, 재시도가 멱등이고, **그리고 동시에**
  원래 에러도 여전히 드러난다.
- Example signal: "only retries when X fails with ENOENT … never tries the
  fallback even when a working Y exists"라는 지적이 실패한 동작이 아니라
  없는 의존성 때문에 fallback이 있는 코드를 가리키는 경우.
- Source: fallback이 실패한 명령이 아니라 없는 바이너리 때문에 존재했던
  CLI 이름 변경 PR 하나.
