# 2026-03-16 Local Runtime Auth Harness

## Scope

- `/auth/login` 이메일/비밀번호 로그인 추가
- 로컬 QA 전용 `/api/dev/runtime-login`, `/api/dev/runtime-session` route 추가
- `@spm.local` 테스트 계정 seed 스크립트 추가
- weekly media allowed-session QA를 재현하는 런타임 스크립트 추가

## Commands

- `npm run build`: pass
- `npm run typecheck`: 첫 실행은 `.next/types/**/*.ts` 미생성으로 실패, `npm run build` 후 재실행 pass
- `npm run runtime:seed-auth`: pass
- `npm run lint`: fail, `eslint: not found`

## Runtime-Proven

- command: `npm run runtime:seed-auth`
  - observed: `OWNER`, `ADMIN`, `STUDENT` 로컬 QA 계정 seed/upsert 완료
  - accounts:
    - `o@spm.local` -> `OWNER`
    - `a@spm.local` -> `ADMIN`
    - `s1@spm.local` -> `STUDENT`
- route: `POST /api/dev/runtime-login`
  - role: `ADMIN`, `STUDENT`
  - observed: local email/password 로그인 success
- route: `GET /api/dev/runtime-session`
  - role: `ADMIN`, `STUDENT`
  - observed: 현재 서버 access context JSON 확인

Confidence: `runtime-proven`

## Guardrails

- local-only route다. `127.0.0.1` 또는 `localhost`가 아니면 `404 NOT_FOUND`로 닫힌다.
- runtime login은 `@spm.local` 이메일만 허용한다.
- runtime QA용 비밀번호 값은 보고서에 중복 기록하지 않는다.

## Remaining Risk

- 이 harness는 로컬 반복 검증용이며, 운영/배포 환경 기능이 아니다.
- `npm run lint`는 여전히 local ESLint toolchain gap 상태다.
