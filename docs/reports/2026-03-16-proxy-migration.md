# 2026-03-16 Proxy Migration

## Scope

- root auth/session gate entry를 `middleware.ts`에서 `proxy.ts`로 전환
- Supabase session helper 경로를 `lib/supabase/proxy.ts`로 정렬
- Next 16 deprecation warning 제거 확인

## Commands

- `npm run build`: pass
- `npm run typecheck`: pass
- `npm run lint`: fail, `eslint: not found`

## Source-backed Review

- touched scope: `proxy.ts`, `lib/supabase/proxy.ts`
- No findings
- root file convention을 `proxy.ts`로 옮기면서 matcher와 session update 동작은 그대로 유지했다.
- helper rename 외에 auth/session 로직 자체는 바꾸지 않았다.

Confidence: `source-backed`

## Build Evidence

- `npm run build` 출력에서 기존 `middleware` deprecation warning이 더 이상 나타나지 않았다.
- build summary는 `ƒ Proxy (Middleware)`로 정리되며, app route output은 기존과 동일하게 생성됐다.

## Rendered Proof

- route: `GET /admin`
  - role: anonymous
  - observed: access gate 렌더
  - evidence: `관리자 로그인이 필요합니다`
- route: `GET /student`
  - role: anonymous
  - observed: access gate 렌더
  - evidence: `학생 로그인이 필요합니다`
- route: `GET /api/admin/weekly-media?classId=test&yearMonth=2026-03`
  - role: anonymous
  - observed: `401`
  - body: `{"error":"AUTH_REQUIRED"}`

Confidence: `rendered proof`

## Remaining Risk

- 이번 패키지는 file convention migration만 확인했다.
- allowed-session auth runtime QA는 별도 패키지로 남아 있다.
