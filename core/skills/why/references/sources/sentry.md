# Sentry Error History

## How to search it

Sentry MCP를 쓴다.

1. **방향을 잡는다.** 프로젝트 slug와 조직을 모르면:

   ```
   find_organizations
   find_projects
   ```

2. **대상과 관련된 이슈를 검색한다.**

   ```
   search_issues (natural language, e.g., "errors in PaymentService timeout", "unhandled exceptions in uploadFile")
   ```

   대상이 처리하는 예외 클래스 이름, 함수나 클래스 이름, 대상이 검사하는 에러 메시지 문자열, 파일 경로로 쿼리를 만든다.

3. **릴리스와 시간 구간으로 좁힌다.**

   ```
   search_issue_events (filter by release, time, environment, trace ID, tags)
   get_issue_tag_values (for an issue, see distribution across versions, users, environments)
   ```

   의심되는 이슈는 **first seen**과 **last seen**(멈춘 시점이 대상의 출시일과 맞는가?), **영향받은 릴리스**(어느 릴리스에서 발생했고, 어느 것이 수정이었는가?), **빈도 추이**(급증했다가 해결되었는가?)를 확인한다.

4. **맥락을 위해 전체 이벤트를 가져온다.**

   ```
   get_sentry_resource (pass a Sentry URL or type+ID)
   ```

   스택 트레이스가 대상 코드를 지나가는가? 태그와 breadcrumb이 대상이 방어하는 조건과 맞는가?

5. **대상 근처에 landing한 릴리스를 확인한다.**

   ```
   find_releases (around the commit date of the target)
   ```

   릴리스 버전을 PR의 머지 날짜와 교차 확인한다.

6. **Seer는 아껴서 쓴다.**

   ```
   analyze_issue_with_seer
   ```

   Seer의 AI 근본 원인 분석은 가설 생성기다. 권위 있는 것이 아니라 추론으로 취급한다. 실제 이벤트와 스택 트레이스가 일차 증거다.

## What to return

관련 이슈마다:
- 이슈 ID와 제목
- 프로젝트와 조직
- First seen / last seen 타임스탬프
- 이벤트 수 (알면 샘플링 비율도)
- 영향받은 릴리스
- 대상과의 관련성을 보여 주는 대표 스택 트레이스 조각 (요약이 아니라 원문 발췌)
- 대상의 출시일과 First/last-seen의 상관관계
- 이슈 링크
- 작성자의 댓글이나 해결 노트
