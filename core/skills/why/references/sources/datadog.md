# Datadog Telemetry

## What this source contains

Datadog에는 런타임 기록, 즉 계획되거나 논의된 것이 아니라 프로덕션에서 실제로 일어난 일이 있다.

- **Metrics.** 팀이 계측한 카운터, 게이지, 히스토그램. metric이 *존재한다는 것* 자체가 누군가 그 숫자를 지켜볼 가치가 있다고 생각했다는 증거다.
- **Monitors & alerts.** 팀이 누군가를 깨울 만하다고 결정한 조건. `rate_limit_hit > 10/min`에서 울리는 monitor는 팀이 그 임계값을 걱정했다는 직접 증거다.
- **Dashboards.** 팀이 서브시스템에서 중요하다고 보는 것을 큐레이션한 뷰.
- **APM traces & spans.** 요청 수준 런타임 데이터. "왜 느린가" / "여기서 왜 타임아웃이 나는가" 질문용.
- **Logs.** 대량의 이벤트 기록. 방어 코드의 동기가 된 에러 조건이 담겨 있는 경우가 많다.
- **Incidents.** 타임라인과 연결된 postmortem이 있는 공식 인시던트 기록.
- **Notebooks.** 팀의 탐색적 조사. 가설과 분석이 담겨 있는 경우가 많다.

## How to search it

Datadog MCP를 쓴다. 넓게 시작해서 좁힌다.

1. **소유 서비스를 파악한다.**

   ```
   search_datadog_services (filter by name or team)
   search_datadog_service_dependencies (see upstream/downstream)
   ```

2. **대시보드와 monitor를 먼저 본다.**

   ```
   search_datadog_dashboards (query: feature name, service name, symbol)
   search_datadog_monitors   (same queries)
   ```

   대시보드나 monitor가 대상을 다루면 그 쿼리와 감시하는 임계값을 기록한다. 임계값이 "왜 N에서 제한되는가?"의 답인 경우가 많다.

3. **대상 주변의 metric.**

   ```
   search_datadog_metrics (by name pattern, e.g., the feature or symbol)
   get_datadog_metric_context (metadata: description, units, tags)
   get_datadog_metric (timeseries; "was there a spike around the PR date?")
   ```

   metric의 추이를 대상의 추가/변경 날짜와 맞춰 보는 것은 강한 보조 증거다: "`payment_timeout` metric은 2023-11-03에 급증했고, 재시도 로직은 2023-11-06에 머지되었다."

4. **Logs. 쏟아내지 말고 좁힌다.**

   ```
   search_datadog_logs (raw log patterns near the target, set use_log_patterns=true)
   analyze_datadog_logs (SQL-style aggregations, only when you need counts)
   ```

   심볼, 에러 문자열, 기능 이름으로 검색한다. **시간을 한정한 쿼리를 강하게 선호한다** (예: 변경 전후 30일).

5. **APM span과 trace.**

   ```
   aggregate_spans    (stats: "how often does this endpoint fail?")
   search_datadog_spans (inspect individual spans)
   get_datadog_trace  (a specific trace ID)
   ```

   타임아웃, 재시도, 느린 경로, 서비스 간 동작에 유용하다.

6. **Incidents.**

   ```
   search_datadog_incidents (by title, team, date range)
   get_datadog_incident     (full detail for a specific incident)
   ```

   대상이 방어적으로 보이면 추가된 무렵의 인시던트를 검색한다. 타임라인에 "added defensive check for X"가 있는 인시던트는 거의 직접 증거다.

## What good evidence looks like here

- 쿼리와 임계값이 코드가 강제하는 제약과 맞는 monitor (코드는 100으로 제한하고, monitor는 요청이 100/min을 넘으면 알린다)
- 대상의 작성자가 만든 대시보드로, 위젯이 코드가 측정하거나 막으려는 것과 대응하는 것
- 코드가 머지되기 직전에 프로덕션 급증을 보이고 이후 안정된 값을 보이는 metric
- 대상 코드, 같은 심볼, 같은 에러 문자열을 참조하는 인시던트 기록
- 방어 코드가 막았을 특정 에러 패턴을 보여 주고, 변경 이전 구간에 타임스탬프가 찍힌 로그

## Common pitfalls

- **상관관계는 인과관계가 아니다.** PR 전의 급증과 이후의 안정화는 시사적일 뿐 확정적이지 않다. 같은 구간에 다른 변경이 landing했을 수 있다. 인접한 PR을 확인한다.
- **찾은 차트에 과적합하기.** 차트는 만든 사람의 프레이밍을 반영한다. "retry success rate"라는 이름의 차트는 팀이 재시도 성공에 신경 썼다는 증거이지, 특정 코드 줄이 존재하는 이유가 아니다.
- **사라진 텔레메트리.** metric은 이름이 바뀌거나, 삭제되거나, 보존 기간이 짧을 수 있다. 해당 구간의 데이터를 찾지 못하면 null 결과가 아니라 gap이다.
- **규모에서 오는 노이즈.** 로그 검색은 서비스, 태그, 시간 구간으로 공격적으로 좁힌다. 원본 로그를 쏟아내지 말고 `analyze_datadog_logs`로 집계한다.
- **계측됨 != 원인.** metric은 누군가 무언가를 측정할 만큼 신경 썼다는 것을 보여 줄 뿐, 코드가 그것 *때문에* 추가되었다는 것은 아니다. 커밋/PR 날짜와 교차 참조한다.

## What to return

관련 항목마다:
- 유형 (dashboard / monitor / metric / log pattern / trace / incident / notebook)
- 제목 또는 이름
- 링크 또는 식별자 (대시보드 ID, monitor ID, metric 이름, 인시던트 ID)
- 소유자/작성자와 생성/수정 날짜
- 질문과 관련된 구체적인 조건, 쿼리, 인용 (가능하면 원문 그대로)
- 관련성: 이것이 대상 코드에 대해 시사하는 바와 연결의 강도
