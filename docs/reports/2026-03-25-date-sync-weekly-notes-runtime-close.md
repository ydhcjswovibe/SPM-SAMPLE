# 2026-03-25 Date Sync + Weekly Notes Runtime Close

## Scope

- 학생/운영 화면의 기본 월/주차 선택을 현재 날짜 기준으로 통일한다.
- `/admin/content`에 주차 메모 편집(`진행 메모`, `공통 피드백`, `학생별 피드백`, `운영 내부메모`)을 추가한다.
- `/admin/students`에서 notes 원본 편집면으로 deep link를 연결한다.
- 학생 `수업` 탭 상세에서 주차별 텍스트 메모를 읽고, 운영 내부메모는 숨긴다.

## Commands

- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm run runtime:seed-auth`
- `SPM_BASE_URL=http://127.0.0.1:3900 npm run verify:weekly-media-runtime`
- `SPM_BASE_URL=http://127.0.0.1:3900 npm run verify:student-browser-smoke`

## Source-backed Review

- [lib/date-selection.ts](/home/ydhcjswo/projects/SPM-SAMPLE/lib/date-selection.ts)를 추가해 `현재 yearMonth`, `월의 n주차`, week clamp를 한곳에서 계산하게 정리했다.
- [app/admin/content/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/content/page.tsx)는 query-driven `classId/yearMonth/week/studentId` selection, weekly notes fetch/save, 현재 날짜 기준 주차 기본 선택으로 확장했다.
- [components/week-notes-editor.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/week-notes-editor.tsx)에서 admin notes write surface를 별도 카드로 추가했다.
- [app/admin/students/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/students/page.tsx)는 row별 `피드백` 바로가기를 추가하고, notes editor를 복제하지 않도록 유지했다.
- [components/student-class-detail-view.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/student-class-detail-view.tsx)와 [app/student/lessons/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/student/lessons/page.tsx)는 현재 날짜 기준 주차 기본 선택과 학생 공개 메모 렌더를 추가했다.
- [app/api/admin/weekly-notes/route.ts](/home/ydhcjswo/projects/SPM-SAMPLE/app/api/admin/weekly-notes/route.ts), [lib/admin/weekly-notes.ts](/home/ydhcjswo/projects/SPM-SAMPLE/lib/admin/weekly-notes.ts)에 notes read/write contract를 추가했다.
- canonical truth는 [docs/db/SCHEMA.sql](/home/ydhcjswo/projects/SPM-SAMPLE/docs/db/SCHEMA.sql), [docs/db/RPC.sql](/home/ydhcjswo/projects/SPM-SAMPLE/docs/db/RPC.sql)에 반영했다.

Confidence: `source-backed`

## Runtime-Proven

- route: `/api/admin/weekly-notes`
  - role: `ADMIN`
  - action: weekly notes read + save
  - observed:
    - `verify:weekly-media-runtime`에서 `weekCount: 5`, `studentCount: 3` 확인
    - `progress`, `reflection`, private feedback 저장 성공
    - connected Supabase에 `admin_note` column / helper가 아직 직접 반영되지 않은 상태라 compatibility fallback이 `member_feedback.__admin_note__` reserved key로 동작
    - same session student access는 `403 ADMIN_REQUIRED`
- route: `/student/lessons`
  - role: `STUDENT`
  - action: browser smoke로 현재 visible class/month target seed -> `1주차` open -> 영상 이전/다음 -> 이미지 확대 -> notes visibility 확인
  - observed:
    - 상단 `수업 선택`, `월 선택` control visible
    - 하단 `홈 / 수업 / 내상태` tab visible
    - seeded `진행 메모`, `공통 피드백`, `개인 피드백` visible
    - `운영 내부메모` text는 student DOM에 없음
    - reload 뒤 iframe/image visible 유지
    - same session `/api/admin/weekly-media` fetch -> `403 ADMIN_REQUIRED`

Confidence: `runtime-proven`

## Not Attempted

- remote Supabase에 `admin_note` column과 `upsert_weekly_class_log_notes` helper 직접 apply
- notes helper presence 전용 remote drift check script
- `/admin/content`와 `/admin/students` browser manual spot-check

## Remaining Risk

- 현재 connected Supabase는 notes canonical schema/RPC가 직접 반영되지 않아 compatibility fallback에 의존한다.
- remote schema/helper를 반영하기 전까지는 `member_feedback.__admin_note__` reserved key path가 runtime truth다.
