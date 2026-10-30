---
name: interrogate
description: "\"interrogate\", \"adversarial review\", \"multi-model review\", \"challenge this\", \"stress test this code\", \"find blind spots\", \"tear this apart\"에 쓴다. adversary들이 변경이나 설계를 깨려고 시도하고, 실행으로 증명된 발견만 살아남는다."
disable-model-invocation: true
---

# Interrogate

adversary들이 변경이나 설계를 깨려고 시도한다. 발견은 실행으로 증명될 때만 살아남는다. 발견을 보고한다. 수정은 적용하지 않는다.

## Frame

범위는 사용자가 지정한 것이다. 지정이 없으면 기준 브랜치와의 merge base부터 작업 트리까지의 브랜치 diff다. 사용자 메시지, 커밋, PR 설명을 바탕으로 **in-your-own-words** 스킬로 의도를 적는다. 의도가 불분명하면 사용자에게 묻는다.

## Fan out

**arena** 스킬의 Phase A 3, 4단계와 Phase B를 실행하되 네 가지를 바꾼다. arena runner 대신 reviewer 둘을 돌린다. 하나는 `model: "opus"`에 `effort: "xhigh"`, 하나는 `model: "sonnet"`이다. 범위의 커밋되지 않은 변경을 각 worktree에 복사한다. adversary는 각각 `subagent_type: "general-purpose"`로 띄운다. arena의 작업과 rationale 대신 각 adversary에게 범위, 의도, 그리고 다음 브리프를 준다:

> 이 변경을 깨라. 발견마다 실제 코드에 대한 실행으로 증명한다. 실패하는 테스트, 재현 스크립트, 잘못된 동작을 보여 주는 명령 출력 등이다. 설계나 계획이면 프로토타입을 돌리거나 현재 트리를 탐침한다. 재현은 자기 worktree 안에 둔다. 발견마다 제목, 정확한 명령, 그 명령이 출력한 결과, 의도가 요구하는 출력을 보고한다. 실행하지 않은 것은 뺀다. 스타일, 이름, 구조, 미래의 변경이 있어야 문제가 되는 위험이 여기에 해당한다. 발견이 없는 것도 유효한 결과다.

## Verify

arena Phase F에 따라 각 발견의 명령을 다시 실행해서 검증한다. 출력이 실패를 보여 주고 그 실패가 의도를 깨면 발견을 유지한다. 나머지는 버린다. 근본 원인이 같은 발견은 합친다.

arena의 Phase C, D, E는 건너뛴다. adversary마다 찾는 실패가 다르므로, 판정은 한 adversary의 목록이 아니라 검증된 발견을 모두 유지한다.

## Output

- **Intent**: 다시 적은 의도.
- **Findings**: 검증된 발견마다 명령, 그 출력, 의도를 어떻게 깨는지, 그것을 찾은 adversary. 살아남은 것이 없으면 "no verified findings"라고 쓴다.
- **Dropped**: adversary마다 버린 발견의 수와 이유.
