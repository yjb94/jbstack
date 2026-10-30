# Databricks Analytics & System Tables

## What this source contains

Databricks는 제품 분석, 데이터 파이프라인, 웨어하우스 텔레메트리 계층이다. Datadog을 보완한다. Datadog은 *인프라/런타임* 관점이고, Databricks는 *제품/데이터* 관점이다 (사용자가 무엇을 했는지, 어떤 실험이 돌았는지, 기능 사용이 어떻게 변했는지, 임계값 상수가 어디서 왔는지).

- **Product analytics events.** `your_warehouse.events.analytics_track_event`(원본)와 `<your_analytics_db>.<schema>.<table>`의 타입이 지정되고 중복이 제거된 이벤트별 dbt 모델. 사용자 행동: 기능 호출, 클릭, 수락/거절, 제출, 클라이언트가 보고한 에러.
- **Usage & billing events.** `your_warehouse.events.usage_event` / `<your_analytics_db>.<schema>.stg_usage_events`, `your_warehouse.events.raw_model_event` / `<your_analytics_db>.<schema>.stg_raw_model_events`. 비용이나 물량이 이끈 결정용.
- **Experiment / feature-flag data.** 노출(exposure)과 결과 테이블. **스키마는 회사마다 다르다.** 이름을 가정하기 전에 `SHOW TABLES`로 탐색한다.
- **System tables.** `system.query.history`, `system.compute.warehouses`, `system.billing.*`, `system.access.audit`. "이 쿼리가 비쌌나?", "이걸 누가 얼마나 자주 돌렸나?", "웨어하우스 부하는 언제 치솟았나?"에 답한다.
- **dbt lineage.** `<your_analytics_db>.<schema>`의 모델은 어떤 파이프라인이 테이블/필드에 의존하는지 드러낸다. 업스트림 변경이 소비자 코드 변경의 동기가 되는 경우가 잦다.
- **Databricks notebooks.** 엔지니어가 코드 변경 전에 쓴 탐색적 분석. **SQL MCP로는 조회할 수 없다.** 근거가 notebook에 있다고 의심되면 gap으로 명명한다.

## How to search it

Databricks SQL MCP를 쓴다. 주 도구: `execute_sql_read_only`. `statement_id`가 돌아오면 다시 실행하지 말고 `poll_sql_result`로 폴링한다.

**쿼리하기 전에 방향을 잡는다.** 스키마는 회사마다 다르다. 테이블 이름을 믿기 전에 탐색한다:

```sql
SHOW TABLES IN <your_analytics_db>.<schema> LIKE '*<keyword>*';
DESCRIBE TABLE <your_analytics_db>.<schema>.stg_<event>;
```

**모든 쿼리에 시간 한정을 건다.** 이 테이블들은 거대하고 제약 없는 스캔은 타임아웃된다. 출시일을 감싸는 구간(보통 전후 약 30일, 강한 이유가 있을 때만 더 넓게)으로 `_timestamp`(이벤트) 또는 `start_time`(`system.query.history`)을 필터링한다.

**원본 테이블보다 타입이 지정된 dbt 모델을 선호한다.** `<your_analytics_db>.<schema>.<table>`은 중복이 제거되고, 타입이 지정되고, liquid-clustered 되어 있다. `your_warehouse.events.analytics_track_event`는 중복이 있고 `properties_json`의 타입이 없다. 모델 이름 패턴: `stg_<source>_<event_name_with_underscores>`이며 `<source>`는 `app`, `backend`, `website`, `cli` 중 하나다. 패턴만으로 정해지지 않으면 `SHOW TABLES`로 정확한 모델 이름을 확인한다. dbt 모델이 아직 없거나 dbt 갱신 지연 안쪽의 이벤트가 필요할 때만 원본 테이블로 내려간다.

**타입이 지정된 dbt 모델의 컬럼 관례** (알아 두면 `DESCRIBE` 왕복을 줄인다):

- `_timestamp`, `_id`, `_auth_id`, `_request_id`, `event_name`. 모든 모델의 표준
- `properties_<name>`. 타입이 지정되고 언더스코어 표기인 이벤트 속성 (`properties_entrypoint`, `properties_size_bytes`, ...)
- `context_team_id`, `context_client_version`, `context_country`, `context_client_os`. 미리 추출된 클라이언트 맥락

### Investigation patterns that tend to pay off

대상에 맞는 테이블 + 컬럼 조합을 고른다:

1. **이벤트 사용 추이.** PR 머지 전후 ±30일 구간에서 해당 `stg_*` 모델의 일별 건수. 머지 하루이틀 안에 0에서 안정적인 물량으로 계단 함수처럼 오르면 PR이 기능을 출시했다는 강한 정황 증거다. 0으로 감소하면 deprecation이나 삭제를 시사한다.
2. **가드레일 / 방어적 검사의 기원.** PR *이전* 14일 동안 해당 `properties_<name>` 컬럼의 분포(median / p99 / max). p99가 대상의 임계값 상수와 일치하면 그 숫자가 데이터로 정해졌음을 시사한다.
3. **실험 / feature-flag 조회.** `SHOW TABLES ... LIKE '*experiment*'`로 노출 테이블을 찾고, PR 날짜 무렵 해당 flag 키의 variant별 노출 건수를 가져온다.
4. **마이그레이션, 백필, 성능 재작성의 쿼리 이력 증거.** 짧은 `start_time` 구간과 `statement_text ILIKE '%<table_or_symbol>%'`로 필터링한 `system.query.history`는 변경의 동기가 되었을 비싼 쿼리를 드러낸다 (`total_duration_ms`로 정렬하거나 `SUM(read_bytes)`, `COUNT(*)`로 집계).
5. **dbt lineage.** 대상이 `<your_analytics_db>.<schema>` 모델에서 읽거나 쓰면, 그 모델 자체의 git 이력(이 레포 안에 있다)에 근거가 담겨 있는 경우가 많다. 직접 쫓지 말고 그 단서를 git investigator에게 넘긴다.

## What good evidence looks like here

위의 패턴 모양 외에:

- 방어 코드 PR 후 며칠 동안 에러를 분류하는 이벤트의 건수가 거의 0으로 떨어진다. PR이 그 에러 부류를 해결했음을 시사한다
- 노출 테이블의 행이 대상의 feature-flag 키를 지목하고, PR 출시 날짜 무렵의 "shipped" / "concluded" 결정이 있다

## Common pitfalls

- **계측됨 ≠ 원인.** 이벤트가 존재한다는 것은 누군가 로그를 남길 만큼 신경 썼다는 뜻이지, 대상 코드가 그것 *때문에* 존재한다는 뜻이 아니다. 인과를 주장하기 전에 git investigator의 PR/커밋 인용과 짝을 맞춘다.
- **조용한 계측 변경.** 이벤트 물량의 계단 함수는 사용자 행동이 바뀐 것이 아니라 새 이벤트를 로깅하기 시작한 것을 뜻할 수 있다. 증가를 기능 출시 신호로 읽기 전에 같은 구간의 계측 PR을 확인한다.
- **스키마 drift.** 이벤트 속성은 진화한다. 지금 타입이 지정된 dbt 모델에 있는 컬럼이 대상이 작성되던 때는 없었을 수 있다. 더 오래된 데이터는 속성을 원본 `properties_json` 안에만 가지고 있을 수 있다.
- **dbt 갱신 지연.** `<your_analytics_db>.<schema>.*`는 일정에 따라(대개 매시간/매일) 재빌드된다. 최근 몇 시간의 이벤트는 `your_warehouse.events.*`로 돌아가 `_id`로 중복을 제거한다.
- **회사별 테이블.** 실험, feature-flag, billing, usage 테이블은 제각각이다. 존재를 확인하지 않은 테이블의 결과를 보고하는 것은 전형적인 실패 방식이다. 먼저 `SHOW TABLES` / `DESCRIBE TABLE`로 탐색한다.
- **보존 절벽(retention cliff).** 관련 구간이 테이블의 보존 기간이나 dbt 모델 생성일보다 이르면, 그것은 null 결과가 아니라 *gap*이다. synthesizer가 "결과 없음"을 "활동 없음"으로 읽지 않도록 명시적으로 명명한다.
- **notebook은 조회할 수 없다.** SQL MCP는 Databricks notebook을 볼 수 없다. 근거가 notebook에 있다고 의심되면 gap을 돌려준다.

## What to return

관련 발견마다:
- 유형 (product event / experiment exposure / usage or billing event / system-table row / dbt model)
- 정규화된 전체 이름의 테이블과 실제로 실행한 정확한 쿼리
- 질의한 시간 구간
- 간결한 수치 요약 (건수, percentile, 처음/마지막 관측 타임스탬프). **원본 행을 쏟아내지 않는다.**
- 대상의 출시일과의 시간적 상관 (예: "첫 행 2024-08-15, PR #49074 머지 2024-08-14")
- 관련성 + 강도: direct / circumstantial / weak
