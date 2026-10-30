# Source playbooks

why 스킬은 사용 가능한 증거 범주마다 investigator 하나를 띄우고, 각자 아래의 출처별 playbook 하나를 읽는다. playbook은 흔한 MCP에 대한 구체적인 예시다. 같은 범주의 다른 MCP에는 맞춰서 쓴다.

| Category | Playbook | Example MCP it documents |
|---|---|---|
| 소스 컨트롤 이력 | [`code-archaeology.md`](./sources/code-archaeology.md) | git, `gh` |
| 이슈 / 티켓 트래커 | [`linear.md`](./sources/linear.md) | Linear (Jira, GitHub Issues, Plane, Shortcut에는 맞춰 쓴다) |
| 장문 문서 | [`notion.md`](./sources/notion.md) | Notion (Confluence, Google Docs, Coda에는 맞춰 쓴다) |
| 실시간 팀 채팅 | [`slack.md`](./sources/slack.md) | Slack (Discord, Microsoft Teams, Mattermost에는 맞춰 쓴다) |
| 인프라 observability | [`datadog.md`](./sources/datadog.md) | Datadog (New Relic, Honeycomb, Grafana, Splunk에는 맞춰 쓴다) |
| 에러 / 예외 추적 | [`sentry.md`](./sources/sentry.md) | Sentry (Rollbar, Bugsnag, Airbrake에는 맞춰 쓴다) |
| 제품 분석 웨어하우스 | [`databricks.md`](./sources/databricks.md) | Databricks SQL (Snowflake, BigQuery, ClickHouse, dbt에는 맞춰 쓴다) |

범주를 가로지르는 것:

- [`incident-postmortem.md`](./sources/incident-postmortem.md). 대상 코드가 방어적으로 보이면(null 검사, 재시도, 타임아웃, rate limit, feature flag, egress guard, OOM handler) 이것을 더한다.
