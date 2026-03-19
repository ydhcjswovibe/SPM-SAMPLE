# AGENTS

## 목적

이 문서는 저장소 진입점이다.
세부 truth와 작업 규칙은 아래 문서에서 확인한다.

## 문서 지도

- 제품 범위 / 사용자-visible truth: [docs/SPEC.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/SPEC.md)
- 검증 기준 / high-risk check: [docs/VERIFY.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/VERIFY.md)
- 진행 상태 / handoff / next: [PROGRESS.md](/home/ydhcjswo/projects/SPM_SAMPLE/PROGRESS.md)
- DB / auth / mutation truth:
  - [docs/db/SCHEMA.sql](/home/ydhcjswo/projects/SPM_SAMPLE/docs/db/SCHEMA.sql)
  - [docs/db/RLS.sql](/home/ydhcjswo/projects/SPM_SAMPLE/docs/db/RLS.sql)
  - [docs/db/RPC.sql](/home/ydhcjswo/projects/SPM_SAMPLE/docs/db/RPC.sql)
- 전역 작업 규칙 / canonical lock / docs sync: [docs/WORKING_RULES.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/WORKING_RULES.md)

## 역할

- `Owner`: [docs/roles/owner.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/roles/owner.md)
- `Lead Builder`: [docs/roles/lead-builder.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/roles/lead-builder.md)
- `Feature Builder`: [docs/roles/feature-builder.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/roles/feature-builder.md)
- `Verifier`: [docs/roles/verifier.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/roles/verifier.md)

## 빠른 원칙

- 작은 패키지 단위로 진행한다.
- 설명, 분석, 검증, handoff는 한국어로 작성한다.
- 코드와 식별자는 필요할 때만 영어를 유지한다.
- `docs/legacy/**/*`, `docs/archive/**/*`는 참고 snapshot일 뿐 active truth가 아니다.

## 금지사항

- active truth가 아닌 문서를 canonical처럼 인용하지 않는다.
- canonical RPC/mutation을 route/client direct table update로 우회하지 않는다.
- high-risk 변경을 문서 sync 없이 진행하지 않는다.
- 사전 조정 없는 write scope 침범을 하지 않는다.
- 다른 사람 변경을 revert하거나 덮어쓰지 않는다.
- local mock / prototype / source-backed 결과를 runtime-proven처럼 과장하지 않는다.
- `PROGRESS.md`에 제품 truth나 기술 계약을 다시 정의하지 않는다.
- 연결된 Supabase 프로젝트/환경을 임의로 바꾸지 않는다.
