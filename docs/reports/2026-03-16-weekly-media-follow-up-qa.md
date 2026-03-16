# 2026-03-16 Weekly Media Follow-up QA

## Scope

- `/admin/content` weekly media 상태 라벨 및 route-local copy 정리
- `/student/class/[classId]` weekly content consume 상태 라벨 정리
- merged 결과 기준 anonymous access gate / admin API 차단 재확인
- allowed-session runtime proof close

## Commands

- `npm run build`: pass
- `npm run typecheck`: 첫 실행은 `.next/types/**/*.ts` 미생성으로 실패, `npm run build` 후 재실행 pass
- `npm run runtime:seed-auth`: pass
- `SPM_BASE_URL=http://127.0.0.1:3005 npm run verify:weekly-media-runtime`: pass
- `npm run lint`: fail, `eslint: not found`

## Source-backed Review

- touched scope: `app/admin/content/page.tsx`, `components/week-content-editor.tsx`, `app/student/class/[classId]/page.tsx`, `lib/weekly-media.ts`
- No findings
- `*` 표시처럼 모호한 주차 상태 표기를 `공개 중 / 점검 필요 / 비어 있음 / 준비 중`으로 명시했다.
- operator-facing / student-facing copy에서 `MANUAL`, `storage contract` 같은 내부 계약 용어 노출을 제거했다.
- invalid media row 경고는 유지하되, 유효한 콘텐츠 consume이 계속 가능하다는 의미를 분리했다.

Confidence: `source-backed`

## Rendered Proof

- route: `GET /admin/content`
  - role: anonymous
  - observed: access gate 렌더
  - evidence: `관리자 로그인이 필요합니다`
- route: `GET /student/class/test?yearMonth=2026-03`
  - role: anonymous
  - observed: access gate 렌더
  - evidence: `학생 로그인이 필요합니다`
- route: `GET /api/admin/weekly-media?classId=test&yearMonth=2026-03`
  - role: anonymous
  - observed: `401`
  - body: `{"error":"AUTH_REQUIRED"}`

Confidence: `rendered proof`

## Runtime-Proven

- route: `POST /api/dev/runtime-login`
  - role: `ADMIN`
  - observed: `a@spm.local` 세션 발급 success
- route: `GET /api/dev/runtime-session`
  - role: `ADMIN`
  - observed: `ADMIN` 세션 context 확인 success
- route: `GET /api/admin/weekly-media?classId=11111111-1111-4111-8111-111111111111&yearMonth=2026-03`
  - role: `ADMIN`
  - observed: success, `weeks.length = 5`
- route: `POST /api/admin/weekly-media`
  - role: `ADMIN`
  - action: video create
  - observed: success
- route: `PUT /api/admin/weekly-media`
  - role: `ADMIN`
  - action: video update
  - observed: success
- route: `POST /api/admin/weekly-media/image`
  - role: `ADMIN`
  - action: image upload / replace
  - observed: success
- route: `DELETE /api/admin/weekly-media`
  - role: `ADMIN`
  - action: image delete / video delete
  - observed: success
- route: `POST /api/dev/runtime-login`
  - role: `STUDENT`
  - observed: `s1@spm.local` 세션 발급 success
- route: `GET /student/class/11111111-1111-4111-8111-111111111111?yearMonth=2026-03`
  - role: `STUDENT`
  - observed: `200`, access gate 문구 없음, class/yearMonth route param 포함
- route: `GET /api/admin/weekly-media?classId=11111111-1111-4111-8111-111111111111&yearMonth=2026-03`
  - role: `STUDENT`
  - observed: `403`
  - body: `{"error":"ADMIN_REQUIRED"}`

Confidence: `runtime-proven`

## Not Attempted

- 실제 브라우저 클릭 기반으로 student inline player/image DOM까지 확인하는 수동 smoke

## Remaining Risk

- student read proof는 session + route response 기준이며, 브라우저 DOM 상호작용까지는 아직 찍지 않았다.
- `npm run lint`는 여전히 local ESLint toolchain gap 상태다.
