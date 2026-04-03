# 2026-03-26 Admin Mobile Browser Verify And GIS Blocker

## Scope

- 운영 mobile 상단바/월 selector/메뉴/하단탭을 reusable browser smoke entry로 고정한다.
- admin 헤더 selector와 month selector의 접근성 라벨을 실제 verify target에 맞춰 정리한다.
- connected Supabase canonical target presence를 다시 확인한다.
- configured GIS success path가 현재 로컬 env에서 막히는 이유를 명시적으로 남긴다.

## Commands

- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm run runtime:seed-auth`
- `npm run start -- --hostname 127.0.0.1 --port 3920`
- `SPM_BASE_URL=http://127.0.0.1:3920 npm run verify:admin-mobile-browser`
- `npm run verify:remote-canonical-presence`

## Source-backed Review

- [scripts/019_verify_admin_mobile_browser.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/019_verify_admin_mobile_browser.mjs)로 운영 mobile smoke를 reusable entry로 추가했다.
- [components/class-selector.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/class-selector.tsx)에 `ariaLabel` prop을 추가해 운영 수업 selector를 안정적으로 식별할 수 있게 했다.
- [app/admin/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/page.tsx), [app/admin/students/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/students/page.tsx), [app/admin/content/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/content/page.tsx)에서 `AdminMonthSelector`에 `ariaLabel`을 실제 페이지 의미에 맞게 연결했다.
- [docs/VERIFY.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/VERIFY.md)에 admin mobile browser smoke 재현 기준을 추가했다.

Confidence: `source-backed`

## Runtime-Proven

- route: `/admin`
  - role: `OWNER`
  - action: mobile viewport(`390x844`)에서 운영 수업 selector, 월 selector, 메뉴, month popover, 삭제 모드, 하단탭, 출석 trigger 확인
  - observed:
    - `운영 수업 선택 -> 운영 월 선택 -> 메뉴` 순서가 같은 줄에서 유지
    - month popover가 `연도 헤더 + 12개월` 구조로 열리고, open state surface가 불투명하게 유지
    - 메뉴 open state와 하단탭 bar surface가 투명해지지 않음
    - 첫 출석 trigger size `36 x 36`
- route: `/admin/students`
  - role: `OWNER`
  - action: mobile viewport에서 학생 배정 수업/월 selector와 row action 확인
  - observed:
    - `학생 배정 수업 선택 -> 등록 월 선택` 순서 유지
    - active `학생` 하단탭이 gradient surface로 유지
    - 첫 row action size `결제 85.59 x 32`, `상태 80 x 32`, `피드백 74.28 x 32`
    - row action right edge가 viewport 안(`357 <= 390`)에 머묾
- route: `/admin/content`
  - role: `OWNER`
  - action: mobile viewport에서 콘텐츠 수업/월 selector와 active tab surface 확인
  - observed:
    - `콘텐츠 수업 선택 -> 콘텐츠 월 선택` 순서 유지
    - active `수업` 하단탭 surface가 불투명 gradient로 유지
- target: connected Supabase canonical target
  - action: `npm run verify:remote-canonical-presence`
  - observed:
    - `update_enrollment_status`, `update_enrollment_payment_status`, `class_logs.admin_note`, `upsert_weekly_class_log_notes` 모두 present

Confidence: `runtime-proven`

## Not Attempted

- configured GIS Google login success path actual sign-in

## Remaining Risk

- 현재 `.env.local`에는 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`가 없어 로컬 `/auth/login`은 redirect 기반 compatibility fallback만 연다.
- configured GIS success path는 client id가 들어간 local env 또는 deployed env에서 별도 runtime 확인이 필요하다.
- admin mobile browser smoke는 닫혔지만 physical device finger test가 있으면 safe-area와 버튼 체감 확인이 더 안전하다.
