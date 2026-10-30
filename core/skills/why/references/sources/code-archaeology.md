# Code Archaeology (git + in-repo)

## What this source contains

- 커밋 이력 (메시지, 날짜, 작성자, diff)
- PR 설명, 리뷰 댓글, 논의 스레드 (`gh`로)
- 인라인 코드 주석, TODO, FIXME, deprecation 노트
- ADR(architectural decision record). 레포가 두는 경우
- 테스트. 이름과 assertion에 변경의 동기가 된 엣지 케이스가 인코딩되어 있는 경우가 많다
- 같은 커밋에서 수정된 관련 파일 (co-change 신호)
- 레포 안의 CHANGELOG 항목과 릴리스 노트
- 커밋 메시지와 PR 본문의 이슈/티켓 ID

코드에 직접 묶여 있어서 가장 신뢰할 수 있고 가장 완전한 출처다. 레포를 거친 것은 모두 여기에 있어야 한다.

## How to search it

시드 커밋 목록을 넓힌다:

```bash
# History through renames
git log --follow --oneline -- <file>

# Pickaxe: commits that added or removed this exact text
git log -S '<exact_string_from_code>' -- <file>

# Or for patterns:
git log -G '<regex>' -- <file>

# Who wrote each line and when
git blame -L <start>,<end> <file>

# One commit's full diff
git show <hash>

# Commits between two points affecting this file
git log <old>..<new> -p -- <file>
```

대역 외(out-of-band) 문서를 찾는다:

```bash
# ADRs often live in docs/adr/ or similar
rg -l -i 'architecture.decision' --glob '*.md'

# TODOs and FIXMEs near the target
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <target_file>

# Related tests
rg -l '<symbol>' --glob '*test*'
```
