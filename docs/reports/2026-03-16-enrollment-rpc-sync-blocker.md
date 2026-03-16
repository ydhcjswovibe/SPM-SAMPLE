# 2026-03-16 Enrollment RPC Sync Blocker

## Scope

- connected Supabase의 `update_enrollment_status` helper 존재 여부 확인
- remote sync를 실제로 밀 수 있는 관리 권한 경로 확인

## Commands

- `npm run verify:enrollment-rpc-presence`: helper missing
- `npx supabase projects list`: fail, `SUPABASE_ACCESS_TOKEN` missing

## Runtime-Proven

- route: `POST /rest/v1/rpc/update_enrollment_status`
  - role: runtime admin token
  - observed:
    - status: `404`
    - body code: `PGRST202`
    - meaning: connected Supabase schema cache에 helper RPC가 없다

Confidence: `runtime-proven`

## Blocker

- 현재 환경에는 `SUPABASE_ACCESS_TOKEN`도 없고 remote database `db-url/password`도 없다.
- 따라서 이 저장소에서 connected Supabase에 직접 SQL push를 실행할 권한 경로를 확보하지 못했다.

## Current Mitigation

- [app/api/admin/enrollments/route.ts](/home/ydhcjswo/projects/SPM_SAMPLE/app/api/admin/enrollments/route.ts#L133)에서 helper가 없을 때 direct update compatibility fallback을 유지한다.
- enrollment create/status/delete runtime proof는 이미 닫혀 있다.
- remote 반영 경로는 [016_apply_enrollment_status_rpc.mjs](/home/ydhcjswo/projects/SPM_SAMPLE/scripts/016_apply_enrollment_status_rpc.mjs)와 `npm run apply:enrollment-rpc`로 준비해 두었다.

## Next Action

- `SUPABASE_ACCESS_TOKEN` 또는 remote Postgres 접속 정보가 제공되면 `npm run apply:enrollment-rpc`로 `docs/db/RPC.sql`의 helper를 실제 프로젝트에 반영한다.
- 반영 후 `npm run verify:enrollment-rpc-presence`, `npm run verify:enrollment-runtime`를 재실행하고 fallback 제거 여부를 재판단한다.
