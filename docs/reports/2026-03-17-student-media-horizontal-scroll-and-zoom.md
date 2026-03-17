# 2026-03-17 Student Media Horizontal Scroll And Zoom

## Scope

- student 주차 미디어 consume 화면을 영상 selector + 이미지 가로 스크롤 구조로 정리
- student 영상은 단일 플레이어 + 가로 선택 strip, 이미지는 click/tap 확대 다이얼로그 추가
- admin 주차 미디어 편집기에도 같은 탐색 원칙을 적용해 영상은 단일 preview + 선택 strip, 이미지는 가로 스크롤 + 확대 보기로 정리
- student browser smoke를 새 consume 구조에 맞게 보강

## Commands

- `npm run typecheck`
- `npm run build`
- `npm run runtime:seed-auth`
- `npm run start -- --hostname 127.0.0.1 --port 3013`
- `SPM_BASE_URL=http://127.0.0.1:3013 npm run verify:student-browser-smoke`

## Source-backed Review

- [app/student/class/[classId]/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/class/[classId]/page.tsx)에서 video section을 현재 선택된 1개 플레이어 + 이전/다음 + 가로 선택 strip으로 정리하고, image section은 가로 스크롤 + 확대 다이얼로그 구조로 정렬했다.
- student 영상은 여러 iframe을 한 번에 나열하지 않고, 현재 선택된 1개 플레이어와 가로 선택 strip으로 분리했다.
- 영상/이미지 모두 여러 항목이 있을 때 한 줄에서 훑을 수 있도록 `overflow-x-auto + snap` 기반 consume 구조를 사용한다.
- 이미지 확대는 같은 route 안에서 dialog로 열려, student가 주차 맥락을 잃지 않고 닫을 수 있다.
- [components/week-content-editor.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/week-content-editor.tsx)도 관리자 편집기에서 현재 선택된 영상 1개 preview, 이전/다음 버튼, 가로 선택 strip, 이미지 확대 다이얼로그 구조로 정렬했다.
- [scripts/014_verify_student_weekly_media_browser.mjs](/home/ydhcjswo/projects/SPM_SAMPLE/scripts/014_verify_student_weekly_media_browser.mjs)를 새 video selector/title/zoom DOM에 맞게 갱신했다.

## Runtime-Proven

- `runtime:seed-auth` 후 local `next start` + `verify:student-browser-smoke`를 재실행해 student consume runtime을 다시 확인했다.
- observed outcomes:
  - `1주차` tab 진입 후 선택된 video iframe visible
  - `다음 영상` 및 선택 strip으로 현재 재생 영상을 바꿀 수 있음
  - image card visible and loaded
  - image click 후 `이미지 크게 보기` dialog visible
  - dialog close 후 reload 뒤에도 video/image visible 유지
  - signed-in `STUDENT` session에서 `/api/admin/weekly-media` fetch -> `403 ADMIN_REQUIRED`

## Confidence

- student media consume layout: `runtime-proven`
- admin media edit layout: `source-backed`
