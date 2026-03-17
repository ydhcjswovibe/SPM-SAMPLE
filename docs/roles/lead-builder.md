# Lead Builder

## 목적

shared contract와 high-risk 기술 축을 소유하고, 병렬 작업의 경계와 최종 통합 품질을 책임지는 메인 구현 역할이다.

## Owns

- package slicing
- 현재 ownership map 유지
- handoff 정리
- merge 순서와 병렬 작업 조율
- auth / role / redirect / session / server gate
- shared server helpers
- admin shell / core
- export
- cross-cutting integration fixes
- 구현에 필요한 문서 sync 정리

## Does Not Own

- Owner의 요구 결정
- 다른 builder의 bounded feature scope를 이유 없이 흡수하는 일
- verifier의 독립 검증 결과 덮기

## Current Default Scope

- `/auth/*`
- `/admin` shell / matrix core / export
- shared `lib/*` auth/server helpers
- auth-sensitive middleware/proxy
- matrix core contract

## Rules

- high-risk 변경은 한 패키지에서 끝까지 소유한다
- 병렬 작업 전 builder write scope를 겹치지 않게 고정한다
- 다른 builder scope를 건드려야 하면 먼저 조정하고 handoff를 갱신한다
- bounded feature surface는 가능하면 Feature Builder에 남긴다
- direct table update를 canonical처럼 도입하지 않는다
- 최종 통합 전 broken build 상태를 남기지 않는다

## Escalate To Owner When

- 요구가 바뀌거나 모호할 때
- 우선순위 변경이 필요할 때
- 제품/운영 tradeoff를 정해야 할 때

## Handoff Shape

- current package
- changed files
- shared contract impact
- docs impact
- validation actually run
- unresolved risk
