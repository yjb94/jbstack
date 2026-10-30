# Notes verification map

이 디렉터리는 Notes의 사용자 대면 동작을 검증하는 데 쓰는, 유지되는 원천이다. 앱을 구동하기 전에 색인을 읽고, 해당하는 기능 파일을 레시피로 쓴다.

## Baseline preconditions

- 일회용 데이터 디렉터리로 `http://127.0.0.1:4173`에서 Notes를 띄운다.
- 동시 실행이 상태를 공유하지 않도록 `NOTES_DATA_DIR=/tmp/notes-verify-$RUN_ID`를 설정한다.
- 제목이 `Quarterly plan`, `Grocery list`인 노트를 시드한다.
- `control-notes`와 `notes` CLI를 `PATH`에 둔다.
- `control-notes doctor`를 실행해 기대하는 URL, 데이터 디렉터리, 빌드 리비전을 요구한다.
- 이번 검증 실행이 시작하지 않은 인스턴스는 절대 구동하지 않는다.

## Driving conventions

- 사전 조건이 달리 말하지 않는 한 모든 레시피를 기준 상태에서 시작한다.
- CSS 셀렉터나 DOM 위치보다 ARIA role과 접근 가능한 이름을 우선한다.
- 모든 명령을 문자 그대로 다룬다. 따옴표 안의 이름과 플래그를 바꾸지 않는다.
- 브라우저 동작은 `control-notes browser`로 실행한다.
- 터미널 동작은 `control-notes cli -- <command>`로 실행한다.
- 변경 뒤에는 시드 데이터를 복원한다. cleanup에서 증명 아티팩트를 지우지 않는다.

## Proof and skip reporting

- 마지막 화면만이 아니라 사용자 동작과 그 결과 상태를 수집한다.
- UI 증명에는 ARIA 스냅샷과, 앱 정체성이 보이는 스크린샷을 포함한다.
- CLI 증명에는 명령, stdout, stderr, 종료 코드를 포함한다.
- 변경 증명에는 저장된 값을 읽기 전용으로 본 두 번째 뷰를 포함한다.
- 모든 아티팩트에 기능 ID와 사용한 진입점을 기록한다.
- 도달할 수 없는 경로는 시도한 명령과 충족되지 않은 사전 조건과 함께 보고한다.
- 건너뛴 진입점을 다른 경로로 검증했다고 보고하지 않는다.

## Feature entry contract

각 기능 파일은 H1 제목과, 사용자에게 보이는 동작을 설명하는 문단 하나로 시작한다. 그다음 정확히 네 개의 H2 절을 이 순서로 쓴다.

1. `Sub-features`는 동작마다 한 줄씩, 짧은 ID를 나열한다.
2. `How to get to it (user POV)`는 사용자의 모든 진입점을 나열한다.
3. `Driving it with <harness>`는 `Preconditions:`로 시작하고, 사용자 동작마다 정확한 명령과 관찰 가능한 결과를 짝지은 레이블 붙은 불릿을 쓴다.
4. `Gotchas`는 검증 실행을 낭비하거나 무효로 만들 수 있는 함정을 나열한다.

구현 세부는 맵에 넣지 않는다. 사용자 경로, 안정적인 핸들, 필요한 상태, 명령, 관찰 가능한 증명만 적는다.

## Features

- [Create a note](./create-note.md)는 브라우저와 CLI에서의 생성, 취소, 영속성, 정리를 다룬다.
- [Search notes](./search.md)는 툴바, 키보드, CLI 검색을 일치, 빈 결과, 초기화 상태와 함께 다룬다.
