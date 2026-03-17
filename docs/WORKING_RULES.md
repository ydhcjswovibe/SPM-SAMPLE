# WORKING_RULES

## 목적

이 문서는 저장소 전역 작업 규칙을 모은다.
역할 정의는 `docs/roles/*`, 제품 truth는 `docs/SPEC.md`, 검증 기준은 `docs/VERIFY.md`, 진행 상태는 `PROGRESS.md`에서 본다.

## 언어

- 설명, 분석, 검증, handoff는 한국어로 작성한다.
- 코드와 식별자는 필요할 때만 영어를 유지한다.

## 작업 기준

- 작은 패키지 단위로 진행한다.
- UI/구조는 새 저장소 기준을 유지한다.
- Supabase 프로젝트/환경은 현재 연결값을 유지한다.
- DB/auth/API truth는 `docs/db/*` 기준으로 맞춘다.
- 기존 프로젝트 코드는 UI reference와 독립 로직만 제한적으로 참고한다.
- 도메인 로직과 데이터 접근은 이 저장소 구조에서 재구현한다.

## Canonical Truth Locks

- payment mutation canonical truth는 `docs/db/RPC.sql`이다.
- route나 client의 direct table update는 canonical truth가 아니다.
- weekly media cardinality truth는 `class_log -> media 1:N`이다.
- `VIDEO`와 `IMAGE` 모두 주차별 `0..N` row를 허용한다.
- media row의 수정/삭제 기준 키는 `media.id`다.

## High-Risk Boundaries

- auth / role / redirect / session / schema / RLS / RPC / mutation은 high-risk로 본다.
- high-risk 변경은 한 패키지 안에서 문서와 구현을 함께 맞춘다.
- 문서와 코드가 충돌하면 UI 추정으로 덮지 말고 먼저 실제 DB/auth truth를 확인한다.
- legacy snapshot을 active 문서 대신 인용하지 않는다.

## Docs Sync

- 사용자-visible scope가 바뀌면 `docs/SPEC.md`를 갱신한다.
- 검증 기준이 바뀌면 `docs/VERIFY.md`를 갱신한다.
- schema / RLS / RPC truth가 바뀌면 `docs/db/*`를 갱신한다.
- 역할 정의나 ownership이 바뀌면 `AGENTS.md`와 `docs/roles/*`를 함께 갱신한다.
- `PROGRESS.md`는 carryover / in-progress / done / next / risks 같은 시간축 상태만 남기고, 제품 truth를 다시 정의하지 않는다.
- 의미 있는 완료 상태와 다음 handoff는 `PROGRESS.md`에 남긴다.
- `PROGRESS.md`의 새 work entry에는 가능하면 `date`, `start`, `end`, `timezone`을 함께 남긴다.
- backfill이라 exact start/end를 모르면 추정하지 말고 `not recorded`로 적는다.
