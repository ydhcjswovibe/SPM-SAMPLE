# 2026-04-03 Release Verification Hardening

## Scope

- local release gate를 현재 제품 truth 기준으로 다시 묶는다.
- owner 수업 생성 / admin-owner 일정 관리의 시간 규칙을 runtime smoke로 고정한다.
- login card와 admin content editor까지 primary surface opacity contract 대상에 편입한다.
- connected Supabase `weekly-notes` drift를 실제 runtime blocker 기준으로 복구한다.

## Commands

- `npm run verify:static`
- `npm run runtime:seed-auth`
- `npm run start -- --hostname 127.0.0.1 --port 3930`
- `npm run verify:remote-canonical-presence -- --target weekly-notes`
- `npm run apply:remote-canonical-sync -- --target weekly-notes`
- `SPM_BASE_URL=http://127.0.0.1:3930 npm run verify:weekly-media-runtime`
- `SPM_BASE_URL=http://127.0.0.1:3930 npm run verify:release`

## Source-Backed Review

- [scripts/021_verify_class_schedule_browser.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/021_verify_class_schedule_browser.mjs)를 추가해 owner `새 수업 만들기`와 admin/owner `일정 관리`의 시간 선택 규칙, 권한 차이, 저장 후 재조회까지 browser/runtime smoke로 묶었다.
- [package.json](/home/ydhcjswo/projects/SPM-SAMPLE/package.json)의 `verify:release`를 `route-guards + weekly-media-runtime + enrollment-runtime + admin-mobile-browser + class-schedule-browser + remote-schedule-core` 조합으로 확장했다.
- [app/admin/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/page.tsx), [components/class-schedule-editor.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/class-schedule-editor.tsx)에서 시작 시간 변경 시 종료 시간이 비어 있을 때만 `+2시간` 자동 채움이 동작하고, 사용자가 직접 입력한 종료 시간은 이후 변경에도 보존되도록 정리했다.
- [components/auth-login-form.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/auth-login-form.tsx), [components/week-content-editor.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/week-content-editor.tsx), [scripts/020_verify_surface_contract.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/020_verify_surface_contract.mjs)에서 primary surface opacity contract 누락 표면과 ghost usage guard를 보강했다.
- [scripts/010_seed_runtime_auth.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/010_seed_runtime_auth.mjs)에 QA 수업/일정/등록/기록 seed를 추가해 admin mobile, weekly media, class-schedule smoke가 같은 localhost auth harness 위에서 재현되게 맞췄다.
- [scripts/lib/remote-canonical-sync.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/lib/remote-canonical-sync.mjs)에 `weekly-notes` target의 `class_logs.member_admin_notes` apply/probe를 추가해 live drift를 실제 blocker 단위로 닫았다.

Confidence: `source-backed`

## Runtime-Proven

- command: `npm run verify:remote-canonical-presence -- --target weekly-notes`
  - first observed:
    - `upsert_weekly_class_log_notes` helper missing
  - after helper apply observed:
    - helper는 present로 보였지만 `class_logs.member_admin_notes` column missing으로 `weekly-media-runtime`이 계속 blocked
  - after tooling update + re-apply observed:
    - `class_logs.admin_note` -> `200`, present
    - `class_logs.member_admin_notes` -> `200`, present
    - `upsert_weekly_class_log_notes` -> `409 foreign key constraint`, present
- command: `npm run apply:remote-canonical-sync -- --target weekly-notes`
  - observed:
    - `public.class_logs.admin_note` apply success
    - `public.class_logs.member_admin_notes` apply success
    - `public.upsert_weekly_class_log_notes` apply success
- command: `SPM_BASE_URL=http://127.0.0.1:3930 npm run verify:weekly-media-runtime`
  - observed:
    - admin notes read/update, media create/update/delete pass
    - `notesUpdate` 응답이 `admin_note`와 `member_admin_notes`를 함께 반환
    - student denied path는 `/api/admin/weekly-media`, `/api/admin/weekly-notes` 모두 `403 ADMIN_REQUIRED` 유지
- command: `SPM_BASE_URL=http://127.0.0.1:3930 npm run verify:release`
  - observed:
    - `verify:route-guards` pass
    - `verify:weekly-media-runtime` pass
    - `verify:enrollment-runtime` pass
    - `verify:admin-mobile-browser` pass
    - `verify:class-schedule-browser` pass
    - `verify:remote-schedule-core` pass
    - owner create dialog와 schedule dialog 모두 `00/30분`, auto-fill, manual preserve, restore contract를 runtime으로 확인
- command: `npm run verify:static`
  - observed:
    - `lint` pass
    - `typecheck` pass
    - `build` pass

Confidence: `runtime-proven`

## Not Attempted

- configured Google GIS success path actual sign-in
- deployed env에서의 final release sign-off
- physical device finger test

## Remaining Risk

- local release gate와 connected Supabase weekly-notes drift는 닫혔지만, configured GIS success path는 여전히 local `.env.local`의 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 부재로 여기서 증명하지 못했다.
- `verify:release`는 localhost/browser/runtime 기준 증빙이다. 배포 환경 승인에는 configured env 실제 로그인과 최소 1대 physical device 확인이 추가로 필요하다.
