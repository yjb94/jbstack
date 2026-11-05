### Opening a PR

다른 모든 playbook의 끝에서 호출된다. 레포가 브랜치 이름, base 브랜치, 커밋이나 PR 형식을 정해 두었으면 여기 기본값보다 레포의 값을 쓴다.

**Worktree.** main에서 딴 git worktree에서 작업한다. 서브에이전트는 그것을 물려받는다. 같은 브랜치에 대한 여러 `Agent` 호출은 각자 자기 worktree를 받거나, 호출 사이에 `git fetch && git reset --hard origin/<branch>`를 한다. 관련 없는 작업이 섞인 dirty 브랜치: patch로 빼내고, 새 worktree를 만들고, 적용한다. 엉킨 worktree: main에서 reset하고, 최소한으로 다시 한다. worktree에서 작업했으면 보고에 그 경로, 거기서 앱을 실행하는 방법, 확인할 것을 적는다.

**Commits.** 커밋은 자주 한다. PR을 열기 전에 작고 순서 있는 커밋으로 rebase한다. 커밋 하나하나가 미래의 PR이다: 머지 가능하고, 이야기를 전하는 순서로 놓인다. 수정이 방금 만든 커밋에 속하면 amend한다. 분리할 수 있으면 새 커밋을 만든다. 커밋 본문은 제목을 되풀이하지 않는다.

**Critic.** `gh pr create` 바로 전에 jb-mode의 `jbstack:critic` 트리거를 실행한다. 신뢰 단계 1에서는 push하거나 PR을 열지 않고 로컬 커밋에서 멈추고 보고한다. critic은 그 보고 전에 실행한다. critic 표의 미확정 행을 하나하나 보고에 나열한다. PR 본문에는 넣지 않는다. 같은 빈틈이 두 번째로 나오면 `maintain-verification-skill`로 검증 표면을 넓힌다.

**PRs.** 커밋 전에 diff에 `/deslop`을, 리뷰 전에 `/no-comments`를 실행한다. 모든 PR 제목, 설명, 커밋 본문은 `/technical-writing`으로 쓰고(Diátaxis를 뺀 모든 층, 그리고 STE 어휘 규칙 적용: 동작 하나에 단어 하나, 관사 유지, 통하는 곳에서는 `-ing`보다 평범한 동사), 그다음 `/unslop`을 적용한다.

**Titles.** Conventional Commits `type(scope): subject`, 끝에 마침표 없음. type은 `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf` 같은 것이다. scope는 `pstack`이나 `jb-mode` 같은 영역이다. subject는 짧고, 명령형이고, 변경을 실어 나르는 실제 심볼이 있으면 그 이름을 쓴다. 예: `fix(pstack): retarget opening-a-pr babysit trigger`.

**Descriptions.** PR 본문은 diff를 가진 리뷰어를 위한 1분짜리 브리핑이지, 실험 노트가 아니다. 변경이 왜 존재하는지, 무엇을 빼 두었는지, 무엇을 깨뜨릴 수 있는지, 동작함을 어떻게 증명했는지를 말한다. 짧고 단순한 문장, 적은 식별자로 쓰고, 글의 벽을 만들지 않는다. 본문은 squash 커밋 본문이 되므로 글을 대략 40줄 아래로 유지한다. 그림과 도식은 이 줄 수에 세지 않는다. 굵은 머리말이 아니라 `##` 제목을 이 순서로 쓰고, 할 말이 없는 절은 뺀다:

- `## Why`: 목표, 문제, 접근 순서로 짧은 문장 1–3개. 첫 문장은 사용자의 목표다. 문제 문장은 그 목표를 지금 무엇이 막는지 말한다. 접근 문장은 그 문제를 어떻게 풀었는지 말한다. 세 문장이 이어지지 않으면 빠진 전제를 채운다. 글 뒤에 그림 하나를 넣는다. 화면이 바뀌면 변경 전과 변경 후를 나란히 놓고, 화면이 바뀌지 않으면 문제와 접근을 보여 주는 `mermaid` 도식을 넣는다. 오타나 문구만 고친 PR은 그림을 뺀다. SHA, rebase 계보, "based on main" 같은 서두는 없다.
- `## What changed`: 먼저 `mermaid` 도식 하나, 그다음 짧은 bullet 1–3개. 도식은 동료 개발자가 diff를 열기 전에 무엇이 바뀌었는지 알게 한다. 데이터나 호출이 흐르는 순서대로 노드를 놓는다. 흐름이 없으면 구조가 놓인 순서를 따른다. 노드마다 `기존`, `신규`, `변경`, `삭제` 중 하나를 붙이고, 그 노드가 하는 일을 한 줄로 적는다. 한 줄 수정처럼 그릴 구조가 없으면 도식을 뺀다. bullet은 도식과 같은 내용을 글로 말한다. `git log`는 도식을 그리지 않기 때문이다. 실제 심볼이나 경로는 그것이 변경을 실어 나를 때만 이름을 쓴다. 이름 변경이나 재지정은 양쪽 이름을 모두 쓴다.
- `## Scope`: 항상 넣는다. 무엇을 다루고 무엇을 일부러 빼 두었는지(후속 작업, 알려진 빈틈) 짧은 항목 1–3개. 심볼, 경로, 파일별 에세이는 없다.
- `## Tradeoffs`: 적어 두지 않으면 리뷰어가 물어볼, 기각한 대안만. 진짜 선택이 없었으면 뺀다.
- `## Blast Radius`: 두 부분으로 나눈다. 이 절 안에서만 굵은 도입부를 쓴다. `**사용자 영향.**`은 누구에게 닿는지와 그 사람에게 무엇이 달라지는지 1–2문장. `**코드 영향.**`은 동료 개발자가 자기 코드의 동작이 바뀌는지 알게 하는 bullet 1–4개다. 각 bullet은 `바뀐다.`, `안 바뀐다.`, `위험.` 중 하나로 시작한다. `바뀐다.`는 동작이 달라지는 기존 코드 경로, `안 바뀐다.`는 리뷰어가 걱정할 만하지만 그대로인 경로, `위험.`은 깨질 수 있는 것과 그 대비다. main이 red면 red로 두는 비용을 적는다.
- `## Verification`: bullet 1–3개, 각각 실제 실행 경로와 그 결과. 성능: 단위가 붙은 주요 수치 하나, `before → after`, 나머지는 arena나 swarm 디렉터리 링크. 표본 크기 방법론, swarm 나열, 지표 표는 없다.

`## What changed` 도식의 예:

```mermaid
flowchart LR
	A["기존: 캐릭터 적용"] --> B["신규: useRecentActors<br/>actor id를 MMKV에 저장"]
	B --> C["신규: CastingRecentActorList<br/>모달 맨 위에 가로 목록"]
```

절들 뒤에는, 주장을 증명할 때 영상이나 스크린샷을 붙인다. 전체 SHA, swarm이나 arena lane 나열, lever 보정 에세이, 파일별 체크리스트, "CLEAN" 판정은 본문이 아니라 링크한 산출물에 넣는다.

**Forge.** 모든 PR 작업에 GitHub CLI(`gh`)를 쓴다. Graphite(`gt`)를 요구하지 않는다.

**Size and stacks.** 큰 PR 하나보다 좁은 PR 다섯 개를 선호한다. 스택은 base 브랜치의 사슬이다. 루트 PR은 trunk를 대상으로 한다. 각 자식 브랜치는 부모의 정확한 tip 위로 rebase하고, 그 PR은 부모 브랜치를 대상으로 한다. 자식은 `gh pr create --base <parent-branch>`로 만들고, 재지정은 `gh pr edit <pr> --base <parent-branch>`로 한다. trunk에서 브랜치를 따는 것은 독립된 작업일 때만이다. 스택에 큰 작업을 하기 전에 trunk 위로 rebase한다.

**Readiness.** 모든 PR은 ready로 열고, 절대 draft로 열지 않는다. `gh`에서는 `--draft`를 뺀다. 그래도 PR이 draft로 열리면 `gh pr ready <number>`를 실행한다. PR 상태를 언급하기 전에 `gh pr view <number>`를 실행한다.

**Babysit.** PR을 연다고 babysit이 시작되지 않는다. URL을 올리고 계속 만든다. phase나 스택을 먼저 끝낸다. 스택 전체가 생긴 뒤 사용자가 요청할 때만 별도의 babysit 패스를 실행한다. 새 PR마다 babysit하면 빌드가 멈추고, 나중 wave가 다시 시작할 커밋에 검사를 낭비한다. 피드백이 의도에서 벗어나면 반박한다.

PR을 여는 서브에이전트는 `/deslop`과 `/no-comments`를 실행하고, URL을 올린다. babysit하지 않고 부모에게 돌아간다.
