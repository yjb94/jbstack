# Incident & Postmortem Context

- **Linear**: `incident`, `sev-*`, `postmortem-action-item`, `reliability` 라벨이 붙은 티켓을 찾는다
- **Slack**: 대상 코드가 추가된 날짜 무렵의 `#sev-*`, `#incident-*` 채널을 검색한다
- **Git**: "fix for incident", "add defensive check", "revert" 다음에 "re-apply with..."가 오는 식의 커밋 메시지는 강한 신호다
