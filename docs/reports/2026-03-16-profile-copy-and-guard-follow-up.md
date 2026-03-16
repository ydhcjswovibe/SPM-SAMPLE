# 2026-03-16 Profile Copy And Guard Follow-up

## Scope

- `/api/profile` route 기반 self-profile update 정리
- `/admin/settings`, `/student/profile` demo fallback 제거 및 저장 상태 정리
- root / wrong-role / operator-facing copy sweep
- local runtime route guard smoke pack 추가
- enrollment runtime proof 보강

## Commands

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run runtime:seed-auth`: pass
- `SPM_BASE_URL=http://127.0.0.1:3007 npm run verify:weekly-media-runtime`: pass
- `SPM_BASE_URL=http://127.0.0.1:3007 npm run verify:route-guards`: pass
- `SPM_BASE_URL=http://127.0.0.1:3007 npm run verify:enrollment-runtime`: pass

## Source-backed Review

- touched scope: `app/page.tsx`, `app/admin/layout.tsx`, `app/student/layout.tsx`, `app/admin/page.tsx`, `app/admin/students/page.tsx`, `components/student-nav.tsx`, `app/student/profile/page.tsx`, `app/api/profile/route.ts`, `app/api/admin/enrollments/route.ts`, `scripts/lib/runtime-auth.mjs`, `scripts/lib/runtime-http.mjs`, `scripts/011_verify_weekly_media_runtime.mjs`, `scripts/012_verify_route_guards.mjs`, `scripts/013_verify_enrollment_runtime.mjs`
- No findings
- wrong-role/access gate에서 raw role token 노출을 제거했고, operator/student-facing copy를 현재 auth truth와 맞췄다.
- `/api/profile`은 자기 계정 이름 수정만 허용하고, profile load 실패 시 local demo fallback을 쓰지 않도록 정리했다.
- enrollment status change는 connected Supabase에 optional helper RPC가 아직 없을 때만 route fallback으로 direct update를 수행한다. denied/not-found contract는 유지한다.

Confidence: `source-backed`

## Runtime-Proven

- route pack: `/admin`, `/student`, `/api/admin/matrix`, `/api/profile`
  - role: anonymous / owner / admin / student
  - observed:
    - anonymous `/admin`, `/student` access gate render
    - owner/admin `/admin` allowed
    - student `/student` allowed
    - admin -> `/student`, student -> `/admin` wrong-role render
    - wrong-role surface에서 raw `role:` token 미노출
    - anonymous `/api/profile -> 401 AUTH_REQUIRED`
    - admin/student `/api/profile` patch success 후 원래 이름으로 restore success
- enrollment pack: `/api/admin/enrollments`
  - role: admin / owner / student
  - observed:
    - admin create success
    - duplicate create `409 ENROLLMENT_ALREADY_EXISTS`
    - admin status update success
    - student create `403 ADMIN_REQUIRED`
    - admin delete `403 OWNER_REQUIRED`
    - owner delete success
    - second delete `404 ENROLLMENT_NOT_FOUND`
- weekly media pack 재검증
  - role: admin / student
  - observed:
    - admin video create/update/delete success
    - admin image upload/replace/delete success
    - student detail route allowed
    - student `/api/admin/weekly-media -> 403 ADMIN_REQUIRED`

Confidence: `runtime-proven`

## Not Attempted

- student weekly media 실제 브라우저 DOM 상호작용 manual smoke

## Remaining Risk

- connected Supabase가 `update_enrollment_status` helper를 아직 schema cache에 올리지 못한 상태라, 현재 route는 compatibility fallback에 의존한다.
- student weekly media iframe/image DOM consume은 manual browser smoke를 끝내기 전까지 별도 gap으로 남는다.
