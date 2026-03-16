# 2026-03-16 Admin Month-First Selector Hotfix

## Scope

- `/admin`, `/admin/students`를 `월 먼저 -> 그 달에 배정된 수업 선택` 흐름으로 정렬
- admin classes/enrollments read를 client direct table fetch 대신 server route 기준으로 정리

## Commands

- `npm run runtime:seed-auth`: pass
- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass
- `POST /api/dev/runtime-login { preset: "ADMIN" }`: pass
- `GET /api/admin/classes?yearMonth=2026-03`: pass
- `GET /api/admin/enrollments?classId=11111111-1111-4111-8111-111111111111&yearMonth=2026-03`: pass
- Playwright local smoke:
  - `/admin`에서 month input visible + month-first 안내 문구 visible
  - `/admin/students`에서 month input visible + month-first 안내 문구 visible

## Runtime-Proven

- role: `ADMIN`
- route: `/api/admin/classes?yearMonth=2026-03`
  - observed: 해당 월에 배정된 수업만 응답
- route: `/api/admin/enrollments?...`
  - observed: 선택 수업/월 기준 등록 정보 응답
- route: `/admin`, `/admin/students`
  - observed: `월 먼저 -> 수업 선택` 안내가 실제 렌더됨

Confidence: `runtime-proven`

## Remaining Risk

- `admin/content`는 이번 패키지 범위 밖이라 기존 class/month 흐름을 유지한다.
