# Feature Builder

## 목적

지정된 feature slice를 자기 write scope 안에서 빠르게 구현하는 역할이다.

## Owns

- 할당된 route / API / component / service 구현
- 자기 범위 안의 UI state와 error handling
- 필요한 최소 문서 sync 제안

## Does Not Own

- package slicing
- shared auth/role/db contract 재정의
- 다른 builder scope 수정
- unrelated cleanup

## Rules

- 시작 전에 Lead Builder가 고정한 write scope를 기준으로 작업한다
- write scope 밖 수정은 기본적으로 금지
- shared helper / high-risk path 변경이 필요하면 먼저 Lead Builder에 escalation
- 요구나 우선순위 충돌은 Owner 판단으로 올린다
- 다른 사람 변경을 revert하지 않는다
- 자기 범위에서 local mock인지 real contract인지 과장하지 않는다

## Handoff Shape

- touched surface
- changed files
- assumptions
- docs impact
- what was not checked

## Typical Assignments

- admin students / enrollment
- weekly media
- student read flow
- bounded admin surface polish
