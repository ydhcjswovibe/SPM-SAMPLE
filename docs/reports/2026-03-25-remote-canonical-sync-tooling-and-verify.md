# 2026-03-25 Remote Canonical Sync Tooling And Verify

## Scope

- connected Supabase의 remote canonical drift를 한 번에 읽을 수 있는 verify/apply 스크립트 묶음을 추가한다.
- `update_enrollment_status`, `update_enrollment_payment_status`, `class_logs.admin_note`, `upsert_weekly_class_log_notes`를 실제 remote에 반영하고 다시 확인한다.
- remote canonical sync 이후 enrollment/payment/weekly-notes route의 compatibility fallback을 제거한다.

## Commands

- `node --check scripts/lib/remote-canonical-sync.mjs`
- `node --check scripts/015_verify_enrollment_rpc_presence.mjs`
- `node --check scripts/016_apply_enrollment_status_rpc.mjs`
- `node --check scripts/017_verify_remote_canonical_presence.mjs`
- `node --check scripts/018_apply_remote_canonical_sync.mjs`
- `node scripts/018_apply_remote_canonical_sync.mjs --dry-run`
- `npm run verify:remote-canonical-presence`
- `npm run apply:remote-canonical-sync`
- `npm run build`
- `npm run runtime:seed-auth`
- `SPM_BASE_URL=http://127.0.0.1:3910 npm run verify:enrollment-runtime`
- `SPM_BASE_URL=http://127.0.0.1:3910 npm run verify:weekly-media-runtime`
- `npm run lint`
- `npm run typecheck`

## Source-Backed Review

- [scripts/lib/remote-canonical-sync.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/lib/remote-canonical-sync.mjs)에 remote canonical target 공통 로직을 추가했다.
- [scripts/017_verify_remote_canonical_presence.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/017_verify_remote_canonical_presence.mjs)로 세 RPC와 `class_logs.admin_note` column을 한 번에 확인할 수 있게 정리했다.
- [scripts/018_apply_remote_canonical_sync.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/018_apply_remote_canonical_sync.mjs)로 canonical drift 전체 apply entry를 추가했고, `--dry-run`으로 query preview를 확인할 수 있게 했다.
- 기존 [scripts/015_verify_enrollment_rpc_presence.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/015_verify_enrollment_rpc_presence.mjs), [scripts/016_apply_enrollment_status_rpc.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/016_apply_enrollment_status_rpc.mjs)는 enrollment status 전용 compatibility entry로 유지했다.
- [package.json](/home/ydhcjswo/projects/SPM-SAMPLE/package.json)에 `verify:remote-canonical-presence`, `apply:remote-canonical-sync`를 추가했다.
- [docs/VERIFY.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/VERIFY.md)의 remote sync 기준을 enrollment 단건 helper에서 canonical drift 묶음 기준으로 확장했고, remote sync 이후에는 canonical RPC direct path를 기준으로 검증 문구를 정리했다.
- [app/api/admin/enrollments/route.ts](/home/ydhcjswo/projects/SPM-SAMPLE/app/api/admin/enrollments/route.ts), [app/api/admin/payment/route.ts](/home/ydhcjswo/projects/SPM-SAMPLE/app/api/admin/payment/route.ts), [app/api/admin/weekly-notes/route.ts](/home/ydhcjswo/projects/SPM-SAMPLE/app/api/admin/weekly-notes/route.ts)에서 helper/column missing fallback을 제거했다.

Confidence: `source-backed`

## Runtime-Proven

- command: `npm run apply:remote-canonical-sync`
  - observed:
    - `public.update_enrollment_status` apply success
    - `public.update_enrollment_payment_status` apply success
    - `public.class_logs.admin_note` column add success
    - `public.upsert_weekly_class_log_notes` apply success
- command: `npm run verify:remote-canonical-presence`
  - observed:
    - `public.update_enrollment_status` -> `400 enrollment not found`, present
    - `public.update_enrollment_payment_status` -> `400 enrollment not found`, present
    - `public.class_logs.admin_note` -> `200`, present
    - `public.upsert_weekly_class_log_notes` -> `409 foreign key constraint`, present
- command: `node scripts/018_apply_remote_canonical_sync.mjs --dry-run`
  - observed:
    - project ref 기준으로 3 target, 4 query가 추출되는 것을 확인
    - weekly notes target에는 `admin_note` column add query와 `upsert_weekly_class_log_notes` helper query가 함께 포함됨
- command: `SPM_BASE_URL=http://127.0.0.1:3910 npm run verify:enrollment-runtime`
  - observed:
    - admin create -> duplicate create -> status update -> owner delete -> delete again contract 모두 pass
    - `statusUpdate`는 canonical RPC direct path로 `200`과 updated enrollment row를 반환
- command: `SPM_BASE_URL=http://127.0.0.1:3910 npm run verify:weekly-media-runtime`
  - observed:
    - admin notes read/update, media create/update/delete 모두 pass
    - `notesUpdate` 응답이 `admin_note: "runtime-admin-note"`를 직접 반환
    - student denied path는 `/api/admin/weekly-media`, `/api/admin/weekly-notes` 모두 `403 ADMIN_REQUIRED` 유지

Confidence: `runtime-proven`

## Not Attempted

- student browser smoke 재실행은 이번 패키지 범위 밖이라 다시 돌리지 않았다.

## Validation Notes

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run apply:remote-canonical-sync`: pass

## Remaining Risk

- 이번 패키지 기준으로 connected Supabase helper drift와 route fallback 의존은 닫혔다.
- 남은 리스크는 학생 브라우저 consume QA 같은 별도 표면 검증이며, remote canonical sync 자체의 blocker는 없다.
