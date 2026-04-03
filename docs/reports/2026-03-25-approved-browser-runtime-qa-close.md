# 2026-03-25 Approved Browser Runtime QA Close

## Scope

- 이전에 승인된 browser/runtime QA 패키지를 실제 실행 기준으로 닫는다.
- client env helper drift로 깨진 `/auth/login` 이메일 로그인 브라우저 경로를 복구한다.
- 현재 학생 `수업` 탭 consume smoke를 현행 contract에 맞춰 다시 고정한다.
- `/admin`, `/admin/students` mobile viewport 가시성과 학생 요청 `PENDING -> ACTIVE` 전환 체인을 실제로 확인한다.

## Commands

- `npm run build`
- `npm run runtime:seed-auth`
- `SPM_BASE_URL=http://127.0.0.1:3100 npm run verify:route-guards`
- `SPM_BASE_URL=http://127.0.0.1:3100 npm run verify:weekly-media-runtime`
- `SPM_BASE_URL=http://127.0.0.1:3100 npm run verify:enrollment-runtime`
- `SPM_BASE_URL=http://127.0.0.1:3100 npm run verify:student-browser-smoke`
- `npm run typecheck`
- `npm run lint`
- `node` Playwright ad hoc admin mobile smoke (`/admin`, `/admin/students`, `390x844`)
- `node` Playwright + runtime API ad hoc student request/approval flow (`2099-01`, cleanup 포함)

## Source-backed Review

- [lib/env/client.ts](/home/ydhcjswo/projects/SPM-SAMPLE/lib/env/client.ts)에서 public env read를 direct `process.env.NEXT_PUBLIC_*` 접근으로 바꿔 client bundle에서도 Supabase/login env를 안정적으로 읽도록 정리했다.
- [scripts/014_verify_student_weekly_media_browser.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/014_verify_student_weekly_media_browser.mjs)는 현재 학생 `수업` 탭 contract에 맞춰 다시 정리했다:
  - 이메일/비밀번호 `Enter submit`
  - legacy `/student/class/[classId]` -> `/student/lessons` redirect 확인
  - 상단 `수업/월` control과 하단 탭 visible 확인
  - 영상 `이전/다음`, 이미지 확대, reload 후 지속성 확인
- 이번 턴은 검증과 브라우저 회귀 복구 범위라 [docs/SPEC.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/SPEC.md), [docs/VERIFY.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/VERIFY.md) 제품 truth는 바꾸지 않았다.

Confidence: `source-backed`

## Runtime-Proven

- route: `/auth/login`
  - role: `STUDENT`
  - action: 이메일/비밀번호 입력 후 `Enter submit`
  - observed: `/auth/login`을 벗어나 역할 기본 화면으로 이동
- route: `/student/lessons`
  - role: `STUDENT`
  - action: legacy deep link open, `1주차` open, 영상 이전/다음, 이미지 확대, reload
  - observed:
    - 상단 `수업 선택`, `월 선택` control visible
    - 하단 `홈 / 수업 / 내상태` tab visible
    - iframe/image visible
    - `다음 영상`/`이전 영상`으로 iframe src 변경 가능
    - 이미지 확대 dialog visible
    - reload 뒤에도 media visible 유지
    - same session `/api/admin/weekly-media` fetch -> `403 ADMIN_REQUIRED`
- route: `/admin`, `/admin/students`
  - role: `ADMIN`
  - action: mobile viewport browser open
  - observed:
    - `/admin` `운영 월 선택` visible
    - admin 하단 `운영 / 학생 / 수업` nav가 viewport 안에 유지
    - 첫 admin attendance trigger size `76.5 x 36`
    - `/admin/students` `등록 월 선택` visible
    - 학생 row 결제/상태 button size `85.6 x 32`, `80 x 32`
- route: `/student/lessons` + `/api/student/enrollment-request` + `/api/admin/enrollments`
  - role: `STUDENT` then `ADMIN`
  - action: 메뉴 `새 수업 요청` -> `2099-01` 요청 -> student pending 확인 -> admin activate -> student reload
  - observed:
    - request success message visible
    - student pending 상태에서 `운영 승인 전입니다.` visible
    - admin activation success
    - student reload 뒤 `이 주차 콘텐츠는 아직 준비 중입니다.` visible
    - owner cleanup delete success
- routes: `/api/admin/matrix`, `/api/profile`, `/api/admin/enrollments`, `/api/admin/weekly-media`
  - role: anonymous / student / admin / owner mixed
  - action: existing smoke pack rerun
  - observed:
    - `verify:route-guards`, `verify:weekly-media-runtime`, `verify:enrollment-runtime` 모두 pass
    - denied contract는 `401/403/404` 구분 유지

Confidence: `runtime-proven`

## Not Attempted

- configured GIS Google login success path
- remote Supabase helper RPC sync
- desktop Chromium mobile viewport 외 실제 휴대폰 finger test

## Remaining Risk

- admin matrix/action button 체감은 browser viewport 기준으로는 확인했지만, 실제 휴대폰 safe-area와 손가락 정확도는 physical device 확인이 있으면 더 안전하다.
