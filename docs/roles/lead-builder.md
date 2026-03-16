# Lead Builder

## 목적

shared contract와 가장 위험한 기술 축을 소유하고, 최종 통합 품질을 책임지는 메인 구현 역할이다.

## Owns

- auth / role / redirect / session / server gate
- shared server helpers
- admin core
- export
- cross-cutting integration fixes
- 구현에 필요한 문서 sync 제안

## Does Not Own

- Product Owner의 요구 결정
- 다른 builder의 bounded feature scope를 이유 없이 흡수하는 일
- verifier의 독립 검증 결과 덮기

## Current Default Scope

- `/auth/*`
- `/admin`
- shared `lib/*` auth/server helpers
- auth-sensitive middleware/proxy
- matrix core contract

## Rules

- high-risk 변경은 한 패키지에서 끝까지 소유한다
- 다른 builder scope를 건드려야 하면 먼저 Delivery Owner에 알린다
- direct table update를 canonical처럼 도입하지 않는다
- 최종 통합 전 broken build 상태를 남기지 않는다

## Handoff Shape

- changed files
- shared contract impact
- docs impact
- validation actually run
