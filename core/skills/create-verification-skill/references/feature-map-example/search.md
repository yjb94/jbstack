# Search notes

Search는 사용자가 제목이나 본문 텍스트로 노트를 찾고, 일치하는 노트를 살펴보고, 일치 없음과 검색 불가를 구분하게 해준다.

## Sub-features

- `search-open`은 지원하는 각 브라우저 진입점에서 검색을 연다.
- `search-match`는 노트 데이터를 바꾸지 않고 제목과 본문 일치를 반환한다.
- `search-open-result`는 결과를 노트 에디터에서 연다.
- `search-empty`는 일치가 없는 쿼리에 완전한 빈 상태를 보여준다.
- `search-clear`는 쿼리를 지우고 최근 노트 뷰를 복원한다.
- `search-cli`는 터미널에서 같은 일치 노트를 반환한다.

## How to get to it (user POV)

- 브라우저 툴바에서 `Search` 버튼을 선택한다.
- 포커스가 편집 가능한 필드 밖에 있을 때 브라우저에서 `/`를 누른다.
- 터미널에서 `notes search <query>`를 실행한다.

## Driving it with control-notes

Preconditions:

- Notes가 `http://127.0.0.1:4173`에서 정상이다.
- 일회용 데이터 디렉터리에 본문 텍스트가 `Draft budget`인 `Quarterly plan`이 있다.
- `control-notes doctor`가 기대하는 URL과 데이터 디렉터리를 보고한다.

- **툴바 진입.** `Search` 버튼을 선택한다. `control-notes browser click --role button --name "Search"`를 실행한다. `Search notes`라는 이름의 대화상자가 나타나고 포커스가 그 searchbox에 있다.
- **키보드 진입.** 대화상자를 닫고, 페이지에 포커스를 두고, `/`를 누른다. `control-notes browser press --key "/"`를 실행한다. 같은 대화상자가 나타나고 페이지에 슬래시가 입력되지 않는다.
- **제목 일치.** `quarterly`를 입력한다. `control-notes browser fill --role searchbox --name "Search notes" --value "quarterly"`를 실행한다. `Search results` 목록에 `Quarterly plan`이 있고 `Grocery list`는 없다.
- **본문 일치.** 쿼리를 `budget`으로 바꾼다. `control-notes browser fill --role searchbox --name "Search notes" --value "budget"`를 실행한다. 결과 `Quarterly plan`이 본문 일치 발췌와 함께 계속 보인다.
- **결과 열기.** `Quarterly plan`을 선택한다. `control-notes browser click --role link --name "Quarterly plan"`을 실행한다. 대화상자가 닫히고 에디터 제목이 `Quarterly plan`으로 보인다.
- **빈 상태.** 검색을 다시 열고 `volcano`를 입력한다. `control-notes browser fill --role searchbox --name "Search notes" --value "volcano"`를 실행한다. 검색이 끝나면 `No matching notes`라는 이름의 상태가 나타난다.
- **쿼리 지우기.** `Clear search`를 선택한다. `control-notes browser click --role button --name "Clear search"`를 실행한다. searchbox가 비고 `Recent notes` 영역이 결과 목록을 대체한다.
- **CLI 일치.** 터미널에서 검색한다. `control-notes cli -- notes search "quarterly" --format json`을 실행한다. 종료 코드 `0`이고 stdout에 제목이 `Quarterly plan`인 객체 하나가 들어 있다.
- **CLI 불일치.** 없는 값을 검색한다. `control-notes cli -- notes search "volcano" --format json`을 실행한다. 종료 코드 `0`이고 stdout은 `[]`다.
- **증명.** 결과가 채워진 상태를 수집한다. `control-notes browser snapshot --aria --path artifacts/search/results.aria.txt`와 `control-notes browser screenshot --path artifacts/search/results.png`를 실행한다. 두 아티팩트 모두 Notes, 쿼리, `Quarterly plan`을 식별할 수 있다.

## Gotchas

- 에디터나 searchbox에 포커스가 있을 때 `/`를 누르면 검색이 열리지 않고 텍스트가 입력된다.
- 결과는 짧은 debounce 뒤에 갱신된다. 고정된 sleep이 아니라 결과 목록이나 빈 상태 표시를 기다린다.
- 보관된 노트는 사용자가 `Include archived`를 켜지 않는 한 제외된다.
- CLI는 기본으로 사람이 읽는 출력을 낸다. 안정적인 단언에는 `--format json`을 쓴다.
- 결과를 열면 브라우저 상태가 바뀐다. 다른 쿼리를 증명하기 전에 검색을 다시 연다.
