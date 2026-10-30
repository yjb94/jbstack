# jbstack

jaybe의 Claude Code 하네스 (pstack 구조).

## 준비물

`node`, `gh`(로그인 상태), `bun`(babysit의 `watch-pr`).

## 설치

```
claude plugin marketplace add yjb94/jbstack
claude plugin install jbstack@jbstack
claude plugin marketplace update jbstack && claude plugin update jbstack@jbstack
```

**주의:** 설치하면 그 맥의 모든 레포에서 push·PR guard hook이 켜집니다. 신뢰 단계 파일이 없는 레포는 1단계라서 `git push`와 `gh pr create`가 막힙니다.

## 레포마다 할 일

신뢰 단계(0 커밋 없음, 1 로컬 커밋, 2 push와 PR)는 직접 적습니다. 에이전트는 이 파일을 고칠 수 없습니다.

```
mkdir -p .claude && echo '{"trust":2}' > .claude/jb.local.json
echo .claude/jb.local.json >> .git/info/exclude
```

exclude에 넣지 않으면 작업 트리가 dirty로 남아 `write-verdict`가 판정을 거부합니다.
