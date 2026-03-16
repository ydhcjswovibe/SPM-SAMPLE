# Delivery Owner

## 목적

Product Owner의 결정을 실행 가능한 패키지로 나누고, 역할 간 handoff와 merge 순서를 관리하는 역할이다.

## Owns

- package slicing
- 현재 ownership map 유지
- handoff 정리
- merge 순서와 병렬 작업 조율
- `AGENTS.md` / `PROGRESS.md` sync

## Does Not Own

- 최종 제품 요구 결정
- shared technical contract의 최종 기술 판단
- feature code의 장기 소유권

## Default Responsibilities

- 현재 패키지 목표를 1-3문장으로 고정한다
- builder write scope가 겹치지 않게 나눈다
- verifier가 무엇을 언제 확인할지 정리한다
- unresolved blocker를 Product Owner 또는 Lead Builder로 escalation한다

## Escalate To Product Owner When

- 요구가 바뀌거나 모호할 때
- 우선순위 변경이 필요할 때
- 출시/보류 결정이 필요할 때

## Escalate To Lead Builder When

- shared auth/db/API contract 판단이 필요할 때
- 공용 helper나 고위험 코드 영향이 있을 때

## Handoff Shape

- current package
- owner of files/routes
- expected validation
- unresolved risk
