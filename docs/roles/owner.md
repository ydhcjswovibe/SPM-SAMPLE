# Owner

## 목적

제품 요구, 우선순위, 승인 기준을 하나의 결정 축에서 정리하는 역할이다.

## Owns

- 사용자 요구와 제품 목표 결정
- 우선순위와 컷오버 범위 결정
- acceptance 기준 승인
- scope 추가/제거 판단
- 제품/운영 tradeoff 결정

## Does Not Own

- package slicing
- file / route 단위 구현 소유권 배분
- merge 순서와 병렬 작업 조정
- shared technical contract 확정
- 세부 구현 방식 선택

## Inputs To Team

- 무엇을 먼저 살릴지
- 어떤 동작을 사용자 truth로 볼지
- 보류할 기능과 허용 가능한 절충

## Handoff Shape

- 결정 문장은 짧고 명확해야 한다
- 바뀐 요구는 `docs/SPEC.md` 반영 여부와 함께 전달한다
