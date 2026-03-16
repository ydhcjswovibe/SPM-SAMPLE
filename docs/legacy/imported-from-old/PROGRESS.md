# PROGRESS.md

## Fast Status

### In Progress
- lane: `none`
- role: `planning`
- kind: `code complete`
- code-change-allowed: `yes`
- scope: `sample-style-mapping -> sample-aligned-admin-matrix -> sample-aligned-student-workspace` 1~3 순차 패키지 완료; 다음 reopen 후보는 runtime visual proof
- merge dependency: `none`

### Next User Check
- current package handoff: `sample-aligned-student-workspace` code package complete
- note:
  - [sample/SPM_SAMPLE](/home/ydhcjswo/projects/SocialPlusManager/sample/SPM_SAMPLE)은 계속 visual source로 사용하지만, 전체 이식이 아니라 현재 프로젝트 기준 `번역 적용` 원칙은 유지한다
  - `/admin/matrix` desktop pilot은 sidebar/workspace/tone translation과 desktop-only tone gating까지 reviewer `No findings`로 닫혔다
  - `/student`도 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) 한 파일 안에서 warm background, soft surface, sample-inspired tab/shell tone으로 정렬됐다
  - 남은 리스크는 runtime browser 기준의 visual proof이며, 코드 레벨 최소 검증은 `lint + diff --check`까지 반영됐다

### Recently Completed
- [2026-03-14] Owner `sample-aligned-student-workspace` package에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) route-local shell을 warm neutral background + scoped surface override + sample-inspired topbar/tabbar/workspace tone으로 재정렬했다; auth/session semantics, 4탭 구조, `클래스 -> 주차 -> 콘텐츠` read flow, weekly video/image 소비/확대 의미는 유지했고 `npm run lint`, `git diff --check -- app/student/page.tsx`를 통과한 뒤 reviewer `No findings`로 닫았다 (`docs/reports/2026-03-14-sample-aligned-student-workspace-owner.md`)
- [2026-03-14] Owner `sample-aligned-admin-matrix` package를 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx), [components/admin/MatrixTable.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/MatrixTable.tsx), [components/admin/MatrixRow.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/MatrixRow.tsx), [components/admin/EnrollmentManagementPanel.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/EnrollmentManagementPanel.tsx) 범위에서 닫았다; sample-inspired desktop sidebar/workspace translation 뒤 quick-nav target과 desktop/mobile tone bleed follow-up을 거쳐 reviewer `No findings`를 확인했고, 잔여 리스크는 desktop quick-nav / breakpoint 체감의 runtime QA 권장으로만 남겼다 (`docs/reports/2026-03-14-sample-aligned-admin-matrix-owner.md`)
- [2026-03-14] Owner `sample-style-mapping` proof package에서 [sample/SPM_SAMPLE](/home/ydhcjswo/projects/SocialPlusManager/sample/SPM_SAMPLE) 코드 샘플을 현재 visual reference로 채택하되 직접 이식 대신 `번역 적용`으로 진행한다고 고정했다; 샘플의 token/shell/component tone, 복사 금지 항목, `/admin/matrix` desktop 우선 pilot 후 `/student` 확장 순서를 [docs/PLAN.md](/home/ydhcjswo/projects/SocialPlusManager/docs/PLAN.md), [PROGRESS.md](/home/ydhcjswo/projects/SocialPlusManager/PROGRESS.md), `docs/reports/2026-03-14-sample-style-mapping-owner.md`에 정리했다
- [2026-03-14] Owner `validation-and-doc-sync` docs-only follow-up에서 [docs/VERIFY.md](/home/ydhcjswo/projects/SocialPlusManager/docs/VERIFY.md)에 `.next/types` 누락 시 `build -> typecheck rerun` baseline note와 route-local copy/state alignment용 source-backed review 기준을 추가했고, [docs/PLAN.md](/home/ydhcjswo/projects/SocialPlusManager/docs/PLAN.md), [PROGRESS.md](/home/ydhcjswo/projects/SocialPlusManager/PROGRESS.md)에 다음 우선순위를 `role-delayed-runtime-proof`로 다시 맞췄다 (`docs/reports/2026-03-14-validation-and-doc-sync-owner.md`)
- [2026-03-14] Reviewer `admin-mobile-desktop-consistency`에서 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) mobile `ops` 상단, mobile `class` summary/video/image section, desktop lesson summary를 source-backed로 검토한 결과 `No findings`; 상태 chip이 mobile/desktop 양쪽에서 같은 loading/error/warning/connected/empty 의미를 공유하고, 영문/개발자 문구 정리가 route-local copy-state alignment 범위를 벗어나지 않음을 확인했다 (`docs/reports/2026-03-14-admin-mobile-desktop-consistency-reviewer.md`)
- [2026-03-14] Builder `admin-mobile-desktop-consistency`에서 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) mobile `ops` 상단과 mobile/desktop `수업` surface의 라벨, 상태 tone, 안내 문구를 같은 operator-first 규칙으로 맞췄다; mobile class surface의 `Current ...`, `VIDEO row`, `IMAGE row`, `class_log`, `storage contract`, `upload_method` 같은 개발자 표현을 정리했고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-14-admin-mobile-desktop-consistency-builder.md`)
- [2026-03-14] Reviewer `admin-matrix-density-pass` 재검토에서 [docs/reports/2026-03-13-student-enrollment-management-builder.md](/home/ydhcjswo/projects/SocialPlusManager/docs/reports/2026-03-13-student-enrollment-management-builder.md)와 [PROGRESS.md](/home/ydhcjswo/projects/SocialPlusManager/PROGRESS.md) 2026-03-13 entry를 근거로 `MatrixRow`의 enrollment/mobile/cancelled row 변경을 preexisting contract로 분리한 뒤, [components/admin/MatrixTable.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/MatrixTable.tsx), [components/admin/MatrixRow.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/MatrixRow.tsx) density hunk만 source-backed로 다시 검토한 결과 `No findings`; desktop banner/header, row padding/gap/text rhythm, header width/padding compact화는 route-local desktop density pass 범위 안에 머물렀다 (`docs/reports/2026-03-14-admin-matrix-density-pass-reviewer.md`)
- [2026-03-14] Builder 2 `admin-matrix-density-pass`에서 [components/admin/MatrixTable.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/MatrixTable.tsx), [components/admin/MatrixRow.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/MatrixRow.tsx) desktop `md+` table 경로의 mutation banner, header, first-column chip, sync summary, cell padding을 compact하게 조정해 한 화면에 더 많은 행이 보이도록 정리했다; mobile `md:hidden` row card와 toggle/retry/save/error 의미, `app/admin/matrix/page.tsx`, auth/DB/RLS/RPC/mutation contract는 유지했고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-14-admin-matrix-density-pass-builder.md`)
- [2026-03-14] Reviewer `admin-operator-toolbar-polish`에서 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) admin mobile shell `ops` 탭 상단 `Current State`와 `Next Action` block을 source-backed로 검토한 결과 `No findings`; follow-up 뒤 `운영 압력` tone이 `오류 -> amber`, `저장 중 -> blue`, `안정 -> emerald`로 나뉘고, route-local 범위를 벗어나지 않음을 확인했다 (`docs/reports/2026-03-14-admin-operator-toolbar-polish-reviewer.md`)
- [2026-03-14] Builder `admin-operator-toolbar-polish`에서 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) mobile shell `ops` 탭 상단 `Current State`와 `Next Action`을 compact하게 정리했고, `운영 압력` block과 `범위 고정 → 행 수정` CTA를 더 직접적으로 보이게 만들었다; reviewer finding이던 `운영 압력` tone mismatch도 상태 분기로 정리했고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-14-admin-operator-toolbar-polish-builder.md`)
- [2026-03-14] Reviewer `admin-lesson-studio-polish`에서 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) `renderDesktopLessonManager` 상단 summary와 `범위 선택` block 정리를 source-backed로 검토한 결과 `No findings`; follow-up 뒤 `현재 범위 / 범위 다시 읽기 / 범위 선택`, `선택한 클래스 / 기준 월 / 주차` 같은 운영자 문구로 정리됐고 mobile lesson surface나 editor 동작 의미는 건드리지 않음을 확인했다 (`docs/reports/2026-03-14-admin-lesson-studio-polish-reviewer.md`)
- [2026-03-14] Builder `admin-lesson-studio-polish`에서 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) `renderDesktopLessonManager` 상단 summary와 `범위 선택` block을 compact하게 정리했고, reviewer finding이던 `scope`, `class / year_month / week` 표현도 운영자 문구로 교체했다; refresh, 클래스/주차 선택, video/image editor 카드와 저장/삭제 동작은 유지했고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-14-admin-lesson-studio-polish-builder.md`)
- [2026-03-13] Reviewer `admin-student-management-declutter`에서 [components/admin/EnrollmentManagementPanel.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/EnrollmentManagementPanel.tsx) 상단 설명층 정리와 follow-up copy 수정 결과 `No findings`; 4개 설명 카드가 2개 운영 요약 블록으로 줄어도 `기존 STUDENT profile 배정`, `새 계정 생성은 별도 기능`, `OWNER만 실제 삭제 / ADMIN은 취소만 가능` 의미가 유지되고 route-local 범위를 벗어나지 않음을 확인했다 (`docs/reports/2026-03-13-admin-student-management-declutter-reviewer.md`)
- [2026-03-13] Builder `admin-student-management-declutter`에서 [components/admin/EnrollmentManagementPanel.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/EnrollmentManagementPanel.tsx) 학생 관리 패널 상단 설명층을 4개 카드에서 `운영 범위 / 운영 규칙` 2블록으로 압축했고, reviewer finding이던 개발자 용어 `truth`, `server-only 후속 패키지`도 운영자 문구로 정리했다; add/status/delete 동작, message, loading/error, row/action 영역은 유지했고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-admin-student-management-declutter-builder.md`)
- [2026-03-13] Reviewer `student-content-header-declutter`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) `Weekly Video` / `Weekly Image` section header-helper 정리를 source-backed로 좁게 검토한 결과 `No findings`; `class / week` meta chip과 축약된 helper가 선택 맥락을 더 빨리 읽히게 하되 `연결 수량 / 경고 있음 / 미등록`, empty/warning state, modal, selection/auth/upload 의미와 충돌하지 않음을 확인했다 (`docs/reports/2026-03-13-student-content-header-declutter-reviewer.md`)
- [2026-03-13] Builder `student-content-header-declutter`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) `Weekly Video` / `Weekly Image` section header 상단에 `class / week` meta chip을 올리고, 중복 설명을 각 1줄 helper로 줄여 `Content` 패널 density를 좁게 정리했다; `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-content-header-declutter-builder.md`)
- [2026-03-13] Reviewer `student-desktop-gallery-polish`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) weekly video/image grid를 source-backed로 좁게 검토한 결과 `No findings`; bounded `auto-fit + minmax(...)` 조정이 desktop content panel의 빈 gutter를 줄이되 modal/selection/auth/recovery 의미와 shared visual 경계를 건드리지 않음을 확인했다 (`docs/reports/2026-03-13-student-desktop-gallery-polish-reviewer.md`)
- [2026-03-13] Builder `student-desktop-gallery-polish`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) weekly video/image gallery grid를 fixed-width `auto-fill`에서 bounded `auto-fit + minmax(...)`로 조정하고 tile을 `w-full`로 맞춰 desktop wide content panel의 density를 자연스럽게 보정했다; `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-desktop-gallery-polish-builder.md`)
- [2026-03-13] Reviewer `student-media-viewer-fix`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) `expandedMedia` effect와 `expandedMediaModal` portal block을 source-backed로 좁게 검토한 결과 `No findings`; 작은 뷰포트용 `max-height + internal scroll` 구조가 header/action과 media body를 분리하고, `Esc`/overlay close/fullscreen/external open 경로와 route-local 범위를 유지함을 확인했다 (`docs/reports/2026-03-13-student-media-viewer-fix-reviewer.md`)
- [2026-03-13] Builder `student-media-viewer-fix`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) student media viewer modal을 viewport-fit 기준으로 다시 감싸고, `max-height`와 내부 scroll container를 추가해 작은 뷰포트에서도 닫기/핵심 액션 접근성을 유지했다; video frame은 `100dvh` 기준으로 크기를 제한했고 `role="dialog"` / `aria-modal="true"`를 더했으며 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-media-viewer-fix-builder.md`)
- [2026-03-13] Builder `student-media-portal-modal-fix`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) student media 확대/재생 레이어를 `document.body` portal로 옮기고, modal open 동안 body scroll을 잠갔다; tile click 후 image/video modal이 shell 내부 overflow에 막히지 않게 했고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다
- [2026-03-13] Builder `student-desktop-workspace-media-layout-fix`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) desktop `수업` 탭을 `클래스/주차 좌측 + 콘텐츠 우측` workspace로 다시 나누고, media tile은 고정폭 grid로 재정렬했다; 학생 shell 상단 라벨도 `Student Workspace`로 맞췄고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다
- [2026-03-13] Builder `student-media-gallery-surface-fix`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) student gallery follow-up을 다시 좁혔다; 썸네일 아래 상세 chips/footer를 걷어내고, 영상은 `repeat(auto-fit, minmax(220px, 1fr))` tile grid, 이미지는 `repeat(auto-fit, minmax(180px, 1fr))` 정사각 tile grid로 재조정해 세로 리스트처럼 늘어지지 않게 했다; modal 재생/확대 흐름은 유지했고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-media-gallery-surface-fix-builder.md`)
- [2026-03-13] Builder `student-media-gallery-surface`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) student `Content` 패널의 weekly video/image 표시를 갤러리형 썸네일 grid로 재구성했다; 영상은 YouTube iframe을 목록에 직접 쌓지 않고 썸네일 타일로 먼저 보여준 뒤 modal 안에서 재생/전체화면/YouTube 이동을 제공하고, 이미지는 원본 비율을 유지한 채 축소된 썸네일 grid로 먼저 보여준 뒤 modal 확대/새 탭 열기를 제공한다; `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-media-gallery-surface-builder.md`)
- [2026-03-13] Builder `student-desktop-media-grid-and-lightbox`에서 [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx) desktop `Content` 패널의 주차 영상 카드를 2열까지 읽히도록 조정했고, 주차 이미지는 2~3열 bounded preview + 화면 내 lightbox 확대 흐름으로 정리했다; 이미지는 원본 비율을 유지한 채 카드 안에 축소돼 보이고, 클릭 시 확대/닫기(`Esc`)가 가능하다; `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-desktop-media-grid-and-lightbox-builder.md`)
- [2026-03-13] Builder `admin-desktop-and-student-pc-media-fit`에서 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) desktop shell에 compact lesson studio를 추가해 mobile `수업` 탭의 class/week selector, video/image 등록/수정/삭제 흐름을 PC에서도 쓸 수 있게 했고, [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx)의 `Content` 패널 높이와 media card `max-width`를 조정해 desktop에서 영상/이미지가 과하게 작거나 이상한 비율로 보이지 않도록 보정했다; `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-admin-desktop-and-student-pc-media-fit-builder.md`)
- [2026-03-13] Builder `student-enrollment-management`에서 [app/api/admin/enrollments/route.ts](/home/ydhcjswo/projects/SocialPlusManager/app/api/admin/enrollments/route.ts), [lib/admin/enrollments.ts](/home/ydhcjswo/projects/SocialPlusManager/lib/admin/enrollments.ts), [hooks/admin/useAdminEnrollmentQuery.ts](/home/ydhcjswo/projects/SocialPlusManager/hooks/admin/useAdminEnrollmentQuery.ts), [types/admin-enrollment.ts](/home/ydhcjswo/projects/SocialPlusManager/types/admin-enrollment.ts)로 admin enrollment read/create/status/delete surface를 추가했고, [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx), [components/admin/EnrollmentManagementPanel.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/EnrollmentManagementPanel.tsx), [components/admin/MatrixRow.tsx](/home/ydhcjswo/projects/SocialPlusManager/components/admin/MatrixRow.tsx), [lib/admin/matrix.ts](/home/ydhcjswo/projects/SocialPlusManager/lib/admin/matrix.ts), [types/admin-matrix.ts](/home/ydhcjswo/projects/SocialPlusManager/types/admin-matrix.ts)에서 `/admin/matrix` 학생 관리 탭/desktop 패널과 ops row `enrollment_status` 노출을 연결했다; 이번 구현의 `등록`은 새 auth 계정 생성이 아니라 기존 `STUDENT` profile 배정이며, `delete`는 current RLS truth에 맞춰 `OWNER only`, `ADMIN`은 `취소` 상태만 사용한다; `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-enrollment-management-builder.md`)
- [2026-03-13] Builder `temporary-demo-login-guard`에서 [lib/demo-login.ts](/home/ydhcjswo/projects/SocialPlusManager/lib/demo-login.ts)로 Demo Login preset/guard를 공용화했고, [app/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/page.tsx), [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx), [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx)의 원클릭 로그인은 기본 `local`만 노출되며 online은 preview guard가 있을 때만 열리도록 정리했다; [\.env.local.example](/home/ydhcjswo/projects/SocialPlusManager/.env.local.example)에 임시 개발용 설정값도 남겼고 `npm run lint`, `npm run build`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-temporary-demo-login-guard-builder.md`)
- [2026-03-13] Builder `weekly-media-multi-item-support`에서 [app/api/admin/weekly-video/route.ts](/home/ydhcjswo/projects/SocialPlusManager/app/api/admin/weekly-video/route.ts), [app/api/admin/weekly-image/route.ts](/home/ydhcjswo/projects/SocialPlusManager/app/api/admin/weekly-image/route.ts), [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx), [hooks/useStudentDashboard.ts](/home/ydhcjswo/projects/SocialPlusManager/hooks/useStudentDashboard.ts), [types/student-dashboard.ts](/home/ydhcjswo/projects/SocialPlusManager/types/student-dashboard.ts), [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx)를 주차 미디어 다건 계약으로 전환했다; admin은 같은 주차의 영상/이미지를 여러 건 추가하고 각 카드에서 `media_id` 기준 수정/삭제할 수 있으며, student는 유효한 media 여러 건을 그대로 consume하고 invalid row는 warning으로 분리한다; image preview/card는 `fill` 경고 없이 렌더되도록 정리했고 `npm run lint`, `npm run typecheck`, `npm run build`를 통과했다 (`docs/reports/2026-03-13-weekly-media-multi-item-support-builder.md`)
- [2026-03-13] Reviewer `weekly-media-hardening` narrow review 결과 `No findings`; [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx)에서 storage cleanup warning이 더 이상 success tone으로 섞여 보이지 않고, admin weekly image input helper/preview가 current `validateWeeklyImageFile` contract와 일치하며, API/storage/schema/RLS 확장 없이 route-local operator guidance만 보강된 것을 확인했다; `npm run lint`, `npm run typecheck`, `npm run build`를 통과했다 (`docs/reports/2026-03-13-weekly-media-hardening-reviewer.md`)
- [2026-03-13] Builder `weekly-media-hardening`에서 [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) weekly image flow에 warning tone을 추가해 replace/delete cleanup warning을 success와 분리했고, 선택 즉시 형식/용량 검사를 막는다는 helper와 파일 `type/size` preview를 추가해 operator file safety 안내를 현재 구현과 맞췄다; storage/API/RLS/schema contract는 건드리지 않았고 `npm run lint`, `npm run typecheck`, `npm run build`를 통과했다 (`docs/reports/2026-03-13-weekly-media-hardening-builder.md`)
- [2026-03-13] QA `weekly-media-merged-runtime-qa`에서 local merged runtime proof를 다시 확보했다; `npm run verify:baseline` pass, demo seed 후 `http://127.0.0.1:3001` dev server 위에서 admin `a@spm.local` 세션으로 weekly video save/delete와 weekly image upload/replace/delete를 실행했고, student `s1@spm.local` 세션으로 같은 `2026-03` `Beginner A` `1주차` media read와 admin route `403 ADMIN_REQUIRED` 차단을 확인했다; image replace 후 이전 object cleanup, image delete 후 final object cleanup도 runtime으로 다시 확인했다 (`docs/reports/2026-03-13-weekly-media-merged-runtime-qa-qa.md`)
- [2026-03-13] Reviewer `weekly-image-upload-e2e` narrow review 결과 `No findings`; [app/api/admin/weekly-image/route.ts](/home/ydhcjswo/projects/SocialPlusManager/app/api/admin/weekly-image/route.ts), [lib/weekly-image.ts](/home/ydhcjswo/projects/SocialPlusManager/lib/weekly-image.ts), [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx), [hooks/useStudentDashboard.ts](/home/ydhcjswo/projects/SocialPlusManager/hooks/useStudentDashboard.ts), [types/student-dashboard.ts](/home/ydhcjswo/projects/SocialPlusManager/types/student-dashboard.ts), [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx)가 모두 locked `spm-media` / `IMAGE 0/1` contract 안에서 움직였고 schema/RLS/RPC/private-bucket/gallery 확장은 보이지 않았다; `npm run lint`, `npm run typecheck`, `npm run build`를 통과했다 (`docs/reports/2026-03-13-weekly-image-upload-e2e-reviewer.md`)
- [2026-03-13] Builder `weekly-image-upload-e2e`에서 [app/api/admin/weekly-image/route.ts](/home/ydhcjswo/projects/SocialPlusManager/app/api/admin/weekly-image/route.ts)와 [lib/weekly-image.ts](/home/ydhcjswo/projects/SocialPlusManager/lib/weekly-image.ts)로 weekly image upload/delete/read contract를 구현했고, [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx)에 admin weekly image upload/replace/delete UI를, [hooks/useStudentDashboard.ts](/home/ydhcjswo/projects/SocialPlusManager/hooks/useStudentDashboard.ts), [types/student-dashboard.ts](/home/ydhcjswo/projects/SocialPlusManager/types/student-dashboard.ts), [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx)에 student weekly image read surface를 연결했다; duplicate IMAGE row나 invalid public URL/path는 explicit inconsistency로만 처리하고 `npm run lint`, `npm run typecheck`, `npm run build`를 통과했다 (`docs/reports/2026-03-13-weekly-image-upload-e2e-builder.md`)
- [2026-03-13] Reviewer `weekly-image-storage-contract` source-backed review 결과 `No findings`; `spm-media` public read + admin/owner write, weekly image path convention, `IMAGE 0/1`, `media.url` public URL, `upload_method=MANUAL` contract가 active docs/db 범위 안에서 정합하게 반영됐고 app/schema/RPC/signed-url/gallery 확장은 열리지 않았다 (`docs/reports/2026-03-13-weekly-image-storage-contract-reviewer.md`)
- [2026-03-13] Builder `weekly-image-storage-contract`에서 [docs/db/RLS.SQL](/home/ydhcjswo/projects/SocialPlusManager/docs/db/RLS.SQL)에 `spm-media` storage section을 추가해 public read + admin/owner insert/update/delete truth를 current helper `public.is_admin_or_owner()` 기준으로 active docs/db에 반영했고, [docs/db/patches/2026-03-13-spm-media-storage-policies.sql](/home/ydhcjswo/projects/SocialPlusManager/docs/db/patches/2026-03-13-spm-media-storage-policies.sql)로 public bucket/policy patch를 분리했다; [docs/SPEC.md](/home/ydhcjswo/projects/SocialPlusManager/docs/SPEC.md), [docs/WORKSTREAMS.md](/home/ydhcjswo/projects/SocialPlusManager/docs/WORKSTREAMS.md), [docs/PLAN.md](/home/ydhcjswo/projects/SocialPlusManager/docs/PLAN.md), [PROGRESS.md](/home/ydhcjswo/projects/SocialPlusManager/PROGRESS.md)도 `class_log당 IMAGE 0 또는 1건`, public URL, `MANUAL`, fixed weekly image path contract와 현재 media sequence에 맞게 동기화했다; docs-only package라 validation command는 실행하지 않고 source-backed consulted sources만 report에 남겼다 (`docs/reports/2026-03-13-weekly-image-storage-contract-builder.md`)
- [2026-03-13] Owner는 `weekly-video-e2e-with-rls`를 code/review closed, QA `limited confidence` 상태로 판단하고 다음 media sequence를 `weekly-image-storage-contract -> weekly-image-upload-e2e -> weekly-media-merged-runtime-qa`로 고정했다; 2차에서는 archive에만 남아 있던 `spm-media` storage truth를 active docs/db로 승격하고, 3차는 그 계약 위에서 admin image upload + student image read를 여는 순서로 진행한다 (`docs/reports/2026-03-13-weekly-image-storage-contract-owner.md`)
- [2026-03-13] QA `weekly-video-e2e-with-rls` merged proof에서 `npm run verify:baseline` pass, demo seed success, local Next dev server `Ready`까지는 확인했지만, 같은 세션의 loopback connect 실패와 Supabase DNS `EAI_AGAIN` / `queryA ECONNREFUSED` 때문에 admin save/update/delete, student inline read, delete-policy patch live 적용 여부를 runtime으로 증명하지 못했다; 따라서 결과를 `limited confidence`로 남기고 source-backed truth와 runtime gap을 분리 기록했다 (`docs/reports/2026-03-13-weekly-video-e2e-with-rls-qa.md`)
- [2026-03-13] Reviewer `weekly-video-e2e-with-rls` narrow review 결과 `No findings`; [docs/db/RLS.SQL](/home/ydhcjswo/projects/SocialPlusManager/docs/db/RLS.SQL) + [docs/db/patches/2026-03-13-media-delete-admin-or-owner.sql](/home/ydhcjswo/projects/SocialPlusManager/docs/db/patches/2026-03-13-media-delete-admin-or-owner.sql)에서 허용된 `media delete` 최소 RLS 확장 1건만 열렸고, [lib/weekly-video.ts](/home/ydhcjswo/projects/SocialPlusManager/lib/weekly-video.ts) shared helper를 통해 [app/api/admin/weekly-video/route.ts](/home/ydhcjswo/projects/SocialPlusManager/app/api/admin/weekly-video/route.ts), [hooks/useStudentDashboard.ts](/home/ydhcjswo/projects/SocialPlusManager/hooks/useStudentDashboard.ts), [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx), [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) 모두 duplicate VIDEO row / invalid URL을 explicit inconsistency로만 처리함을 확인했다; [docs/SPEC.md](/home/ydhcjswo/projects/SocialPlusManager/docs/SPEC.md)도 current truth를 weekly YouTube URL CRUD/read로 유지하고 image upload/storage contract는 defer 상태로 남겼으며 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-weekly-video-e2e-with-rls-reviewer.md`)
- [2026-03-13] Builder `weekly-video-e2e-with-rls`에서 `media delete` 최소 RLS 확장과 함께 admin/student weekly video E2E를 구현했다; [app/api/admin/weekly-video/route.ts](/home/ydhcjswo/projects/SocialPlusManager/app/api/admin/weekly-video/route.ts)로 admin GET/PUT/DELETE를 추가하고, [app/admin/matrix/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/admin/matrix/page.tsx) `수업` 탭을 실제 `class + year_month + week` scope 저장/삭제 UI로 교체했으며, [hooks/useStudentDashboard.ts](/home/ydhcjswo/projects/SocialPlusManager/hooks/useStudentDashboard.ts) + [app/student/page.tsx](/home/ydhcjswo/projects/SocialPlusManager/app/student/page.tsx)에서 student inline read를 실제 `media(type='VIDEO')` 데이터로 연결했다; duplicate VIDEO row나 invalid URL은 helper에서 explicit inconsistency로만 처리하고 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-weekly-video-e2e-with-rls-builder.md`)
- [2026-03-13] QA `role-delayed-runtime-proof`에서 merged `/admin/matrix` non-anonymous denied/delayed 중 `role_delayed` fresh runtime proof를 좁게 시도했지만, 현재 세션의 loopback socket connect/listen이 모두 `EPERM`으로 막히고 Windows Edge 실행도 `UtilBindVsockAnyPort ... socket failed 1`로 실패해 rendered/runtime route 관측 자체를 열지 못했다; 따라서 이번 결과는 `Not Checked`로 남기고, current merged source에 `role_delayed` 분기(`user && isRoleLoading && isBootstrapDelayed`), `BOOTSTRAP_DELAY_MS=3500` / `ROLE_TIMEOUT_MS=4000`, recovery action `Role 다시 확인` / `세션 다시 확인`이 유지됨과 `npm run verify:baseline` pass만 `Source-Backed`로 기록했다 (`docs/reports/2026-03-13-role-delayed-runtime-proof-qa.md`)
- [2026-03-13] Reviewer `admin-mobile-clarity-slice-fix`에서 `/admin/matrix` narrow re-review 결과 `No findings`; shared top intro가 중립 `Mobile Tab Prototype`으로 돌아가고 ops clarity copy가 `ops` branch 안에만 남아 off-scope reopen이 더 보이지 않았으며, `대상 학생 고정` 단계와 first-row/top-8 drift도 제거돼 mobile `ops` 흐름이 `범위 고정 -> 행 수정`으로 정리된 것을 확인했다 (`app/admin/matrix/page.tsx`, `npm run lint` pass, `npm run typecheck` pass) (`docs/reports/2026-03-13-admin-mobile-clarity-slice-fix-reviewer.md`)
- [2026-03-13] Builder 2 `admin-mobile-clarity-slice-fix` (`/admin/matrix`)에서 reviewer follow-up으로 extra desktop-shell intro copy를 제거하고 shared top intro label을 중립 baseline으로 되돌렸으며, misleading `대상 학생 고정` 단계와 first-row/top-8 선택 상태를 제거해 mobile `ops` 흐름을 `현재 상태 -> 범위 고정 -> 행 수정`으로 다시 좁혔다 (`app/admin/matrix/page.tsx`, `npm run lint` pass, `npm run typecheck` pass) (`docs/reports/2026-03-13-admin-mobile-clarity-slice-fix-builder.md`)
- [2026-03-13] Reviewer `admin-mobile-clarity-slice`에서 `/admin/matrix` diff narrow review 결과 findings 2건을 기록했다; mobile `ops` 흐름 정리 자체는 보이지만 이번 diff가 `class/account` 탭, lesson local-mock, desktop shell copy까지 함께 열어 package 경계를 넘었고, 새 `대상 학생 고정` 단계도 첫 행/상위 8명에 고정돼 실제 우선 작업 행과 쉽게 어긋난다고 판단했다 (`app/admin/matrix/page.tsx`, `npm run lint` pass, `npm run typecheck` pass) (`docs/reports/2026-03-13-admin-mobile-clarity-slice-reviewer.md`)
- [2026-03-13] Builder 2 `admin-mobile-clarity-slice` (`/admin/matrix`)에서 mobile `ops` 탭을 `현재 상태 -> 범위 고정 -> 학생 고정 -> 행 수정` 흐름으로 다시 정리했다; 상단 상태 카드는 `matrixStatusLabel / quick guide / 현재 조회 범위 / 핵심 지표`를 current-state-first로 묶고, `Next Action`의 중복 월/클래스/재조회 액션은 제거해 `MatrixFilters` 블록으로 합쳤으며, section jump CTA와 `대상 학생 고정`/`행 수정` 헤더를 추가해 mobile scannability와 detail access를 좁게 올렸다 (`app/admin/matrix/page.tsx`, `npm run lint` pass, `npm run typecheck` pass) (`docs/reports/2026-03-13-admin-mobile-clarity-slice-builder.md`)
- [2026-03-13] Builder `validation-playbook-tightening`에서 `docs/VERIFY.md`를 보강해 student read-flow, admin mutation confidence UI, route-local local-mock truth, docs-only package 검증, handoff evidence minimum 기준을 추가했다 (`docs/reports/2026-03-13-validation-playbook-tightening-builder.md`)
- [2026-03-13] Builder 1 `student-web-guideline-focus-and-input-fix` (`/student`)에서 주요 interactive control에 공통 focus-visible ring을 적용하고 login input을 mobile `16px+` 기준으로 정리했으며 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-web-guideline-focus-and-input-fix-builder.md`)
- [2026-03-13] Builder 2 `admin-web-guideline-mobile-input-fix` (`/admin/matrix`)에서 lesson registration/select와 admin login input을 mobile `16px+` 기준으로 정리했고 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-admin-web-guideline-mobile-input-fix-builder.md`)
- [2026-03-13] Reviewer `student-web-guideline-focus-and-input-fix-review`에서 `/student` follow-up은 `web-design-guidelines` finding이었던 focus-visible ring 누락과 mobile login input typography 문제를 route-local 범위에서 해소한 것으로 확인했다; top bar / auth / CTA / bottom tab 주요 control에 공통 focus ring이 들어가고 login email/password input이 mobile 기준 16px(`text-base`) 이상으로 정리돼 `No findings`로 닫았다 (`docs/reports/2026-03-13-student-web-guideline-focus-and-input-fix-reviewer.md`)
- [2026-03-13] Reviewer `admin-web-guideline-mobile-input-fix-review`에서 `/admin/matrix` follow-up은 `web-design-guidelines` finding이었던 mobile input auto-zoom risk를 route-local 범위에서 해소한 것으로 확인했다; lesson class select / title / video input과 admin login email/password input이 mobile 기준 16px(`text-base`) 이상으로 정리되고 desktop은 `md:text-sm` 및 기존 control density를 유지해 `No findings`로 닫았다 (`docs/reports/2026-03-13-admin-web-guideline-mobile-input-fix-reviewer.md`)
- [2026-03-13] Reviewer `admin-account-and-ops-copy-consistency-fix-review`에서 `/admin/matrix` follow-up은 직전 finding이었던 account 탭 status/next-action copy와 actual disabled policy 불일치를 해소한 것으로 확인했다; `isSessionActionRunning` 중 상단 copy는 `로그아웃 / 세션 초기화` 잠금과 `재확인` 계열 계속 가능이라는 현재 truth에 맞춰졌고 `No findings`로 닫았다 (`docs/reports/2026-03-13-admin-account-and-ops-copy-consistency-fix-reviewer.md`)
- [2026-03-13] Reviewer `student-profile-action-copy-fix-review`에서 `/student` follow-up은 직전 finding이었던 `내정보` 탭 helper copy와 실제 CTA 범위 불일치를 해소한 것으로 확인했다; helper copy, refresh 버튼, 상태 pill이 모두 `읽기 상태 다시 불러오기 + 로그아웃` 범위 안에서 설명돼 `No findings`로 닫았다 (`docs/reports/2026-03-13-student-profile-action-copy-fix-reviewer.md`)
- [2026-03-13] Builder 2 `admin-account-and-ops-copy-consistency-fix` (`/admin/matrix`)에서 account 탭 상단 status/next-action copy를 실제 버튼 정책에 맞게 좁혔다; `재확인` 계열은 계속 가능하고 `로그아웃 / 세션 초기화`만 잠긴다는 현재 truth를 반영했고 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-admin-account-and-ops-copy-consistency-fix-builder.md`)
- [2026-03-13] Builder 1 `student-profile-action-copy-fix` (`/student`)에서 `내정보 > 직접 동작` helper copy, refresh 버튼, 상태 pill을 모두 `읽기 상태 다시 불러오기 + 로그아웃` 범위에 맞게 좁혔고 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-profile-action-copy-fix-builder.md`)
- [2026-03-13] Reviewer `student-tab-polish-and-empty-state-clarity-review`에서 `/student` 탭 polish / empty-state 정리는 `Classes / Weeks / Content` 패널의 loading/empty 톤과 `수업` 탭 helper 흐름은 대체로 일관되게 유지했지만, `내정보 > 직접 동작` helper가 실제로는 dashboard refetch와 logout만 제공하면서 `현재 계정과 읽기 상태를 다시 확인`할 수 있다고 안내해 CTA truth보다 넓게 읽힌다고 지적했다 (`docs/reports/2026-03-13-student-tab-polish-and-empty-state-clarity-reviewer.md`)
- [2026-03-13] Reviewer `admin-account-and-ops-copy-clarity-review`에서 `/admin/matrix` 운영/계정 탭 copy 정리는 전반적으로 current-state-first를 유지했지만, `계정` 탭이 `세션/권한 액션 실행 중`일 때 다른 세션 액션이 잠긴다고 안내하면서도 실제로는 `세션 + 권한 다시 확인`과 `권한만 다시 확인` 버튼을 비활성화하지 않아 copy와 버튼 상태가 어긋난다고 지적했다 (`docs/reports/2026-03-13-admin-account-and-ops-copy-clarity-reviewer.md`)
- [2026-03-13] Builder 2 `admin-account-and-ops-copy-clarity` (`/admin/matrix`)에서 `운영 / 계정` 탭 copy를 current-state-first 기준으로 정리했다; 현재 조회 범위 / 저장·오류 / 다음 행동 / 대상 학생 고정 / 세션·권한 액션 문구와 버튼 라벨을 더 직접적으로 다듬었고 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-admin-account-and-ops-copy-clarity-builder.md`)
- [2026-03-13] Builder 1 `student-tab-polish-and-empty-state-clarity` (`/student`)에서 `Classes / Weeks / Content` 패널 empty-state, `수업 / 내정보` 탭 helper copy, CTA 문구를 route-local 범위에서 일관되게 정리했고 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-tab-polish-and-empty-state-clarity-builder.md`)
- [2026-03-13] QA `admin-mutation-confidence-ui-qa`에서 `npm run verify:baseline` 통과와 함께 admin mutation confidence 패키지의 `running / saved / error / retry` 가시성, raw `week1` key prefix/title 누수 해소가 코드 기준 `Source-Backed`로 정합함을 기록했다; 브라우저 runtime proof는 이번 패키지에서 확보하지 못했고 서버 상세 오류 문자열의 raw key 가능성은 residual risk로 남겼다 (`docs/reports/2026-03-13-admin-mutation-confidence-ui-qa.md`)
- [2026-03-13] Reviewer `student-selected-week-gap-priority-fix-review`에서 `/student` follow-up은 직전 finding이었던 `selectedWeek === null` 경계 해석 불일치를 해소한 것으로 확인했다; `Current State` / `Next Read` / `내 상태 요약` / `확인 우선순위`가 모두 `readTargetGapSummary`를 먼저 적용해 `선택 필요` 의미를 우선 공유하므로 `No findings`로 닫았다 (`docs/reports/2026-03-13-student-selected-week-gap-priority-fix-reviewer.md`)
- [2026-03-13] Reviewer `admin-class-content-flow-clarity-fix-review`에서 `/admin/matrix` follow-up은 직전 finding 2건을 모두 해소한 것으로 확인했다; `공개/초안` copy는 `이 탭 local mock` 범위로 좁혀졌고, 편집 중 항목 삭제 시 deleting 상태가 summary / form copy / button 라벨에서 editing보다 우선 반영돼 `No findings`로 닫았다 (`docs/reports/2026-03-13-admin-class-content-flow-clarity-fix-reviewer.md`)
- [2026-03-13] Reviewer `student-home-status-empty-consistency-fix-review`에서 `/student` follow-up은 `weekCount === 0` 경계는 공통 summary로 정리했지만, `selectedWeek === null`의 일시 경계에서는 `Next Read`만 `선택 필요`를 우선하고 `Current State` / `내 상태 요약` / `확인 우선순위`는 여전히 attention 분기를 먼저 타서 같은 의미를 완전히 공유하지 못한다고 지적했다 (`docs/reports/2026-03-13-student-home-status-empty-consistency-fix-reviewer.md`)
- [2026-03-13] Reviewer `admin-class-content-flow-clarity-review`에서 `/admin/matrix` 수업 탭 clarity 패키지는 auth / role / API / DB / upload 계약을 직접 열지는 않았지만, `공개/초안` copy가 local route-state truth보다 넓게 `학생 mock 소비 목록`을 언급해 cross-surface 의미를 과장하고, 현재 편집 중인 항목을 삭제할 때 상단 `Editing State` / `Next Action`이 삭제 흐름보다 편집 흐름을 계속 보여 상태 해석이 어긋날 수 있다고 지적했다 (`docs/reports/2026-03-13-admin-class-content-flow-clarity-reviewer.md`)
- [2026-03-13] Reviewer `student-home-status-clarity-follow-up-review`에서 `/student` home/status clarity 패키지는 inline media consume 흐름과 shared auth / refetch / wrong-role / recovery 경계는 route-local 범위에 유지했지만, `classes.length > 0`인데 실제 읽을 주차가 하나도 없는 경우를 `Current State` / `내 상태 요약` / `확인 우선순위`가 empty가 아니라 `정상`/`안정`/`급한 주차 없음`으로 분류해 `Next Read`의 `주차 선택 필요` 안내와 어긋날 수 있다고 지적했다; `weekCount === 0` 또는 `selectedWeek === null` 경계를 별도 empty-like 분기로 다룰 필요가 있다 (`docs/reports/2026-03-13-student-home-status-clarity-follow-up-reviewer.md`)
- [2026-03-13] Reviewer `admin-mutation-confidence-copy-fix-review`에서 `/admin/matrix` follow-up은 직전 finding이었던 raw `week1` key의 prefix/title 누수를 해소했고, `useMatrixRowActions`의 공용 field label helper가 현재 `page`와 `MatrixRow` 안에서만 재사용돼 route-local 범위를 넘지 않음을 확인해 `No findings`로 닫았다; 다만 서버 상세 오류 문자열 자체에 raw key가 들어오면 `세부 원인` 영역에는 그대로 보일 수 있다는 점은 residual risk로 남는다 (`docs/reports/2026-03-13-admin-mutation-confidence-copy-fix-reviewer.md`)
- [2026-03-13] Reviewer `student-inline-weekly-media-scope-fix-review`에서 `/student` inline weekly media follow-up은 직전 finding이었던 `weekNumber` 단독 기준 mock 재사용 문제를 해소했고, helper/상세 패널/`Content Context` 모두 `class + week` local mock scope를 명시함을 확인해 `No findings`로 닫았다; `Feedback / Progress / Reflection`과 shared auth / refetch / wrong-role / recovery 의미 확장도 보이지 않았다 (`docs/reports/2026-03-13-student-inline-weekly-media-scope-fix-reviewer.md`)
- [2026-03-13] Reviewer `admin-mutation-confidence-ui-review`에서 `/admin/matrix` mutation confidence UI는 `MatrixTable` / `MatrixRow` / 상단 `Mutation Status` / `Next Action` / `Row Detail Entry` 모두 route-local 범위와 auth / role / API / DB / export 경계를 지켰지만, 실제 출석 저장 실패 문구는 hook에서 raw `week1` 키를 그대로 받아 `week1 출석 저장 실패`처럼 노출돼 이번 패키지가 정리한 한국어 상태 라벨 체계와 어긋난다고 지적했다; 오류 copy도 `1주차 출석 저장 실패` 같은 UI 라벨 체계로 맞출 필요가 있다 (`docs/reports/2026-03-13-admin-mutation-confidence-ui-reviewer.md`)
- [2026-03-13] Reviewer `student-inline-weekly-media-prototype-review`에서 `/student` inline weekly media prototype은 route-local 범위와 기존 `Feedback / Progress / Reflection`, shared auth / role / refetch / wrong-role / recovery 의미는 대체로 유지했지만, 실제 inline media preset 선택이 `weekNumber`만 기준이라 builder report/copy가 말하는 `class -> week -> content` 맥락보다 구현 truth가 약하다고 지적했다; 같은 주차 번호를 가진 다른 클래스 사이에서 동일 mock media가 재사용될 수 있어 현재 truth에 맞는 copy 축소 또는 preset scope 보정이 필요하다 (`docs/reports/2026-03-13-student-inline-weekly-media-prototype-reviewer.md`)
- [2026-03-13] Owner `student-inline-playback-direction-spec-sync`에서 학생 화면의 선택 주차 안에서 바로 영상 플레이가 가능한 방향을 `docs/SPEC.md`에 baseline intent로만 반영했다; 현재 구현 truth로 과장하지 않고 weekly content media 방향에 추가했다 (`docs/reports/2026-03-13-student-inline-playback-direction-spec-sync-owner.md`)
- [2026-03-13] Owner `weekly-media-baseline-spec-sync`에서 이미지/영상 기능 방향도 `docs/SPEC.md`에 반영했다; 주차 콘텐츠를 `클래스 -> 주차 -> 콘텐츠` 맥락 안에서 다루고, admin `수업` 탭의 YouTube/이미지 등록 및 공개/수정/삭제, student `수업` 탭의 주차별 콘텐츠 소비를 baseline intent로 남겼으며 현재는 prototype/local mock 범위임을 명시했다 (`docs/reports/2026-03-13-weekly-media-baseline-spec-sync-owner.md`)
- [2026-03-13] Owner `mobile-tab-baseline-spec-sync`에서 현재 keep된 mobile tab prototype 방향을 `docs/SPEC.md`에 stable baseline으로 반영했다; SPM UI/UX 방향, admin/student 탭 구조, `클래스 -> 주차 -> 콘텐츠` 흐름 우선, 가로 고정 탭바 + 탭 위 내부 스크롤 원칙을 제품 intent로 명시했다 (`docs/reports/2026-03-13-mobile-tab-baseline-spec-sync-owner.md`)
- [2026-03-13] User check 기준으로 현재 mobile tab prototype은 `keep`으로 잠겼다; `/student`와 `/admin/matrix`의 현 구조를 baseline으로 유지하고, 다음 단계는 shell 재수정보다 그 위의 작은 value slice 1건 선택으로 넘긴다
- [2026-03-13] Reviewer `admin-horizontal-tabbar-alignment`에서 `/admin/matrix` mobile tabbar가 학생 쪽과 유사한 가로 선택 바로 정리됐고, 탭/본문 분리와 shell 내부 스크롤 confinement, md+ desktop 분리가 모두 유지됨을 확인해 `No findings`로 닫았다 (`docs/reports/2026-03-13-admin-horizontal-tabbar-alignment-reviewer.md`)
- [2026-03-13] Builder 2 follow-up에서 `/admin/matrix` 하단 탭을 `position: fixed`로 조정해 스크롤 최하단이 아니라 viewport 최하단에 항상 고정되도록 보정했고, 본문은 기존 `admin-mobile-scroll` 하단 패딩으로 탭 위에서만 보이게 유지했다 (`app/admin/matrix/page.tsx`, `npm run lint` pass, `npm run typecheck` pass)
- [2026-03-13] Builder 2 `admin-horizontal-tabbar-alignment` (`/admin/matrix`)에서 mobile tabbar를 학생 쪽과 유사한 가로 선택 바로 정렬하고, `admin-mobile-shell` 시각 분리 + `admin-mobile-tabbar` 하단 절대 고정 + `admin-mobile-scroll` 하단 safe-area 패딩을 적용해 본문 스크롤을 shell 내부로 제한했다 (`app/admin/matrix/page.tsx`, `npm run lint` pass, `npm run typecheck` pass) (`docs/reports/2026-03-13-admin-horizontal-tabbar-alignment-builder.md`)
- [2026-03-13] Owner `admin-horizontal-tabbar-alignment`에서 `/admin/matrix` 후속 패키지를 다시 열었다; 학생 쪽은 유지하고, 관리 쪽만 학생처럼 `가로 탭 선택 + 탭/본문 분리` 체감으로 다시 맞추는 single-lane route-local follow-up이다 (`docs/reports/2026-03-13-admin-horizontal-tabbar-alignment-owner.md`)
- [2026-03-13] Builder 2 `admin-fixed-tabbar-shell` (`/admin/matrix`)에서 mobile shell을 `본문 스크롤 영역 + 가로 고정 탭바` 구조로 재정렬했다; authorized 루트에 `viewport/flex/min-height/overflow` 전파를 명시해 전체 페이지 동반 스크롤을 막고, md+에서는 desktop 분리 레이아웃을 유지했다 (`app/admin/matrix/page.tsx`, `npm run lint` pass, `npm run typecheck` pass) (`docs/reports/2026-03-13-admin-fixed-tabbar-shell-builder.md`)
- [2026-03-13] Builder 1 `student-fixed-tabbar-shell` (`/student`)에서 authorized shell 탭 메뉴를 하단 가로 고정 바(`flex` 1열, 각 탭 `flex-1`)로 정리하고, 본문을 `min-h-0 + flex-1 + overflow-y-auto` 독립 스크롤 영역으로 고정했다; `overflow/min-height/flex/viewport` 전파를 명시해 전체 페이지 스크롤 개입을 줄였고 shared auth/session, `useStudentDashboard`, API/DB/RLS/RPC, selection/refetch/recovery 의미는 유지했다 (`app/student/page.tsx`, `npm run lint` pass, `npm run typecheck` pass) (`docs/reports/2026-03-13-student-fixed-tabbar-shell-builder.md`)
- [2026-03-13] Owner `admin-student-fixed-tabbar-shell`에서 user feedback 기준 후속 패키지를 열었다; `/student`, `/admin/matrix` 모두 탭 메뉴를 가로 고정 바 형태로 정리하고, 본문이 탭 위 영역 안에서만 보이거나 스크롤되도록 shell/layout만 좁게 수정하는 `limited-parallel` 패키지다 (`docs/reports/2026-03-13-admin-student-fixed-tabbar-shell-owner.md`)
- [2026-03-13] Owner 판단으로 `admin-student-mobile-tab-prototype`는 code/review 기준 닫는다; Builder 1의 `/student` mobile tab prototype과 Builder 2의 `/admin/matrix` mobile tab prototype, 그리고 `admin-mobile-tab-prototype-review-fix` narrow review가 모두 완료됐고 최종 reviewer report는 `No findings`였다. 남은 리스크는 mobile/runtime 실기기 체감 확인이다 (`docs/reports/2026-03-13-admin-mobile-tab-prototype-review-fix-reviewer.md`)
- [2026-03-13] Reviewer `admin-mobile-tab-prototype-review-fix`에서 requested narrow check(fake class scope 제거, desktop breakpoint 강제 해제, route-local 범위, 계약 비확장, lint/typecheck)을 확인했고 `No findings`로 닫았다 (`docs/reports/2026-03-13-admin-mobile-tab-prototype-review-fix-reviewer.md`)
- [2026-03-13] Builder 2 `admin-mobile-tab-prototype-review-fix` (`/admin/matrix`)에서 fake class fallback을 제거하고 수업 탭을 실제 클래스 스코프 기반으로만 동작하게 수정했으며, mobile bottom tab shell을 md 미만으로 제한하고 md+는 desktop 분리 레이아웃으로 전환해 breakpoint 강제 적용을 해제했다 (`docs/reports/2026-03-13-admin-mobile-tab-prototype-review-fix-builder.md`)
- [2026-03-13] Builder 1 `student-mobile-tab-prototype` (`/student`)에서 authorized 화면을 mobile-first bottom-tab(`홈 / 수업 / 내상태 / 내정보`) 구조로 재구성하고, `수업` 탭 내부를 `클래스 -> 주차 -> 콘텐츠` 연속 소비 흐름으로 정리했다; loading/sync/normal 상태 표식과 상태 우선 카드 리듬을 추가했으며 shared auth/session hook, `useStudentDashboard`, API/DB/RLS/RPC, selection/refetch/recovery 의미는 유지했다 (`app/student/page.tsx`, `npm run lint` pass, `npm run typecheck`는 기존 `/admin/matrix` 타입 오류로 실패) (`docs/reports/2026-03-13-student-mobile-tab-prototype-builder.md`)
- [2026-03-13] Builder 2 `admin-mobile-tab-prototype` (`/admin/matrix`)에서 mobile-first bottom-tab(`운영 / 수업 / 계정`) 구조를 route-local로 구현했다; `운영` 탭 상단 요약에 home 성격을 흡수하고 `matrix/filter/CSV/row-detail/table` 흐름을 재배치했으며, `수업` 탭에 클래스 -> 주차 -> YouTube/이미지 mock 등록 + 공개/수정/삭제 local state를 추가했다 (`docs/reports/2026-03-13-admin-mobile-tab-prototype-builder.md`)
- [2026-03-13] Owner `admin-student-mobile-tab-prototype`에서 다음 프로토타입 방향을 `visual polish retry`가 아니라 `mobile tab IA + 핵심 운영/소비 흐름 검증`으로 다시 열었다; `Builder 1`은 `/student`에서 `홈 / 수업 / 내상태 / 내정보`, `Builder 2`는 `/admin/matrix`에서 `운영 / 수업 / 계정` 하단 탭 프로토타입을 맡고, 주차 미디어 등록/보기는 local mock UI 범위로만 허용한다 (`docs/reports/2026-03-13-admin-student-mobile-tab-prototype-owner.md`)
- [2026-03-13] Builder 1 `student-visual-feel-prototype` (`/student`)에서 기존 cockpit 구조를 유지한 채 first viewport를 `Current State` 중심 카드/배지 계층으로 재정리하고, 클래스/주차 패널의 상태 신호와 모바일 `클래스 -> 주차 -> 상세` 단계 흐름(3-step + hint + 단계 제한)을 강화해 읽기 우선 리듬을 끌어올렸다; shared auth/session hook, `useStudentDashboard`, API/DB/RLS/RPC, selection/refetch/recovery 의미는 유지했고 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-student-visual-feel-prototype-builder.md`)
- [2026-03-13] Builder 2 `admin-matrix-visual-feel-prototype` (`/admin/matrix`)에서 first viewport를 `현재 상태 -> 다음 행동 -> 필터 설정 -> row entry` 순서로 재배치하고, 상태/범위/핵심 지표 카드를 분리해 mobile 스캔 흐름을 명확히 했다; 필터/테이블 사이에 `Row Entry Order` 가이드를 두어 결제-출석-오류 재시도 순서를 고정했고 `npm run lint`, `npm run typecheck`를 통과했다 (`docs/reports/2026-03-13-admin-matrix-visual-feel-prototype-builder.md`)
- [2026-03-13] Owner `student-admin-visual-feel-prototype` package를 열어 `/student`와 `/admin/matrix` 둘 다에서 실제 톤을 빠르게 확인할 수 있는 bounded route-local prototype slice를 정의했다; `Builder 1`은 `/student`, `Builder 2`는 `/admin/matrix`를 맡고, shared auth / role / DB / mutation / export 계약은 건드리지 않은 채 Reviewer 결합 검토로 닫는다 (`docs/reports/2026-03-13-student-admin-visual-feel-prototype-owner.md`)
- [2026-03-13] Owner `admin-ux-operator-confidence-plan`에서 SPM UI/UX 방향을 `polished appearance`보다 `admin-first operator confidence` 우선으로 잠그고, 실행 순서를 `Admin Matrix mobile clarity -> Mutation confidence -> Auth/Role/Fallback clarity -> Repeatable validation -> Visual polish layer`로 재정렬했다; broad redesign는 보류하고 현재 active scope 안에서 reviewable slice만 연다 (`docs/reports/2026-03-13-admin-ux-operator-confidence-plan-owner.md`)
- [2026-03-12] User check 기준으로 `/student` authorized 3패널 가시성, same-user refetch 안정성, mobile `클래스 -> 주차 -> 상세` 흐름, wrong-role / account switch stale safety가 모두 통과로 확인돼 `student-admin-cockpit-qa`는 실사용 체감 기준으로 닫는다; 다음 우선순위는 다음 bounded feature 1건 선택 또는 repeatable validation follow-up 결정이다
- [2026-03-12] Reviewer `student-authorized-layout-height-fix`에서 `/student` authorized cockpit 높이 후속 수정이 viewport/flex/min-height/overflow layout 범위에 머물렀고 기존 auth/data/refetch 계약을 깨지 않음을 확인해 `No findings`로 닫았다
- [2026-03-12] Builder1 `student-authorized-layout-height-fix` (`/student`)에서 authorized cockpit `0x0` 붕괴를 레이아웃 범위에서만 수정했다: viewport 높이(`100vh/100dvh`)와 내부 `height/min-height/flex/overflow` 전파를 명시하고 mobile/desktop 표시 전환을 파일 내부 media query로 고정해 요약 아래 `Classes / Week Board / Week Detail` 3패널이 다시 실제 높이를 갖도록 조정했다(`app/student/page.tsx`, lint/typecheck pass); auth 분기/role·recovery 문구/data owner guard/refetch 계약 및 `/admin/matrix`/DB 경계는 유지했다
- [2026-03-12] QA `student-admin-cockpit-qa`에서 `/admin/matrix` first viewport / refetch / empty / error / CSV는 blocker 없이 runtime 확인됐지만, `/student` authorized cockpit은 요약 아래 `Classes / Week Board / Week Detail` 섹션이 rendered runtime에서 `0x0`으로 접혀 first viewport·same-user refetch·mobile flow·account switch 확인이 모두 막히는 blocker가 재현됐다; follow-up은 `/student` authorized layout height만 좁게 수정한 뒤 같은 QA를 다시 돌리는 것이다 (`docs/reports/2026-03-12-student-admin-cockpit-qa-qa.md`)
- [2026-03-12] `student-admin-cockpit-redesign` package는 `/student`의 recovery/cache-safety/refetch-stability follow-up이 모두 `No findings`로 닫히면서 code/review 기준 종료했다; 다음 우선순위는 `/student` + `/admin/matrix` rendered/runtime 체감을 확인하는 `student-admin-cockpit-qa` QA-only slice다
- [2026-03-12] Builder `agent-completion-windows-notify` 8차 후속으로 알림 허용 역할에 `Explorer`를 추가했다(최종 허용: `Owner/Builder 1/Builder 2/Reviewer/QA/Explorer`)
- [2026-03-12] Reviewer `student-cockpit-refetch-stability-fix-review`에서 same-user refetch 중 cockpit flicker 제거, selection 유지, 상단/요약 동기화 신호 분리, cross-user owner guard / error panel / week reset 유지가 코드와 정합함을 확인해 `No findings`로 닫았다
- [2026-03-12] Builder `agent-completion-windows-notify` 7차 후속으로 알림 대상을 `Owner/Builder 1/Builder 2/Reviewer/QA`로 고정하고 `Builder` 일반 표기/`Agent`/기타 문자열은 미알림 처리하도록 제한했다
- [2026-03-12] Builder1 `student-cockpit-refetch-stability-fix` (`/student`)에서 초기 로딩(no data)과 same-user refetch(has data)를 분리해 `ClassListPanel`/`WeekBoardPanel` placeholder 깜빡임을 제거했고, cockpit은 유지한 채 상단/요약에만 동기화 신호를 노출하도록 조정했다(`app/student/page.tsx`, lint/typecheck pass)
- [2026-03-12] Builder `agent-completion-windows-notify` 6차 후속으로 `task_complete`에 역할 키워드가 없을 때를 보완하기 위해 직전 `user_message` 역할 힌트를 저장/재사용하도록 watcher를 개선했다
- [2026-03-12] Reviewer `student-cockpit-cache-safety-fix`에서 cross-user stale cockpit 차단 자체는 확인했지만, same-user refetch 시 `ClassListPanel`/`WeekBoardPanel`이 `isLoading` placeholder로 즉시 바뀌어 cockpit이 여전히 깜빡인다고 지적했다
- [2026-03-12] Builder1 `student-cockpit-cache-safety-fix` (`/student`)에서 same-user refetch는 유지하면서 user 전환/세션 해제/새 user fetch 실패 시 이전 학생 cockpit이 남지 않도록 `data owner` 가드를 추가했다(`hooks/useStudentDashboard.ts`, `app/student/page.tsx`, lint/typecheck pass)
- [2026-03-12] Builder `agent-completion-windows-notify` 5차 후속으로 무역할 기본값 `Agent`는 watcher 알림을 보내지 않도록 변경했다(역할이 명시적으로 판정된 경우에만 알림)
- [2026-03-12] Reviewer `student-cockpit-recovery-fix`에서 마지막 성공 dashboard data 유지가 사용자 전환에도 적용돼 새 학생 계정 아래에 이전 학생 cockpit이 남을 수 있다고 지적했다; authorized refresh 분리 / error panel 전환 / class 변경 시 주차 초기화 자체는 코드와 정합했다
- [2026-03-12] Builder `agent-completion-windows-notify` 4차 후속으로 Windows balloon 한글 깨짐을 피하기 위해 알림 문자열을 ASCII로 통일하고(`ROLE`, `Agent response completed`), `builder1`/`builder2` 표기 매칭을 추가했다
- [2026-03-12] Builder `agent-completion-windows-notify` 3차 후속으로 알림 payload를 고정/정규화해 사용자 입력 문자열이 알림 본문으로 섞이지 않도록 막았다(제목/메시지 고정, 역할 화이트리스트 강제)
- [2026-03-12] Builder1 `student-cockpit-recovery-fix` (`/student`)에서 cockpit 구조를 유지한 채 회귀 4건을 최소 수정으로 복구했다: authorized 새로고침을 대시보드 재조회로 분리, fetch error 시 summary 0 fallback 제거, fetch error 시 placeholder 패널 대신 명시적 error panel 렌더, 클래스 변경 시 우선 주차로 selection 초기화
- [2026-03-12] Builder `agent-completion-windows-notify` 2차 후속으로 대화형 `codex`에서도 응답 완료마다 알림이 오도록 `task_complete` watcher + `codex-chat` 래퍼를 추가했다
- [2026-03-12] Builder `agent-completion-windows-notify` 후속으로 사용자 런타임 결과(`toast` 실패, `balloon`/`messagebox` 성공)에 맞춰 기본 알림 방식을 `balloon`으로 고정했다
- [2026-03-12] Builder `agent-completion-windows-notify`에서 에이전트 작업 완료 시 역할명 중심으로 Windows 알림을 보내는 스크립트 세트(`toast/balloon/messagebox/auto`)와 WSL 래퍼를 추가했다; 샌드박스 제약으로 실제 팝업 런타임 증명은 못 했고 사용자 로컬 Windows에서 최종 확인이 필요하다
- [2026-03-12] Builder1 `student-shell-panel` (`/student`)에서 authorized 학생 화면을 `고정 shell + 내부 선택형 패널` 구조(상단 compact bar / 좌측 클래스 / 중앙 주차 보드 / 우측 상세 탭)로 재구성했고, fallback 분기는 compact state 카드로 단순화했다; shared auth hook / student dashboard contract / API/DB/RLS/RPC는 변경하지 않았으며 `lint`는 통과, `typecheck`는 기존 `/admin/matrix` 오류로 실패했다
- [2026-03-12] `student-surface-frame` package was closed after the disclosure follow-up landed with `No findings`; `/student` now has a first-view-first frame with detail disclosure and explicit `error`/`empty` separation inside the same route-local structure
- [2026-03-12] Reviewer `student-surface-error-disclosure-fix`에서 `/student` 클래스 상세 disclosure fallback의 `error`/`empty` 분리가 코드와 문서 모두 정합함을 확인해 `No findings`로 닫았다
- [2026-03-12] Builder1 `student-surface-error-disclosure-fix` (`/student`)에서 클래스 상세 disclosure fallback을 `error`와 `empty`로 분리해 fetch error 상태에서 empty 문구가 즉시 보이지 않게 최소 수정했다; first-view/disclosure 프레임과 기존 권한/세션 분기 동작은 유지했고 shared auth / DB / contract 변경은 없었다
- [2026-03-12] Reviewer `student-surface-frame` review에서 `/student` authorized 조회 실패 상태에서 상세 disclosure가 실제 empty처럼 보이는 misleading fallback을 지적했다; first-view 재구성 자체는 route-local 범위를 유지했다
- [2026-03-12] Builder1 `student-surface-frame` (`/student`)에서 first-view를 `핵심 요약 + next action + 핵심 metric`으로 고정하고, 긴 설명/보조 카드/클래스 상세/안내 텍스트를 하단 disclosure로 내려 정보 계층 기본 틀을 재구성했다; login_required/wrong-role/delayed/recovery 분기 동작은 유지했고 shared auth / DB / contract 변경은 없었다
- [2026-03-12] `student-admin-ui-guideline-polish` package was closed after the `/student` action-running follow-up landed with `No findings`; `/admin/matrix` guideline polish remained accepted route-local UI work, and the earlier local `build` failure is treated as a separate investigation item
- [2026-03-12] Reviewer `student-ui-action-running-fix`에서 `/student`의 `isSessionActionRunning` 의존 UI가 실제 동작 경로(로그아웃/세션 초기화)에만 남고 misleading 로그인/재확인 피드백은 제거됐음을 확인해 `No findings`로 닫았다
- [2026-03-12] Builder1 `student-ui-action-running-fix` (`/student`)에서 실제로 켜지지 않는 `isSessionActionRunning` 의존 피드백(로그인/세션 재확인/role 재확인)을 제거하고, 값이 실제로 켜지는 로그아웃/세션 초기화 경로에만 disabled/처리 중 피드백을 유지해 misleading 상태를 정리했다
- [2026-03-12] Reviewer `student-admin-ui-guideline-polish` review에서 `/student`의 새 action-running disabled/로딩 피드백이 실제 로그인/세션 재확인/role 재확인 경로에서는 켜지지 않는다고 지적했다; `/admin/matrix` guideline polish는 route-local 범위를 지켰다
- [2026-03-12] model / effort recommendation is now centralized in `docs/roles/OWNER.md`; role docs no longer duplicate non-automatic model guidance
- [2026-03-12] Builder1 `student-ui-guideline-polish` (`/student`)에서 로그인/복구 접근성을 web-design-guidelines 기준으로 정리해 auth 메시지 `aria-live`, 이메일/비밀번호 visible label, 주요 버튼 hover/focus-visible + action-running disabled 피드백을 추가했고 shared auth/API/DB 경계는 유지했다
- [2026-03-12] Reviewer `student-summary-count-fix`에서 `/student` 라벨 정합성 후속 수정에 `No findings`를 기록했다; `readableWeekCount`는 여전히 주차 단위 지표이며 새 라벨 `읽을 주차`와 의미가 일치한다
- [2026-03-12] Builder1 `student-summary-count-fix` (`/student`)에서 `readableWeekCount` 지표 라벨을 `읽을 메모`에서 `읽을 주차`로 맞춰 의미 불일치를 최소 수정으로 해소했다
- [2026-03-12] Reviewer `student-admin-surface-polish` combined review에서 `/student` 새 `읽을 메모` 지표가 실제 메모 수가 아니라 메모가 있는 주차 수를 세고 있음을 발견했다; `/admin/matrix` 변경은 route-local 범위를 지켰고 shared auth / API / DB / export 경계 확장은 없었다
- [2026-03-12] Builder2 `admin-summary-polish` (`/admin/matrix`) route-local 개선으로 조회 기준/표시 상태/빠른 안내 스캔성을 높이고, empty state에서 `월 변경 / 클래스 해제 / 재조회` 다음 행동을 명시했으며 denied/delayed/recovery 분기는 유지했다
- [2026-03-12] Builder1 `student-summary-polish` (`/student`) route-local 개선으로 현재 읽기 가능 상태 요약과 빈 상태 next-step 안내를 강화했고, wrong-role / fallback / recovery 분기는 유지했다
- [2026-03-12] `docs/WORKSTREAMS.md` now shows workstream closure in checklist form with `[x]` completed active-scope items and `[ ]` remaining gaps
- [2026-03-12] `AGENTS.md` was reduced to common contract rules and role-specific docs were expanded into practical checklists; `Explorer` helper doc was added
- [2026-03-12] role-specific helper docs were added under `docs/roles/*` so each active role can read a short checklist after `AGENTS.md`
- [2026-03-12] docs structure now separates `WORKSTREAMS` for big task-unit status, `PLAN` for execution slices, and `PROGRESS` for cumulative history / handoff
- [2026-03-12] merged rendered QA runtime-proved `/`, `/student`, and main denied/delayed `/admin/matrix` recovery surfaces on the merged result; `/admin/matrix` `role_delayed` remained without fresh runtime proof
- [2026-03-12] Reviewer found no findings in the `/admin/matrix` fixed-bar narrowing review: scope stayed route-local, denied/delayed flows kept inline recovery actions, and baseline checks passed
- [2026-03-12] Builder1 `/` + `/student` rendered QA re-proved anonymous fallback/recovery and runtime-proved `/student` wrong-role 안내 + `Admin Matrix` recovery action
- [2026-03-12] `/admin/matrix` rendered gap pass runtime-proved `session_delayed`, re-proved `unauthorized`, and removed denied-screen bottom action-bar overlap by narrowing the fixed bar to `authorized` view only; `role_delayed` remained unreproduced in this slice
- [2026-03-11] non-anonymous `/admin/matrix` denied/delayed QA runtime-proved `unauthorized`, `access_pending`, `role_unknown`, `role_delayed`; `session_delayed` remains unproven
- [2026-03-11] `docs/DECISIONS.md` was removed and local non-destructive command approval-free execution was clarified further
- [2026-03-11] active doc set was reduced by removing meta prompt/method docs and tightening `SPEC.md` / `VERIFY.md` roles
- [2026-03-11] anonymous `/admin/matrix` first-paint QA confirmed that rendered first paint no longer exposes admin shell elements
- [2026-03-11] `/admin/matrix` first-paint access clarity was tightened before admin controls render
- [2026-03-11] anonymous rendered fallback behavior for `/` and `/student` was runtime-proven; the earlier `/admin/matrix` first-paint issue from that pass was later superseded by the post-fix QA above

### Reading Hint
- check `In Progress` first for live lane status
- check `Recently Completed` next for the latest confirmed outcome
- use `Execution Defaults` below for the repo's default parallel boundary, not for the current live claim
- use the dated entries below for full implementation, review, and QA detail

## Current Snapshot

### Execution Defaults
- Default team shape: `Owner + Builder 1 + Builder 2 + Reviewer`
- Per-task execution mode: choose the smallest safe mode
- Preferred parallel split: `Builder 1` for `/student`, `Builder 2` for `/admin`
- Shared auth / permission / DB truth remains single-owner
- Merge owner: Owner / Lead
- Parallel write lanes should use separate worktrees or dedicated branches
- Current reality check: the latest package below was executed in a single shared worktree on `main`, not true parallel worktrees

### Product
- Product name: SPM (SocialPlusManager)
- Current main focus: stabilized admin core plus the next bounded feature slice
- Primary operating workflow: Codex CLI + document-driven development
- Official operating pattern: lightweight dual-builder model plus explicit Reviewer, with single-owner red zones

### Current Active Features
- Matrix 조회
- 결제 상태 변경
- 출석 상태 변경
- CSV export
- Admin core permission-aware flows
- Weekly video CRUD/read + weekly image upload/replace/delete/read baseline in lesson surface
- Mobile / in-app browser handling (1st-pass support)
- Student basic screen (`/student`)
- Test home hub (`/`)

### Removed / Deprecated Features
- Clone Enrollment UI and related flow are considered removed from the current active scope
- Do not reintroduce removed features unless explicitly planned again

### Auth / Access Status
- Email login flow is considered active
- Google login preview-domain issue was previously addressed and should be treated as resolved unless new evidence appears
- Admin read/export/mutation API guards now return explicit auth/permission outcomes
- Route-level fallback branches are explicit on `/`, `/student`, `/admin/matrix`
- `/admin/matrix` rendered proof now covers:
  - anonymous first paint
  - signed-in `unauthorized`
  - `access_pending`
  - `role_unknown`
  - `role_delayed`
  - `session_delayed`
- latest narrow gap pass note:
  - `role_delayed` recheck was attempted again but not reproduced in that specific run
- Remaining unproven fallback areas are narrower:
  - mobile / in-app-browser rendered behavior
  - broader cross-route non-anonymous rendered coverage

### Data / Mutation Status
- Matrix attendance and payment flows depend on current RPC / DB behavior
- Weekly media는 current docs/db truth를 따른다: video CRUD/read와 image upload/replace/delete/read가 active이고, local merged runtime QA에서 admin/student/storage cleanup까지 다시 확인했다
- DB-related behavior must be checked against `docs/db/SCHEMA.sql`, `docs/db/RLS.sql`, and `docs/db/RPC.sql`
- Payment / attendance mutation lanes should remain single-owner

### Mobile / Deployment Status
- In-app browser guidance and handling were addressed at least once
- Mobile and preview auth behavior should still be treated as sensitive and verified before broad assumptions

### Documentation Notes
- Historically, product docs and actual implementation have drifted at times
- If there is any conflict:
  - `PROGRESS.md` first for latest confirmed reality
  - `docs/WORKSTREAMS.md` for overall task-unit status
  - `docs/PLAN.md` for next intended execution order
  - `docs/SPEC.md` for stable product scope

## Detailed History

### [2026-03-13] Reviewer `admin-horizontal-tabbar-alignment` on `/admin/matrix`

- lane claim:
  - lane: `/admin/matrix`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `admin-horizontal-tabbar-alignment` narrow review (`app/admin/matrix/page.tsx` horizontal tab row / tab-body separation / shell scroll confinement)
  - merge dependency: none
- result:
  - `No findings`
- scope check:
  - `admin-mobile-tab-row` / `admin-mobile-tab-button` 조합으로 탭이 학생 쪽과 유사한 가로 선택 바 형태로 정리됐다
  - `admin-mobile-shell` / `admin-mobile-scroll` / `admin-mobile-tabbar` 분리로 탭과 본문 경계가 충분히 드러난다
  - 본문 스크롤은 `admin-main-shell--authorized` / `admin-authorized-shell` / `admin-mobile-scroll`의 `min-height` / `overflow` 체인 안에 제한된다
  - md+에서는 `admin-mobile-shell`이 숨고 `admin-desktop-shell`이 노출돼 mobile shell이 desktop에 강제 적용되지 않는다
  - 변경은 `app/admin/matrix/page.tsx` route-local 범위에 머물렀고 auth / role / mutation / export / DB / RLS / RPC 계약 확장은 보이지 않았다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-13-admin-horizontal-tabbar-alignment-reviewer.md`

### [2026-03-13] Owner `admin-horizontal-tabbar-alignment`

- lane claim:
  - lane: `single-lane`
  - role: `Owner`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `/admin/matrix` horizontal tabbar selection + tab/body separation follow-up
  - merge dependency: `Builder 2 -> Reviewer`
- summary:
  - user feedback 기준으로 `/student` 탭 셸은 유지 가능하지만 `/admin/matrix`는 아직 학생 쪽과 같은 가로 탭 선택 체감이 부족하고, 탭과 화면이 분리돼 보이지 않는다.
  - 따라서 combined review를 바로 열지 않고, `/admin/matrix`만 route-local single-lane follow-up으로 다시 정의했다.
  - 목표는 admin 탭을 학생 쪽 같은 가로 선택 바 체감으로 다시 맞추고, 탭/본문 분리와 탭 위 독립 스크롤 셸을 더 명확히 만드는 것이다.
  - auth / role / mutation / export / DB 계약, mock 범위, student route는 이번 follow-up에서 건드리지 않는다.
- report: `docs/reports/2026-03-13-admin-horizontal-tabbar-alignment-owner.md`

### [2026-03-13] Builder 2 `admin-horizontal-tabbar-alignment` on `/admin/matrix`

- lane claim:
  - lane: `/admin/matrix`
  - role: `Builder 2`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/admin/matrix/page.tsx` mobile horizontal tabbar alignment + tab/body separation follow-up
  - merge dependency: `Owner gate (Reviewer 미호출 상태)`
- summary:
  - 하단 탭을 `admin-mobile-tab-row (flex)` + `admin-mobile-tab-button (flex:1)` 구조로 고정해 세로 나열처럼 보이는 체감을 줄이고, 학생 쪽과 유사한 가로 선택 바 톤으로 재정렬했다.
  - `admin-mobile-shell`에 border/radius/background/shadow를 부여해 탭바와 본문이 한 덩어리처럼 보이지 않게 시각 경계를 강화했다.
  - `admin-mobile-tabbar`를 `absolute bottom` 고정 바로 전환하고, `admin-mobile-scroll`에는 safe-area 포함 하단 패딩을 추가해 본문이 탭 위 shell 내부에서만 독립 스크롤되도록 제한했다.
  - md+ 분리 규칙(`admin-mobile-shell` hide, `admin-desktop-shell` show)과 auth/role/mutation/export/DB 계약, mock 범위는 변경하지 않았다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-13-admin-horizontal-tabbar-alignment-builder.md`
- remaining risk:
  - 작은 viewport에서 상단 헤더가 길어지면 본문 first viewport 밀도가 높게 느껴질 수 있다.

### [2026-03-13] Owner `admin-student-fixed-tabbar-shell`

- lane claim:
  - lane: `limited-parallel`
  - role: `Owner`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `/student` + `/admin/matrix` tab shell/layout correction
  - merge dependency: `Builder 1 + Builder 2 -> Reviewer`
- summary:
  - 사용자 피드백은 prototype 구조 자체보다 shell 체감에 집중돼 있었다: 탭 메뉴가 세로로 보이지 말고 가로 고정 바여야 하며, 화면 본문은 그 위 영역에서만 보이거나 스크롤되어야 한다.
  - 이에 따라 다음 패키지는 IA나 mock 범위를 다시 열지 않고, route-local tab shell/layout follow-up으로 좁게 정의했다.
  - `Builder 1`은 `/student`, `Builder 2`는 `/admin/matrix`에서 horizontal fixed tabbar + content-above-tabbar scroll shell을 맞춘다.
  - shared auth / role / DB / mutation / export 계약, 데이터 의미, mock 범위 자체는 이번 패키지에서 변경하지 않는다.
- report: `docs/reports/2026-03-13-admin-student-fixed-tabbar-shell-owner.md`

### [2026-03-13] Builder 2 `admin-fixed-tabbar-shell` on `/admin/matrix`

- lane claim:
  - lane: `/admin/matrix`
  - role: `Builder 2`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/admin/matrix/page.tsx` 탭 가로 고정 바 + 본문 내부 스크롤 shell follow-up
  - merge dependency: `Reviewer`
- summary:
  - mobile shell을 `admin-mobile-scroll`(본문) + `admin-mobile-tabbar`(고정 바)로 분리해 탭바가 세로 스택처럼 보이지 않고 가로 고정 바로 유지되도록 조정했다.
  - authorized 루트에 `admin-main-shell--authorized`/`admin-authorized-shell`을 추가해 `viewport/flex/min-height/overflow` 전파를 명시하고 전체 페이지가 같이 밀리거나 스크롤되지 않게 제한했다.
  - md+에서는 기존 `admin-desktop-shell` 분리 레이아웃을 유지해 mobile tab shell 강제 적용을 피했다.
  - auth/role handling, matrix fetch/mutation/export contract, DB/RLS/RPC, mock 범위는 변경하지 않았다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-13-admin-fixed-tabbar-shell-builder.md`
- remaining risk:
  - 매우 작은 viewport에서 헤더 높이가 커지면 본문 가시 영역이 줄어드는 체감은 남을 수 있어, 후속 compact header slice가 있으면 더 안정적이다.

### [2026-03-13] Reviewer `admin-mobile-tab-prototype-review-fix` on `/admin/matrix`

- lane claim:
  - lane: `/admin/matrix`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `admin-mobile-tab-prototype-review-fix` narrow review (fake class scope / desktop breakpoint / route-local boundary / contract 확장 여부)
  - merge dependency: none
- result:
  - `No findings`
- scope check:
  - fake class scope fallback(`class-alpha`, `class-beta`) 제거 확인
  - mobile bottom tab shell이 md 미만에만 노출되고 md+는 desktop 분리 레이아웃으로 전환됨을 확인
  - 변경이 `app/admin/matrix/page.tsx` route-local 범위에 머무름을 확인
  - auth/role, matrix fetch/mutation/export, DB/RLS/RPC 계약 확장 없음
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-13-admin-mobile-tab-prototype-review-fix-reviewer.md`

### [2026-03-13] Builder 2 `admin-mobile-tab-prototype-review-fix` on `/admin/matrix`

- lane claim:
  - lane: `/admin/matrix`
  - role: `Builder 2`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: fake class scope 제거 + mobile shell breakpoint 분리 + 수업 탭 mock 범위 축소(route-local follow-up)
  - merge dependency: `Reviewer`
- summary:
  - `lessonClassOptions`의 fake fallback 클래스 주입을 제거하고, 클래스 스코프가 비어 있으면 `수업` 탭이 해당 current state를 먼저 노출하도록 조정했다.
  - 수업 탭의 mock은 콘텐츠 등록 상태(local state) 범위로만 제한하고, 클래스 스코프가 없을 때 선택/등록 액션을 비활성화했다.
  - mobile bottom tab shell을 `.admin-mobile-shell`로 제한하고 md+에서는 `.admin-desktop-shell` 고정 레이아웃을 사용해 desktop 강제 적용을 해제했다.
  - auth/role handling, matrix fetch/mutation/export contract, DB/RLS/RPC, shared abstraction은 건드리지 않았다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-13-admin-mobile-tab-prototype-review-fix-builder.md`

### [2026-03-13] Owner `admin-student-mobile-tab-prototype`

- lane claim:
  - lane: `limited-parallel`
  - role: `Owner`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `/student` + `/admin/matrix` mobile bottom-tab prototype 재정의
  - merge dependency: `Builder 1 + Builder 2 -> Reviewer`
- summary:
  - 사용자가 다음 프로토타입에서 보고 싶은 것은 단순 visual polish가 아니라 mobile tab 구조, admin 핵심 운영 흐름, student 주차 콘텐츠 소비 흐름, 주차 기반 영상/이미지 구조라는 점을 기준으로 패키지를 다시 열었다.
  - `Builder 1`은 `/student`에서 `홈 / 수업 / 내상태 / 내정보` 탭과 `클래스 -> 주차 -> 콘텐츠` 흐름을, `Builder 2`는 `/admin/matrix`에서 `운영 / 수업 / 계정` 탭과 `matrix/mutation`, `주차별 콘텐츠 등록` 흐름을 맡는다.
  - 현재 저장소에 없는 콘텐츠 등록/보기 계약은 local mock prototype까지만 허용하고, auth / role / DB / RLS / RPC / mutation / export 계약 확장은 금지했다.
  - shared tab shell이나 shared content schema 필요가 보이면 현재 패키지를 멈추고 별도 `single-lane` 후속으로 분리한다.
- report: `docs/reports/2026-03-13-admin-student-mobile-tab-prototype-owner.md`

### [2026-03-13] Builder 2 `admin-mobile-tab-prototype` on `/admin/matrix`

- lane claim:
  - lane: `/admin/matrix`
  - role: `Builder 2`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/admin/matrix/page.tsx` mobile-first bottom-tab prototype (`운영 / 수업 / 계정`) + 운영/수업 대표 흐름 2개 local mock 구현
  - merge dependency: `Reviewer`
- summary:
  - authorized 화면을 하단 탭 기반으로 재구성해 `운영 / 수업 / 계정` 전환을 모바일에서 즉시 접근 가능하게 만들고, `운영` 탭 상단에 home 성격 요약을 흡수했다.
  - `운영` 탭에서 `현재 상태/다음 행동/filter+CSV/row detail entry/table` 순으로 흐름을 정리하고, 학생 대상 고정 후 table로 내려가게 해 accidental mutation 체감을 낮췄다.
  - `수업` 탭에 `클래스 -> 주차 -> 콘텐츠 등록` mock IA를 추가하고, YouTube URL + 이미지 upload-like 입력, 공개/수정/삭제 상태 전이를 local state에서 표현했다.
  - `계정` 탭에 세션/role 재확인, 로그아웃, 세션 초기화 액션을 모아 운영 제어 진입점을 분리했다.
  - auth/role handling, matrix fetch/mutation contract, CSV/export contract, DB/RLS/RPC는 변경하지 않았다.
- validation:
  - `npm run lint`
  - `npm run lint -- --file app/admin/matrix/page.tsx`
  - `npx eslint app/admin/matrix/page.tsx`
  - `npm run typecheck`
- report: `docs/reports/2026-03-13-admin-mobile-tab-prototype-builder.md`
- remaining risk:
  - bottom-tab 고정 영역과 긴 목록 스크롤의 실제 runtime/mobile 체감은 Reviewer/QA에서 추가 확인이 필요하다.
  - `수업` 탭은 local mock state이므로 실제 콘텐츠 계약/API 연동 시 상태 전이 재설계가 필요하다.

### [2026-03-13] Builder 2 `admin-matrix-visual-feel-prototype` on `/admin/matrix`

- lane claim:
  - lane: `/admin/matrix`
  - role: `Builder 2`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/admin/matrix/page.tsx` 중심 route-local visual/IA prototype (summary/filter/list-table/row entry 스캔 순서 재정렬)
  - merge dependency: `Reviewer`
- summary:
  - authorized first viewport를 `Current State First` 카드로 시작하도록 바꿔 월/클래스/행 수/상태 배지와 핵심 운영 메트릭을 필터보다 먼저 노출했다.
  - `Next Action` 블록에서 `월 선택`, `클래스 전체`, `재조회`를 독립 배치해 필터/요약/액션이 한 덩어리처럼 보이던 문제를 완화했다.
  - `Filter Setup`과 `Row Entry Order` 안내를 분리해 table 진입 직전에 `결제 -> 주차별 출석 -> 오류 재시도` 순서를 명시했고 sync/error 카운트를 즉시 확인할 수 있게 했다.
  - auth/role 처리, matrix fetch/mutation 계약, CSV/export 계약, DB/RLS/RPC 및 shared 경계는 변경하지 않았다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-13-admin-matrix-visual-feel-prototype-builder.md`
- remaining risk:
  - source-backed 검증만 수행했으므로 실제 mobile runtime에서 row card 밀도 체감은 Reviewer/QA 후속 확인이 필요하다.

### [2026-03-13] Owner `student-admin-visual-feel-prototype`

- lane claim:
  - lane: `limited-parallel`
  - role: `Owner`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `/student` + `/admin/matrix` route-local visual/IA prototype package 정의
  - merge dependency: `Builder 1 + Builder 2 -> Reviewer`
- summary:
  - 사용자가 먼저 실제 화면 감을 보고 판단하고 싶다는 요청에 따라, 기존 우선순위를 폐기하지 않고 그 앞에 bounded proof package를 하나 추가했다.
  - 이 패키지는 최종 redesign가 아니라 `/student`와 `/admin/matrix`에서 `operator-first + polished` 방향이 얼마나 설득력 있게 보이는지 확인하기 위한 visual feel prototype이다.
  - default parallel boundary를 그대로 따라 `Builder 1`은 `/student`, `Builder 2`는 `/admin/matrix`를 맡고, 공통 do-not-touch는 shared auth / role / DB / RLS / RPC / mutation / export 계약으로 고정했다.
  - prototype 중 shared 경계를 건드려야 할 필요가 보이면 즉시 멈추고 후속 `single-lane` 패키지로 분리하기로 했다.
- report: `docs/reports/2026-03-13-student-admin-visual-feel-prototype-owner.md`

### [2026-03-13] Owner `admin-ux-operator-confidence-plan`

- lane claim:
  - lane: `planning`
  - role: `Owner`
  - kind: `docs`
  - code-change-allowed: `no`
  - scope: admin-first operator UX 방향 고정 및 다음 bounded package 우선순위 재정렬
  - merge dependency: none
- summary:
  - 사용자 제안과 현재 `WORKSTREAMS` / `PLAN` / `PROGRESS` 상태를 대조한 결과, SPM은 `consumer-app-inspired polish 일부 허용`보다 `admin-first operations clarity`를 우선하는 쪽이 현재 active scope와 가장 잘 맞는다고 정리했다.
  - workstream은 `Mobile IA`, `Admin Matrix UX`, `Mutation UX`, `Auth/Role/Fallback UX`, `Visual Polish`로 느슨하게 나누되, 실제 실행은 위험도 기준으로 `Admin Matrix mobile clarity -> Mutation confidence -> Auth / Role / Fallback clarity -> Repeatable validation -> Visual polish layer` 순서로 자르기로 했다.
  - broad redesign와 shared visual abstraction은 보류하고, `current state first`, `direct action labels`, `explicit async/unauthorized/wrong-role states`, `safe mutation`, `mobile scannability`를 다음 패키지 판단 기준으로 잠갔다.
- report: `docs/reports/2026-03-13-admin-ux-operator-confidence-plan-owner.md`

### [2026-03-12] Builder1 `student-authorized-layout-height-fix` on `/student`

- lane claim:
  - lane: `single-lane`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` authorized cockpit 본문의 height/viewport occupancy 회복
  - merge dependency: none
- summary:
  - `app/globals.css`의 현재 utility set에 `md:grid`, `md:grid-cols-[...]`, `h-screen`, `h-full`, `flex-1`, `min-h-0`, `overflow-y-auto`가 없어서 `/student` authorized cockpit이 md 이상에서 비가시/0크기로 수렴하던 문제를 source 기준으로 확인했다.
  - `baseLayout`에 `100vh/100dvh` 및 내부 `height: 100%`를 명시하고, panel frame/body와 panel 내부 스크롤 영역에 `minHeight: 0`, `flex: 1`, `overflow`를 추가해 높이 전파를 복구했다.
  - mobile/desktop cockpit 전환은 `student-cockpit-mobile`/`student-cockpit-desktop` + 컴포넌트 내부 media query로 고정해 md 이상에서 desktop 3패널 grid가 실제 렌더되도록 조정했다.
  - auth 분기, role/recovery 문구, `dashboardData` owner guard, same-user refetch 계약, `/admin/matrix`, DB/RLS/RPC 경계는 변경하지 않았다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-authorized-layout-height-fix-builder.md`
- remaining risk:
  - 이번 패스는 source-backed 검증이므로 rendered/runtime 기준의 first viewport 체감과 mobile section 전환 재증명은 Reviewer + QA 후속이 필요하다.

### [2026-03-12] Reviewer `student-authorized-layout-height-fix` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `app/student/page.tsx` authorized cockpit height/viewport occupancy 후속 검토
  - merge dependency: none
- result:
  - `No findings`
- scope check:
  - authorized 상태에서 요약 아래 `Classes / Week Board / Week Detail` 3패널 높이 전파가 viewport/flex/min-height/overflow 조정으로 연결됐다
  - 수정은 layout 범위에 머물렀고 auth 분기, role/recovery, data owner guard, same-user refetch 계약을 불필요하게 바꾸지 않았다
  - `/admin/matrix`, DB/RLS/RPC, shared auth 로직 변경은 보이지 않았다
  - builder report와 실제 코드가 정합했다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-authorized-layout-height-fix-reviewer.md`
- remaining risk:
  - source-backed review라 실제 viewport 점유 체감은 rendered QA가 있으면 더 안전하다

### [2026-03-12] Builder1 `student-cockpit-refetch-stability-fix` on `/student`

- lane claim:
  - lane: `single-lane`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` same-user refetch flicker 제거 및 초기 로딩/백그라운드 동기화 분리
  - merge dependency: none
- summary:
  - `studentDashboard.isLoading` 단일 플래그를 그대로 panel loading에 연결하지 않고, `dashboardData` 유무 기준으로 초기 로딩(`isInitialDashboardLoading`)과 백그라운드 refetch(`isDashboardSyncing`)를 분리했다
  - `ClassListPanel`/`WeekBoardPanel`은 초기 로딩 때만 placeholder를 렌더하도록 바꿔 same-user refetch 중에도 현재 클래스/주차/상세 선택 상태를 유지한다
  - refetch 진행 신호는 `StudentTopBar` 배지와 summary strip 상태 텍스트로만 노출하도록 조정했다
  - 기존 cross-user stale 방지 owner 가드(`dashboardData`), error panel 전환, class 변경 시 week reset 동작은 유지했다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-cockpit-refetch-stability-fix-builder.md`
- remaining risk:
  - source-backed 검증이라 실제 상호작용 체감은 rendered 리뷰에서 한 번 더 확인하면 안전하다

### [2026-03-12] Reviewer `student-cockpit-refetch-stability-fix-review` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `app/student/page.tsx` same-user refetch 안정화 후속 검토
  - merge dependency: none
- result:
  - `No findings`
- scope check:
  - same-user refetch는 `isInitialDashboardLoading` / `isDashboardSyncing` 분리로 cockpit placeholder 전환 없이 유지된다
  - 현재 클래스/주차/상세 selection은 same-user refetch 중 유지되고, class 변경 시 week reset 규칙만 남아 있다
  - 동기화 신호는 상단 배지와 summary strip에만 노출되고, cockpit 패널 교체는 일어나지 않는다
  - cross-user stale 방지 owner guard, explicit error panel, class 변경 시 week reset은 유지된다
  - shared auth/API/DB/RLS/RPC 및 `/admin/matrix` 변경은 보이지 않았고 builder report / `PROGRESS.md` 요약도 코드와 정합했다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-cockpit-refetch-stability-fix-reviewer.md`
- remaining risk:
  - 이번 리뷰는 source-backed 검토라 실제 refetch 체감은 rendered QA가 있으면 더 안전하다

### [2026-03-12] Builder1 `student-cockpit-cache-safety-fix` on `/student`

- lane claim:
  - lane: `single-lane`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx`, `hooks/useStudentDashboard.ts` 사용자 전환 시 cockpit 캐시 안전성 보강
  - merge dependency: none
- summary:
  - same-user refetch에서는 기존 성공 dashboard data를 유지해 cockpit 깜빡임/빈상태 전환을 피했다
  - `hooks/useStudentDashboard.ts`에서 `dataOwnerUserId`와 `previousUserIdRef`를 도입해 userId가 바뀌는 순간 이전 데이터를 무효화했다
  - `app/student/page.tsx`에서 현재 세션 user와 dashboard owner가 일치할 때만 cockpit data를 사용하도록 가드(`dashboardData`)를 추가해 user 전환 직후 한 프레임의 잔상도 차단했다
  - 새 user fetch 실패 시에는 error만 노출되고 이전 학생 데이터는 렌더되지 않도록 동작을 고정했다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-cockpit-cache-safety-fix-builder.md`
- remaining risk:
  - source-backed 검증만 수행했으므로, 실제 멀티 계정 전환 시나리오의 시각적 잔상 부재는 Reviewer/QA의 rendered 확인이 남아 있다

### [2026-03-12] Reviewer `student-cockpit-cache-safety-fix` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `app/student/page.tsx`, `hooks/useStudentDashboard.ts` same-user refetch / cross-user stale cockpit 차단 후속 검토
  - merge dependency: `Builder` follow-up on refetch flicker removal
- findings:
  - same-user refetch에서도 `ClassListPanel`/`WeekBoardPanel`이 `studentDashboard.isLoading` 때문에 즉시 loading placeholder로 전환돼 cockpit이 여전히 깜빡인다
- scope check:
  - `dataOwnerUserId` / `dashboardData` 가드로 cross-user stale cockpit 차단은 확인됐다
  - 새 user fetch 실패 시 이전 학생 cockpit 재사용 없이 error-only 분기로 떨어진다
  - 기존 recovery fix였던 authorized refresh 분리, explicit error panel, class 변경 시 week reset은 유지된다
  - shared auth/API/DB/RLS/RPC contract 변경은 보이지 않았다
  - builder report와 `PROGRESS.md`의 이번 work 요약은 주요 수정 범위와 정합했다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-cockpit-cache-safety-fix-reviewer.md`
- remaining risk:
  - 이번 리뷰는 source-backed 검토라 refetch flicker 체감은 rendered QA에서 재확인하면 더 안전하다

### [2026-03-12] Builder `agent-completion-windows-notify` follow-up 6

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `task_complete` 무역할 케이스에서 직전 user 역할 힌트 재사용
  - merge dependency: none
- summary:
  - watcher가 `event_msg.user_message`를 감시해 마지막 역할 힌트를 저장하도록 변경했다
  - `task_complete`에서 역할 키워드를 못 찾으면 저장된 사용자 역할 힌트로 보완한다
  - `Agent` 무알림 정책은 유지된다
- validation:
  - `bash -n scripts/codex-live-notify-watch.sh`
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - user_message에 역할 힌트가 없는 대화는 계속 `Agent`로 처리되어 미알림이다

### [2026-03-12] Builder `agent-completion-windows-notify` follow-up 7

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: 알림 허용 역할을 5개(`Owner/Builder 1/Builder 2/Reviewer/QA`)로 고정
  - merge dependency: none
- summary:
  - watcher role 추론에서 `Builder` 일반 매칭을 제거했다
  - 알림 전 `is_notifiable_role` 검사로 허용된 5개 역할만 알림을 발송하도록 제한했다
  - `Agent`와 기타 문자열은 계속 미알림 처리된다
  - watcher state 파일 경로는 write-check 후 선택하도록 보강해 `XDG_RUNTIME_DIR`가 쓰기 불가여도 `/tmp/spm-codex-notify`로 폴백한다
- validation:
  - `bash -n scripts/codex-live-notify-watch.sh`
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - 역할 지정 문장이 애매하면 허용 역할로 분류되지 않아 알림이 생략될 수 있다

### [2026-03-12] Builder `agent-completion-windows-notify` follow-up 8

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: 알림 허용 역할에 `Explorer` 추가
  - merge dependency: none
- summary:
  - `infer_role`에 `explorer`/`익스플로러` 매칭을 추가했다
  - `is_notifiable_role` 허용 목록에 `Explorer`를 추가했다
  - 최종 허용 역할은 `Owner/Builder 1/Builder 2/Reviewer/QA/Explorer`다
- validation:
  - `bash -n scripts/codex-live-notify-watch.sh`
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - 역할 지정 문장이 애매하면 허용 역할로 분류되지 않아 알림이 생략될 수 있다

### [2026-03-12] Builder `agent-completion-windows-notify` follow-up 5

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: 무역할 기본값 `Agent`일 때 watcher 알림 억제
  - merge dependency: none
- summary:
  - watcher에서 역할 추론 결과가 `Agent`면 알림 호출을 건너뛰도록 변경했다
  - 이후 follow-up에서 허용 역할은 `Owner/Builder 1/Builder 2/Reviewer/QA`로 최종 고정됐다
- validation:
  - `bash -n scripts/codex-live-notify-watch.sh`
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - 역할 키워드가 없는 일반 대화는 의도적으로 미알림 처리되므로, “모든 응답 알림” 요구와는 상충한다

### [2026-03-12] Builder `agent-completion-windows-notify` follow-up 4

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: Windows balloon 한글 깨짐 및 `Builder1` 표기 매칭 보강
  - merge dependency: none
- summary:
  - 알림 표시 문자열을 ASCII(`ROLE`, `Agent response completed`)로 통일해 balloon 인코딩 깨짐 영향을 피했다
  - 역할 추론에 `builder1`/`builder2`(공백 없는 표기) 매칭을 추가했다
- validation:
  - `bash -n scripts/notify-agent-complete.sh`
  - `bash -n scripts/codex-live-notify-watch.sh`
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - Windows 환경에 따라 balloon 렌더 품질 차이는 남을 수 있어 messagebox 대체 경로를 유지한다

### [2026-03-12] Builder `agent-completion-windows-notify` follow-up 3

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: 사용자 입력 문자열이 알림 본문으로 섞여 보이는 문제 차단
  - merge dependency: none
- summary:
  - watcher 알림 제목/메시지를 고정값(`SPM Codex`, `에이전트 응답이 완료되었습니다.`)으로 강제했다
  - 역할 문자열은 화이트리스트(`Builder 1/Builder 2/Builder/Reviewer/Owner/QA/Agent`)로 정규화하고 기타 값은 `Agent`로 강제했다
  - PowerShell 알림 본문은 `역할: <role>` 포맷으로 단순화했다
- validation:
  - `bash -n scripts/notify-agent-complete.sh`
  - `bash -n scripts/codex-live-notify-watch.sh`
  - `bash -n scripts/codex-chat.sh`
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - 역할 추론은 여전히 키워드 기반이라 문맥에 역할 키워드가 없으면 `Agent`로 표시된다

### [2026-03-12] Builder `agent-completion-windows-notify` follow-up 2

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: 대화형 `codex` 세션의 응답 완료(`task_complete`) 이벤트 기반 알림 자동화
  - merge dependency: none
- summary:
  - `scripts/codex-live-notify-watch.sh`를 추가해 최신 Codex session jsonl을 추적하고 `task_complete` 이벤트마다 알림을 발송하게 했다
  - `scripts/codex-chat.sh`를 추가해 대화형 `codex` 실행과 watcher 실행/정리를 한 번에 처리하게 했다
  - `package.json`에 `notify:watch`, `codex:chat` 스크립트를 연결했다
- validation:
  - `bash -n scripts/codex-live-notify-watch.sh`
  - `bash -n scripts/codex-chat.sh`
  - `timeout 3s bash scripts/codex-live-notify-watch.sh` (세션 파일 tracking 로그 확인)
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - watcher는 최신 세션 파일 기준 추적이므로 동시에 여러 대화형 세션을 병렬로 돌리면 알림이 섞일 수 있다
  - 역할 추론은 메시지 키워드 기반이라 명시 키워드가 없으면 기본값(`Agent`)으로 알린다

### [2026-03-12] Builder `agent-completion-windows-notify` follow-up

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: 사용자 런타임 확인 결과를 반영한 기본 알림 방식 조정
  - merge dependency: none
- summary:
  - 사용자 확인에서 `toast` 실패, `balloon`/`messagebox` 성공이 보고됐다
  - 일반 실행 경로 기본값을 `auto`에서 `balloon`으로 변경했다
  - 필요 시 `--method toast|messagebox|auto`로 계속 선택 가능하다
- validation:
  - `bash -n scripts/notify-agent-complete.sh`
  - `bash -n scripts/run-with-notify.sh`
- validation note:
  - 이 실행 환경에서는 `powershell.exe` 호출이 샌드박스 제약으로 실패해 Windows 팝업 런타임 검증은 사용자 로컬에서 수행해야 한다
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - `toast` 자체의 실패 원인(Windows 알림 설정/앱 식별자/OS 정책)은 아직 별도 추적하지 않았다

### [2026-03-12] Builder `agent-completion-windows-notify`

- lane claim:
  - lane: `single-lane`
  - role: `Builder`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: WSL에서 호출 가능한 Windows 알림 경로 추가(역할 완료 알림)
  - merge dependency: none
- summary:
  - `scripts/windows-notify.ps1`에 `toast`, `balloon`, `messagebox`, `auto`, `console` 모드를 구현했다
  - `scripts/notify-agent-complete.sh`로 WSL -> `powershell.exe` 호출 래퍼를 추가하고, 실패 시 원인 확인용 로그를 남기도록 했다
  - `scripts/run-with-notify.sh`를 추가해 임의 명령 종료 후 성공/실패 상태와 함께 역할명 알림을 자동 발송할 수 있게 했다
  - `scripts/notify-test-all.sh`를 추가해 여러 알림 방식을 순차 테스트할 수 있게 했다
  - `package.json`에 `notify:test:*`, `notify:run` 스크립트를 연결했다
- validation:
  - `bash -n scripts/notify-agent-complete.sh`
  - `bash -n scripts/run-with-notify.sh`
  - `bash -n scripts/notify-test-all.sh`
  - `npm run -s notify:test:console`
  - `npm run -s notify:test:auto`
  - `bash scripts/run-with-notify.sh --role Reviewer --method console -- bash -lc 'echo done-from-wrapped-command'`
  - `bash scripts/run-with-notify.sh --role QA --method console -- bash -lc 'echo fail-case; exit 7'`
- report: `docs/reports/2026-03-12-agent-completion-windows-notify-builder.md`
- remaining risk:
  - 현재 Codex 샌드박스에서는 `powershell.exe` 호출이 `UtilBindVsockAnyPort` 에러로 차단되어 실제 Windows 팝업 런타임 증명은 미완료다
  - 사용자 로컬 Windows에서 `notify:test:all` 실행으로 표시 성공률을 최종 확인해야 한다

### [2026-03-12] Builder1 `student-cockpit-recovery-fix` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx`, `hooks/useStudentDashboard.ts` refresh/error/selection 회귀 최소 수정
  - merge dependency: `Reviewer`
- summary:
  - authorized 상단 새로고침을 세션/role 재확인에서 학생 대시보드 재조회로 분리했다
  - dashboard fetch error 시 summary가 `0`처럼 보이지 않도록 훅에서 마지막 성공 데이터를 유지하고, data 부재 시 summary strip은 `-` 표기로 변경했다
  - dashboard fetch error 시 클래스 없음/선택 placeholder 패널 대신 명시적 error panel만 렌더하도록 분기했다
  - 클래스 변경 시 `selectedWeekNumber`를 초기화해 새 클래스 우선 주차가 자동 선택되도록 조정했다
  - fallback/login/wrong-role/delayed 분기와 cockpit 레이아웃 철학은 유지했고 shared auth/API/DB/RLS/RPC contract 변경은 없다
- validation:
  - `npm run lint` (`pass`)
  - `npm run typecheck` (`pass`)
- report: `docs/reports/2026-03-12-student-cockpit-recovery-fix-builder.md`
- remaining risk:
  - 이번 패키지는 source-backed 검증이며, error panel + retry UX 체감은 rendered QA에서 확인하면 더 안전하다

### [2026-03-12] Reviewer `student-cockpit-recovery-fix` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `app/student/page.tsx`, `hooks/useStudentDashboard.ts` refresh/error/selection 회귀 수정 검토
  - merge dependency: `Builder` follow-up on same-user-only stale dashboard retention
- findings:
  - `useStudentDashboard`가 마지막 성공 `data`를 user 전환에도 유지해, 새 학생 계정으로 바뀐 뒤 fetch가 실패하면 이전 학생 cockpit이 새 계정 이메일 아래에 남을 수 있다
- scope check:
  - authorized 상단 새로고침은 세션/role 재확인이 아니라 dashboard refetch로 분리됐다
  - fetch error 시 summary 0 fallback 제거와 명시적 error panel 전환은 확인됐다
  - 클래스 변경 시 `selectedWeekNumber` 초기화로 새 클래스 우선 주차가 자동 선택되도록 조정됐다
  - shared auth/API/DB/RLS/RPC contract 변경은 보이지 않았다
  - builder report와 `PROGRESS.md`의 이번 work 요약은 주요 수정 범위와 정합했다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-cockpit-recovery-fix-reviewer.md`
- remaining risk:
  - 이번 리뷰는 source-backed 검토라 dashboard retry / account switch 체감은 rendered QA에서 확인하면 더 안전하다

### [2026-03-12] Builder1 `student-shell-panel` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` authorized 학생 화면을 고정 shell + 내부 선택형 패널 구조로 재구성
  - merge dependency: `Reviewer`
- summary:
  - authorized 화면을 `상단 compact bar(계정/기준 월/새로고침/로그아웃) + 좌측 클래스 목록 + 중앙 주차 상태 보드 + 우측 상세 탭(Feedback/Progress/Reflection)`으로 재구성했다
  - 기존 nested `details/disclosure` 기반 상세 노출을 제거하고, 우측 패널 탭 전환으로 원문을 표시하도록 변경했다
  - 긴 설명/hero성 카피/중복 요약 카드/장식성 박스를 제거하고 상태 배지와 밀도 중심 스캔 구조로 정리했다
  - 모바일은 같은 정보 구조를 유지하되 `클래스/주차/상세` 상단 섹션 전환형으로 압축했다
  - `login_required`, `wrong-role`, `reconnecting`, `session_delayed`, `role_unknown`, `role_delayed` 분기는 과설계 없이 compact state 카드로 유지했다
  - shared auth hook, student dashboard data contract, API/DB/RLS/RPC 경계 변경은 없다
- validation:
  - `npm run lint` (`pass`)
  - `npm run typecheck` (`fail`: 기존 `/admin/matrix` 타입 오류로 실패)
- report: `docs/reports/2026-03-12-student-shell-panel-builder.md`
- remaining risk:
  - 전역 `typecheck`는 `/admin/matrix` 기존 오류로 막혀 이번 `/student` 패키지 단독으로 전체 타입 green 상태를 보장하지 못한다
  - 이번 검증은 source-backed이며, 모바일 탭 전환의 실제 체감은 별도 rendered QA에서 확인하면 더 안전하다

### [2026-03-12] `student-surface-frame` package 종료

- summary:
  - first-view 중심 프레임 재구성과 후속 disclosure `error`/`empty` 정합성 수정이 모두 `No findings`로 닫히면서 `/student` 기본 UI 틀 패키지를 종료했다
  - `/student`는 이제 핵심 요약 / next action / 핵심 metric을 first view에 두고, 상세 정보는 disclosure 아래로 내리는 기본 구조를 갖는다
- validation:
  - reviewer reports:
    - `docs/reports/2026-03-12-student-surface-frame-reviewer.md`
    - `docs/reports/2026-03-12-student-surface-error-disclosure-fix-reviewer.md`
- remaining risk:
  - 이번 패키지는 frame 확정이 중심이라 rendered QA는 별도 slice가 필요할 수 있고, spacing / copy tone / final polish는 후속 UI slice로 남는다

### [2026-03-12] Reviewer `student-surface-error-disclosure-fix` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `app/student/page.tsx` 클래스 상세 disclosure fallback `error`/`empty` 분리 후속 검토
  - merge dependency: none
- result:
  - `No findings`
- scope check:
  - `클래스별 상세 목록` disclosure fallback은 `classes.length > 0` / `studentDashboard.error` / empty로 분리되어 이전 혼선을 해소함
  - first-view/disclosure 프레임 구조와 기존 auth / role / delayed / recovery 분기 동작은 유지됨
  - shared auth hook, API, DB/RPC, admin route, auth policy 변경은 없음
  - builder report와 `PROGRESS.md`의 이번 work 항목은 코드와 정합함
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-surface-error-disclosure-fix-reviewer.md`
- remaining risk: 이번 패키지는 route-local fallback 정합성 review이므로 rendered runtime QA는 별도 scope임

### [2026-03-12] Builder1 `student-surface-error-disclosure-fix` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` 클래스 상세 disclosure의 `error`/`empty` fallback 분리 최소 수정
  - merge dependency: `Reviewer`
- summary:
  - `클래스별 상세 목록` disclosure에서 `classes.length`가 없을 때를 `error`와 `empty`로 분리했다
  - fetch error 상태에서는 empty 문구 대신 오류 전용 안내를 노출하도록 조정했다
  - first-view/disclosure 구조와 기존 auth/role/delayed/recovery 분기 동작은 유지했다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-surface-error-disclosure-fix-builder.md`
- remaining risk:
  - 이번 패키지는 source-backed 검증만 수행했으므로, 오류 안내 문구의 체감 가독성은 별도 rendered QA에서 확인하면 더 안전하다

### [2026-03-12] Reviewer `student-surface-frame` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `app/student/page.tsx` first-view/disclosure 프레임 재구성 검토
  - merge dependency: `Builder` follow-up on error-vs-empty detail messaging
- findings:
  - authorized fetch error 상태에서 경고 카드와 별개로 `클래스별 상세 목록` disclosure가 empty fallback 문구를 보여 조회 실패를 실제 empty처럼 오해하게 만든다
- scope check:
  - 변경은 `/student` route-local UI 정보 계층 재배치 범위로 제한됨
  - shared auth / API / DB / admin route / policy 변경은 확인되지 않음
  - login_required / wrong-role / delayed / reconnecting / authorized 분기 동작은 유지됨
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-surface-frame-reviewer.md`
- remaining risk: disclosure 기본 접힘 상태의 체감 가독성은 이번 review에서 runtime으로 재검증하지 않았음

### [2026-03-12] Builder1 `student-surface-frame` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` 학생 화면 정보 계층 프레임 재구성(first-view 최소화 + progressive disclosure)
  - merge dependency: `Reviewer`
- summary:
  - first view를 `현재 상태 핵심 요약 / 가장 중요한 next action / 핵심 metric(2~3)`만 보이도록 고정했다
  - 긴 설명, 보조 상태 카드, 안내성 텍스트, 클래스별 상세 목록은 하단 `details` disclosure 섹션으로 이동했다
  - `login_required`, `unauthorized(wrong-role)`, `session_delayed`, `role_delayed`, `role_unknown`, `reconnecting` 분기를 동일한 정보 계층 원칙으로 정리했다
  - 기존 분기 동작(로그인/복구/Admin 이동/로그아웃)과 route-local 데이터 범위는 유지했다
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-surface-frame-builder.md`
- remaining risk:
  - 이번 패키지는 source-backed 검증만 수행했으므로, disclosure 기본 접힘 상태의 실제 체감 가독성은 별도 rendered QA slice에서 확인하면 더 안전하다

### [2026-03-12] `student-admin-ui-guideline-polish` package 종료

- summary:
  - `/student`의 action-running 정합성 후속 수정이 `No findings`로 닫히면서, 앞선 `/student` + `/admin/matrix` UI guideline polish 패키지를 종료했다
  - `/admin/matrix` guideline polish는 기존 combined review에서 추가 finding 없이 유지됐다
- validation:
  - reviewer reports:
    - `docs/reports/2026-03-12-student-admin-ui-guideline-polish-reviewer.md`
    - `docs/reports/2026-03-12-student-ui-action-running-fix-reviewer.md`
- remaining risk:
  - earlier local `npm run build` failure note remains separate from this closed route-local UI package and should be investigated only if it reproduces in its own slice

### [2026-03-12] Reviewer `student-ui-action-running-fix` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `app/student/page.tsx` action-running 정합성 후속 수정 검토
  - merge dependency: none
- result:
  - `No findings`
- scope check:
  - `isSessionActionRunning` 의존 UI는 실제 동작 경로인 `세션 초기화`, `로그아웃`에만 남음
  - 로그인 / 세션 재확인 / role 재확인 경로의 misleading `disabled/처리 중...` 피드백은 제거됨
  - shared auth hook, API, DB/RPC, admin route, auth policy 변경은 없음
  - builder report와 `PROGRESS.md`의 이번 work 항목은 코드와 정합함
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-ui-action-running-fix-reviewer.md`
- remaining risk: 이번 패키지는 route-local 정합성 수정 review이므로 rendered runtime QA는 별도 scope임

### [2026-03-12] Builder1 `student-ui-action-running-fix` action-running misleading 상태 최소 수정

- lane claim:
  - lane: `/student`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` action-running 피드백 정합성 최소 수정
  - merge dependency: `Reviewer`
- summary: `isSessionActionRunning`이 실제로 켜지지 않는 로그인/세션 재확인/role 재확인 경로의 `disabled/처리 중...` UI를 제거하고, 실제로 값이 켜지는 로그아웃/세션 초기화 경로에만 running 피드백을 남겨 오해 가능한 상태를 없앴다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-ui-action-running-fix-builder.md`
- remaining risk: 로그인/재확인 경로의 로딩 피드백 자체는 이번 패키지에서 제거했으므로, 향후 필요 시에는 화면 local submitting state를 별도 slice로 추가해야 한다.

### [2026-03-12] Reviewer `student-admin-ui-guideline-polish` combined review on `/student` + `/admin/matrix`

- lane claim:
  - lane: `combined /student + /admin`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `/student` + `/admin/matrix` UI guideline polish merged review
  - merge dependency: `Builder` follow-up on `/student` action-running wiring
- findings:
  - `/student`에서 새로 추가한 disabled/로딩 피드백은 `isSessionActionRunning`에 매달려 있지만, 그 상태는 현재 로그아웃/강제 세션 초기화에서만 켜져 로그인/세션 재확인/role 재확인 경로에서는 동작하지 않는다
- scope check:
  - 변경은 `/student`, `/admin/matrix`, `components/admin/MatrixFilters.tsx`, `components/admin/MatrixTable.tsx`의 route-local UI 범위로 제한됨
  - shared auth / API / DB / mutation / export contract 확장은 확인되지 않음
  - `/admin/matrix` focus-visible / live-region polish에서는 별도 회귀를 찾지 못함
- validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build` failed locally with `PageNotFoundError: Cannot find module for page: /_document` and missing `.next/server/app/_not-found/page.js.nft.json`
- report: `docs/reports/2026-03-12-student-admin-ui-guideline-polish-reviewer.md`
- remaining risk: build failure가 이번 UI 변경과 직접 연결되는지, 또는 현재 작업트리/Next build 환경 문제인지 추가 분리가 필요함

### [2026-03-12] Model / effort recommendation was centralized into `docs/roles/OWNER.md`

- summary:
  - model / effort 추천은 자동 적용 규칙이 아니라 Owner의 수동 배정 기준임을 명시했다
  - 중복을 줄이기 위해 관련 추천은 `docs/roles/OWNER.md`로 모으고, 다른 역할 문서에서는 제거했다
- validation:
  - docs cross-check only
- remaining risk:
  - 모델명보다 package 성격에 맞는 `effort` 조정이 우선이라는 기준을 계속 유지해야 한다

### [2026-03-12] Builder1 `student-ui-guideline-polish` 로그인/복구 접근성 가이드라인 정리

- lane claim:
  - lane: `/student`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` 로그인/복구/상태 메시지 접근성 및 상호작용 피드백 개선
  - merge dependency: `Reviewer`
- summary: 로그인/복구 구간에서 auth 메시지를 `aria-live`로 노출하고, 이메일/비밀번호 입력에 visible label을 추가했으며, 주요 버튼에 hover/focus-visible 상태와 action-running disabled 피드백을 넣어 placeholder-only 의존과 무피드백 상호작용을 줄였다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-ui-guideline-polish-builder.md`
- remaining risk: 이번 패키지는 source-backed 검증만 수행했으며 스크린리더 기반 runtime 접근성 확인은 별도 QA slice가 필요하다.

### [2026-03-12] Reviewer `student-summary-count-fix` on `/student`

- lane claim:
  - lane: `/student`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `app/student/page.tsx` `readableWeekCount` 라벨 정합성 후속 수정 검토
  - merge dependency: none
- result:
  - `No findings`
- scope check:
  - 수정은 `Readable Now` 카드의 라벨 텍스트에 한정됨
  - shared auth / API / DB / mutation / export contract 변경은 없음
  - fallback / wrong-role / recovery 분기 구조도 유지됨
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-summary-count-fix-reviewer.md`
- remaining risk: rendered runtime QA는 이번 미세 수정 범위에서 다시 수행하지 않음

### [2026-03-12] Builder1 `student-summary-count-fix` 라벨 정합성 최소 수정

- lane claim:
  - lane: `/student`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` `readableWeekCount` UI 라벨 정합성 수정
  - merge dependency: `Reviewer`
- summary: 주차 단위로 계산되는 `readableWeekCount`를 메모 개수처럼 보이던 라벨에서 `읽을 주차`로 바꿔 지표 의미를 맞췄다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-summary-count-fix-builder.md`
- remaining risk: rendered runtime QA는 수행하지 않았고, 텍스트 라벨 외 동작 변화는 없음

### [2026-03-12] Reviewer `student-admin-surface-polish` combined review on `/student` + `/admin/matrix`

- lane claim:
  - lane: `combined /student + /admin`
  - role: `Reviewer`
  - kind: `review`
  - code-change-allowed: `no`
  - scope: `/student` + `/admin/matrix` surface polish merged review
  - merge dependency: `Builder` follow-up on `/student` readable metric semantics
- findings:
  - `app/student/page.tsx`의 새 `읽을 메모` 카운트는 실제 메모 항목 수가 아니라 메모가 있는 주차 수를 세고 있어 표시값 의미가 맞지 않는다
- scope check:
  - `/student`와 `/admin/matrix` 모두 authorized surface 내부의 route-local UI 변경으로 제한됨
  - shared auth / API / DB / mutation / export contract 변경은 확인되지 않음
  - wrong-role / denied / delayed / recovery 분기는 source-backed 기준으로 유지됨
- validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- report: `docs/reports/2026-03-12-student-admin-surface-polish-reviewer.md`
- remaining risk: fallback / wrong-role / denied / delayed 흐름은 이번 리뷰에서 runtime 재증명하지 않았고 source-backed 확인까지만 수행됨

### [2026-03-12] Builder2 `admin-summary-polish` route-local summary/empty-state guidance 개선

- lane claim:
  - lane: `/admin`
  - role: `Builder 2`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/admin/matrix/page.tsx` 상단 summary 카드 + empty-state guidance
  - merge dependency: `Reviewer`
- summary: authorized 화면에서 `조회 기준 / 표시 상태 / 빠른 안내` 카드를 스캔형으로 재구성하고, 결과가 비어 있을 때 `월 변경`, `클래스 해제`, `현재 기준 재조회`를 즉시 실행할 수 있는 안내/버튼을 추가했다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-admin-summary-polish-builder.md`
- remaining risk: 이번 패키지는 source-backed 검증만 수행했으므로 실제 운영 데이터 분포에서의 체감 UX 개선은 후속 rendered QA가 있으면 더 안전하다

### [2026-03-12] Builder1 `student-summary-polish` route-local read/guidance 개선

- lane claim:
  - lane: `/student`
  - role: `Builder 1`
  - kind: `code`
  - code-change-allowed: `yes`
  - scope: `app/student/page.tsx` summary/guidance polish (read-only data 활용)
  - merge dependency: `Reviewer`
- summary: authorized 학생 화면에 상태별 읽기 요약(loading/error/empty/no-log/attention/ready)과 `현재 읽기 범위` 지표를 추가해 현재 읽을 수 있는 상태를 더 빠르게 이해하도록 개선했다.
- validation:
  - `npm run lint`
  - `npm run typecheck`
- report: `docs/reports/2026-03-12-student-summary-polish-builder.md`
- remaining risk: rendered runtime UX 증명은 이번 패키지 범위 밖이라 source-backed confidence만 확보됨

### [2026-03-12] `docs/WORKSTREAMS.md` now marks completed and remaining items as a checklist

- summary: `docs/WORKSTREAMS.md`가 active-scope closure/remaining gap 체크리스트를 바로 보여주도록 정리됨
- validation: docs cross-check only
- remaining risk: 체크 상태는 현재 scope 기준이며, 미래 확장 가능성 자체를 닫는 뜻은 아님

### [2026-03-12] `AGENTS.md` was trimmed further and role docs took more of the role-specific workflow

- summary: 공통 계약은 `AGENTS.md`로, 역할별 체크리스트는 `docs/roles/*`로 더 분리됨
- touched docs: `AGENTS.md`, `docs/roles/*`
- remaining risk: role docs가 공통 규칙의 대체 source of truth가 되지 않도록 계속 짧게 유지해야 함

### [2026-03-12] Added lightweight role helper docs under `docs/roles/*`

- summary: `Owner`, `Builder`, `Reviewer`, `QA`, `Explorer` helper docs가 추가됨
- validation: docs cross-check only
- remaining risk: role docs에는 빠른 실행 체크리스트만 남기고 공통 규칙 복제를 피해야 함

### [2026-03-12] Docs now separate `WORKSTREAMS`, `PLAN`, and `PROGRESS` more clearly

- summary: 큰 작업 단위는 `docs/WORKSTREAMS.md`, 현재 실행 slice는 `docs/PLAN.md`, 누적 상태와 handoff는 `PROGRESS.md`로 분리됨
- validation: docs cross-check only
- remaining risk: 세 문서가 다른 속도로 갱신되면 다시 드리프트가 생길 수 있음

### [2026-03-12] Merged rendered QA closed the current fallback/access package

- summary: merged result 기준으로 `/`, `/student`, `/admin/matrix` 주요 fallback/recovery가 다시 runtime 증명됨
- report: `docs/reports/2026-03-12-merged-rendered-qa.md`
- remaining risk: `/admin/matrix` `role_delayed`는 fresh merged runtime proof가 아직 없음

### [2026-03-12] Builder1 rendered QA re-proved `/` + `/student` fallback/recovery and proved `/student` wrong-role

- summary: `/` anonymous, `/student` anonymous, `/student` wrong-role 표면이 Builder1 proof pass에서 runtime 재확인됨
- report: `docs/reports/2026-03-12-home-student-rendered-builder.md`
- remaining risk: `/`와 `/student` delayed 계열 상태는 이 pass에서 fresh runtime proof가 없음

### [2026-03-12] Reviewer found no findings in `/admin/matrix` fixed-bar narrowing

- summary: fixed-bar narrowing change는 route-local 범위를 지켰고 requested regression point에서도 `No findings`
- report: `docs/reports/2026-03-12-admin-gap-reviewer.md`
- remaining risk: `role_delayed` rendered confidence refresh가 필요하면 별도 QA slice가 더 적절함

### [2026-03-12] Narrow `/admin/matrix` rendered gap pass proved `session_delayed` and removed denied-screen fixed-bar overlap

- summary: `/admin/matrix` gap pass에서 `session_delayed`를 runtime 재현했고 fixed bottom action bar를 authorized-only로 좁혀 overlap을 제거함
- report: `docs/reports/2026-03-12-admin-gap-builder.md`
- remaining risk: `role_delayed`는 이 좁은 rerun에서 fresh runtime proof가 없음

### [2026-03-11] Narrow QA runtime-proved most non-anonymous `/admin/matrix` denied/delayed states

#### Summary
- Ran a single-lane rendered-browser QA pass focused only on `/admin/matrix` non-anonymous denied/delayed states
- Runtime-proved states in Windows Edge headless were:
  - `unauthorized`
  - `access_pending`
  - `role_unknown`
  - `role_delayed`
- `session_delayed` was attempted but not reproduced in runtime

#### Current Impact
- `/admin/matrix` no longer depends only on source-backed confidence for the main non-anonymous denied/delayed states above
- The currently unproven fallback gap on this route is now much narrower:
  - `session_delayed`
  - mobile / in-app-browser rendered behavior
  - sub-frame / filmstrip timing finer than the current captures
- A separate runtime note was observed:
  - the fixed bottom action bar can overlap part of the body content on denied/delayed screens in the captured viewport
  - this did not hide the main state title, but it is still a rendered UX note worth keeping visible

#### Validation
- rendered-browser proof:
  - Windows Edge headless screenshot for `unauthorized`
    - `/mnt/c/Temp/spm-qa-admin-unauthorized.png`
  - Windows Edge headless screenshot for `access_pending`
    - `/mnt/c/Temp/spm-qa-admin-access-pending.png`
  - Windows Edge headless screenshot for `role_unknown`
    - `/mnt/c/Temp/spm-qa-admin-role-unknown.png`
  - Windows Edge headless screenshot for `role_delayed`
    - `/mnt/c/Temp/spm-qa-admin-role-delayed.png`
- local checks:
  - `npm run verify:baseline`
  - `npm run build`
  - `npm run harness:report -- app/admin/matrix/page.tsx PROGRESS.md`
- source-backed cross-check:
  - `app/admin/matrix/page.tsx`
  - `hooks/useAuthViewState.ts`
  - `hooks/useSupabaseSession.ts`

#### Follow-up
- Treat `session_delayed` on `/admin/matrix` as source-backed only until a dedicated runtime proof pass reproduces it
- If the bottom fixed action bar overlap becomes operationally confusing, return it as a narrow Builder package instead of folding it into shared auth work
- No auth architecture, DB, RLS, or RPC conclusion was widened by this QA pass

### [2026-03-11] `docs/DECISIONS.md` was removed and small local command approval rules were clarified

#### Summary
- Removed `docs/DECISIONS.md` from the active doc set
- Tightened `AGENTS.md` approval wording so routine local non-destructive commands should be run without asking
- Removed `DECISIONS.md` references from active validation / docs-sync rules

#### Current Impact
- The working doc set is now:
  - `AGENTS.md`
  - `docs/PLAN.md`
  - `PROGRESS.md`
  - `docs/SPEC.md`
  - `docs/VERIFY.md`
  - `docs/db/*`
- Agents should no longer pause for ordinary local read/search/lint/typecheck/build/test commands inside approved work
- Long-term rationale is now expected to live in `SPEC.md`, `PLAN.md`, or `PROGRESS.md` where relevant, rather than in a separate decisions file

#### Validation
- docs cross-check only:
  - `AGENTS.md`
  - `docs/VERIFY.md`
  - `PROGRESS.md`

#### Follow-up
- Historical `PROGRESS.md` entries may still mention removed docs; read them as historical context only
- If approval pauses still happen, tighten Owner/Builder phrasing in `AGENTS.md` again rather than reintroducing prompt docs

### [2026-03-11] Active doc set was reduced to working docs only

#### Summary
- Removed meta docs that duplicated active operating rules:
  - `docs/meta/ROLE_PROMPTS.md`
  - `docs/meta/DEVELOPMENT_METHOD.md`
- Tightened `docs/SPEC.md` so it stays focused on stable product intent and scope
- Tightened `docs/VERIFY.md` so it stays focused on practical validation checklists
- Reduced the active doc set to working docs only

#### Current Impact
- The active working doc set is now centered on:
  - `AGENTS.md`
  - `docs/PLAN.md`
  - `PROGRESS.md`
  - `docs/SPEC.md`
  - `docs/VERIFY.md`
  - `docs/db/*`
- `AGENTS.md` now carries the operating contract without a separate role-prompt mirror
- `SPEC.md` and `VERIFY.md` should now be less likely to compete with `PLAN.md` or `AGENTS.md`

#### Validation
- docs cross-check only:
  - `AGENTS.md`
  - `docs/SPEC.md`
  - `docs/VERIFY.md`
  - `PROGRESS.md`

#### Follow-up
- Historical entries in `PROGRESS.md` may still mention removed meta docs; treat those mentions as historical context, not active guidance

### [2026-03-11] Narrow QA confirmed anonymous `/admin/matrix` first paint no longer exposes admin shell

#### Summary
- Ran a narrow rendered-browser QA pass for anonymous `/admin/matrix` first paint after the route-local access-clarity change
- Captured Windows Edge headless screenshots at:
  - 100ms
  - 1500ms
  - 5000ms
- Runtime-proven anonymous first-paint result:
  - the three captures matched
  - the screen showed access-check/login-required framing first
  - admin shell elements were not visible:
    - filter area
    - CSV panel
    - table shell
- Runtime-proven messaging included:
  - `ACCESS CHECK`
  - `Admin Matrix 접근 전에 로그인이 필요합니다.`
  - `관리용 필터, CSV, 표는 OWNER/ADMIN 계정 확인 전까지 노출하지 않습니다.`

#### Current Impact
- Anonymous `/admin/matrix` first paint can now be treated as runtime-proven non-misleading for the checked timings
- The earlier rendered-browser concern about anonymous first paint exposing admin controls is no longer the latest reality
- Remaining unverified states are narrower:
  - non-anonymous unauthorized runtime
  - `access_pending`
  - `session_delayed`
  - `role_unknown`
  - `role_delayed`
  - mobile / in-app browser rendered behavior
  - sub-100ms filmstrip-level first-frame capture

#### Validation
- rendered-browser proof:
  - Windows Edge headless screenshot for `/admin/matrix` at 100ms
  - Windows Edge headless screenshot for `/admin/matrix` at 1500ms
  - Windows Edge headless screenshot for `/admin/matrix` at 5000ms
- local checks:
  - `npm run harness:report -- app/admin/matrix/page.tsx PROGRESS.md`
  - `npm run verify:baseline`
  - `npm run build`
- source-backed cross-check:
  - `app/admin/matrix/page.tsx`

#### Follow-up
- Anonymous first-paint concern on `/admin/matrix` is considered resolved for the checked rendered timings
- Keep denied/delayed non-anonymous states labeled as source-backed inference until runtime-proof is added
- If mobile or in-app-browser behavior becomes operationally important again, run a separate rendered QA slice instead of assuming parity

### [2026-03-11] `/admin/matrix` first paint now emphasizes access-check/blocked states before admin controls

#### Summary
- Narrowed `/admin/matrix` route-local UI only
- Added a first-screen access-intro panel for non-authorized states so the page reads as:
  - access check in progress
  - login required
  - role check failed/delayed
  - access blocked
  before it reads as an admin control surface
- Reframed the page header copy by auth state so anonymous or unresolved users no longer land on a plain "Admin Matrix" management header first
- Kept existing auth/access branches, backend contract, DB behavior, and shared auth hooks unchanged

#### Current Impact
- Anonymous or unresolved first paint should now communicate that admin controls are withheld pending session/role confirmation
- Blocked users should see an access-blocked framing before any admin-management wording
- The matrix filters/table/export area still opens only on the existing `authorized` branch
- `/admin/matrix` 자체에서도 실제 관리 셸 렌더 조건을 더 보수적으로 다시 계산해, `useAuthViewState()`가 초기 로딩 구간을 임시로 `authorized`로 돌려도 필터/CSV/표 shell을 먼저 열지 않게 했다

#### Validation
- source-backed check:
  - `app/admin/matrix/page.tsx`
- baseline commands:
  - `npm run verify:baseline`
  - `npm run harness:report -- app/admin/matrix/page.tsx PROGRESS.md`

#### Follow-up
- Reviewer should confirm the new header/access-intro copy actually reduces first-paint admin-UI misread risk
- A rendered browser pass is still needed to move this from source-backed confidence to runtime-proven confidence
- If rendered QA still shows misleading exposure, escalate instead of pushing this route into shared auth/view-state changes
- Reviewer finding follow-up:
  - duplicate `<h1>` exposure는 비-authorized 상태에서 header title을 본문 텍스트로 낮춰 정리했다
  - shared hook 변경 없이 route-local shell gate를 tightened 했다

### [2026-03-11] Rendered-browser fallback QA captured anonymous first-paint evidence for `/`, `/student`, `/admin/matrix`

#### Summary
- Ran a rendered-browser QA pass with Windows Edge headless screenshots against:
  - `/`
  - `/student`
  - `/admin/matrix`
- Note:
  - the `/admin/matrix` result below reflects the pre-fix runtime capture only
  - it was superseded later on 2026-03-11 by a narrow post-fix QA pass that confirmed anonymous first paint no longer exposed admin shell
- Runtime-proven anonymous first-paint results:
  - `/`
    - shows the expected login-required panel
    - recovery copy is understandable:
      - Google login
      - email login
      - direct links to student/admin surfaces
  - `/student`
    - shows the expected student login-required panel plus quick email-login card
    - recovery path is understandable:
      - Google login
      - quick email login
      - return to home
  - `/admin/matrix`
    - captured a misleading first paint in rendered use at that earlier moment:
      - filter area rendered
      - CSV panel rendered
      - table shell rendered
      - no explicit blocking panel was visible in the captured first paint
- Evidence files captured outside the repo:
  - `/mnt/c/Temp/spm-shot-home.png`
  - `/mnt/c/Temp/spm-shot-student.png`
  - `/mnt/c/Temp/spm-shot-admin.png`

#### Current Impact
- `/` and `/student` now have real rendered proof that anonymous users see understandable fallback/recovery surfaces
- This entry should not be read as the latest `/admin/matrix` reality after the follow-up fix and narrow QA pass
- For current `/admin/matrix` anonymous first-paint status, use the later 2026-03-11 narrow QA entry above

#### Validation
- rendered-browser proof:
  - Windows Edge headless screenshot for `/`
  - Windows Edge headless screenshot for `/student`
  - Windows Edge headless screenshot for `/admin/matrix`
- source-backed cross-check:
  - `app/page.tsx`
  - `app/student/page.tsx`
  - `app/admin/matrix/page.tsx`

#### Follow-up
- `/admin/matrix` needs a narrow follow-up slice focused on rendered first-paint auth clarity
- Keep runtime-proven facts separate from source-backed inference:
  - runtime-proven:
    - anonymous `/` fallback clarity
    - anonymous `/student` fallback clarity
    - misleading anonymous first paint on `/admin/matrix`
  - source-backed only:
    - `/student` unauthorized panel copy and redirect action
    - `/admin/matrix` unauthorized panel copy and relogin action
    - reconnecting / session_delayed / role_unknown / role_delayed branches on the three routes
- If a later QA pass needs role-switched rendered proof, use a more stable browser automation setup instead of assuming the first-paint screenshot is enough

### [2026-03-11] Agents now default to approval-free local non-destructive command execution

#### Summary
- Added a shared command-execution policy to `AGENTS.md`
- Synced the same operating rule into `docs/meta/ROLE_PROMPTS.md`
- Clarified that local non-destructive read/search/validation commands should usually run without per-command approval
- Kept explicit confirmation requirements for destructive, networked, escalated, and DB-truth-changing commands

#### Current Impact
- Builders, Reviewers, and QA can move faster on ordinary local commands without repeated user interruption
- Approval-free command execution is now documented as separate from approval-free risky changes
- High-risk boundaries still require explicit confirmation or escalation

#### Validation
- docs cross-check only:
  - `AGENTS.md`
  - `docs/meta/ROLE_PROMPTS.md`
  - `PROGRESS.md`

#### Follow-up
- Apply this rule on the next active Builder/Reviewer/QA package and watch for wording that still causes unnecessary approval pauses
- If confusion remains, tighten examples rather than broadening the allowed command scope
- Reviewer follow-up: confirm Builder prompts do not imply that risky commands become approval-free just because they are mentioned in package scope

### [2026-03-11] Parallel Builder plan was not realized as separate worktrees in the latest package

#### Summary
- A `Builder 1 + Builder 2` split was planned for the next package
- In actual execution, separate write worktrees were not created
- The latest implementation work was performed in the shared repository worktree on `main`
- This means the package should be treated as a single-lane reality check, not as a fully realized parallel-write package

#### Current Impact
- The operating model still allows parallel Builder lanes in principle
- However, the most recent package should not be used as evidence that parallel write execution was actually followed end-to-end
- Reviewer should treat the current changed state as one shared-worktree result

#### Validation
- builder state cross-check only:
  - reported worktree / branch from Builder 1
  - reported worktree / branch from Builder 2

#### Follow-up
- If the next package is meant to be truly parallel, create separate worktrees first and record the real paths in `PROGRESS.md`
- Otherwise declare the package as single-lane from the start instead of keeping parallel placeholders

### [2026-03-11] Owner role was tightened into a stronger fixed orchestration boundary

#### Summary
- Strengthened `Owner` as the repo's strongest fixed role in `AGENTS.md`
- Added explicit `Owner Boundary Lock`
- Added a fresh-chat first-response rule so `Owner` must begin with orchestration, not implementation drift
- Added `Owner Drift Recovery Rule` so any role drift is corrected by returning to role / execution mode / Builder request / validation framing
- Synced the same constraints into `docs/meta/ROLE_PROMPTS.md`

#### Current Impact
- `Owner` is now more clearly documented as planning-only unless the user explicitly reassigns the terminal
- Builder / Reviewer / QA work should no longer be implicitly absorbed by the Owner terminal
- New Owner chats now have a stronger invariant around the first response structure and required sections

#### Validation
- docs cross-check only:
  - `AGENTS.md`
  - `docs/meta/ROLE_PROMPTS.md`
  - `PROGRESS.md`

#### Follow-up
- On the next Owner-started package, verify that the first Owner response follows the new lock and recovery rules

### [2026-03-11] Owner wording was aligned after two reviewer findings

#### Summary
- Clarified that post-approval `investigation / implementation / validation / docs sync` wording refers to the assigned Builder lane, not direct Owner execution
- Unified the fresh-chat first-response required items across `AGENTS.md` and `docs/meta/ROLE_PROMPTS.md` to the exact same list:
  - active role
  - execution mode
  - Builder request
  - validation expectation

#### Current Impact
- Owner documentation is less likely to be misread as permission for direct execution after approval
- The two main Owner documents now use the same first-response wording strength for the same rule

#### Validation
- docs diff/self-check only:
  - Owner post-approval wording cross-check
  - fresh-chat required-item wording cross-check

#### Follow-up
- If another Owner review happens, check these two findings specifically before widening any role-policy edits

### [2026-03-11] `/admin/matrix` CSV export UX now explains scope, filename preview, and denied/empty states more explicitly

#### Summary
- Strengthened the `/admin/matrix` export area without changing the export backend contract:
  - current filter summary
  - expected export scope
  - current visible row count
  - fallback filename preview
- Added clearer pre-export guidance for:
  - empty result expectations
  - denied/auth-required situations
- Reused the same empty-state reasoning in the matrix table so the operator sees consistent guidance before and after filtering

#### Current Impact
- Operators can now understand what the CSV is likely to contain before clicking export
- Empty filter results explain whether widening the class scope or changing month is the next step
- Permission-related export guidance is clearer without changing any API or mutation behavior

#### Validation
- `npm run harness:report -- app/admin/matrix/page.tsx PROGRESS.md`
- `npm run verify:baseline`

#### Follow-up
- If a later slice needs more confidence, add rendered-browser QA for the export panel and download behavior
- Keep backend export naming and permission contract verification separate from this UI-only slice

### [2026-03-11] Baseline harness automation was added for verification and changed-file reporting

#### Summary
- Added repo-local verification entry points:
  - `npm run typecheck`
  - `npm run verify:baseline`
  - `npm run verify:full`
- Added `npm run harness:report` to print:
  - current changed files
  - rough lane/risk hints
  - end-of-package self-check reminders
- Updated `docs/VERIFY.md` so the new automation commands are part of the documented baseline workflow

#### Current Impact
- Builders and Reviewers now have one-step baseline verification commands instead of ad hoc command recall
- The project has a lightweight “CCTV” style changed-file report without adding heavy hook or CI tooling yet
- This is a local automation baseline, not full CI or browser QA automation

#### Validation
- `npm run typecheck`
- `npm run verify:baseline`
- `npm run harness:report`

#### Follow-up
- If this proves useful, the next narrow automation slice can add git-hook integration or a lightweight merged-result review command
- Browser automation should remain a separate package rather than being bundled into this baseline harness slice

### [2026-03-11] `harness:report` now distinguishes worktree-wide output from package-scoped output

#### Summary
- `harness:report` now labels whether the report is:
  - `worktree-wide`
  - `scoped`
- When used without extra paths, the command now clearly warns that the output reflects the full current worktree, not one Builder package
- When used with explicit file or directory arguments, the command filters changed files to that scope only

#### Current Impact
- The report is less likely to be over-trusted as a package-local CCTV view when the worktree is already dirty
- Builders and Reviewers can now run a narrower report for claimed files when they need package-local reasoning
- The baseline harness is still lightweight and does not require a persistent snapshot file

#### Validation
- `npm run harness:report`
- `npm run harness:report -- scripts/harness-report.mjs docs/VERIFY.md PROGRESS.md`
- `npm run verify:baseline`

#### Follow-up
- If stronger per-package tracking is needed later, add an explicit snapshot/start marker rather than inferring package boundaries from the whole worktree

### [2026-03-11] Student weekly detail now exposes progress / reflection and expandable full feedback

#### Summary
- Extended the existing `/student` read path to include `class_logs.progress` and `class_logs.reflection`
- Each weekly detail card now shows:
  - feedback preview
  - progress preview
  - reflection preview
  - expandable full text for all three read-only notes

#### Current Impact
- Students can read weekly learning context without leaving `/student`
- Long feedback is no longer limited to preview-only visibility
- The slice stays inside the existing `class_logs` / `enrollments` student read contract and does not change schema, RLS, RPC, or mutation behavior

#### Validation
- `npm run harness:report -- app/student/page.tsx hooks/useStudentDashboard.ts types/student-dashboard.ts PROGRESS.md`
- `npm run verify:baseline`

#### Follow-up
- If weekly note density grows further, the next safe slice is grouping or filtering logs rather than widening data access

### [2026-03-11] Parallel Builder workflow was tightened around an explicit Reviewer step

#### Summary
- The working model now keeps two route-local Builder lanes as the default parallel write shape:
  - `Builder 1` for `/student`
  - `Builder 2` for `/admin`
- `Reviewer` is now an explicit independent role instead of being blended into QA
- The intended flow for code-writing parallel packages is now:
  - Owner planning
  - Builder 1 / Builder 2 execution
  - Reviewer
  - QA only when the merged path is risky enough
- No extra top-level long-memory file such as `claude.md` was added; stable rules remain in `AGENTS.md`

#### Current Impact
- Parallel speed is still available for route-local work, but review boundaries are sharper
- Owner / Builder / Reviewer / QA role drift should be easier to avoid
- Shared auth / DB / mutation-contract work still remains single-owner

#### Validation
- docs cross-check only:
  - `AGENTS.md`
  - `docs/meta/ROLE_PROMPTS.md`
  - `docs/meta/DEVELOPMENT_METHOD.md`
  - `docs/DECISIONS.md`
  - `PROGRESS.md`

#### Follow-up
- Use the revised workflow on the next real parallel package
- If the extra review step proves too heavy, revisit the model with actual usage evidence

### [2026-03-11] Student dashboard detail density was increased without widening data contracts

#### Summary
- `/student` now shows a stronger read-only monthly status surface using the existing student dashboard read path
- Added a focus board for:
  - payment confirmation needed
  - classes with no attendance recorded yet
  - classes with no feedback yet
- Expanded each class card with:
  - clearer enrollment status labeling
  - attendance coverage progress bar
  - plain-language guidance for payment / attendance / feedback state

#### Current Impact
- Student users can identify what needs attention without opening admin surfaces
- The slice stays inside the existing RLS-safe read contract and does not change DB/auth truth
- This is a UI/read-density improvement, not a new mutation or schema feature

#### Validation
- `npm run lint`

#### Follow-up
- If product velocity stays student-first, the next natural slice is week-level detail under each class
- If admin value is more urgent, move back to export reliability or repeatable verification work

### [2026-03-11] Student dashboard now exposes week-level class log detail

#### Summary
- Extended the existing student dashboard read path to include `class_logs.week_number`
- Each student class card on `/student` now shows a weekly detail list with:
  - week number
  - attendance checked / unchecked state
  - feedback presence
  - short feedback preview text when available

#### Current Impact
- Students can move from monthly aggregate status into week-by-week detail without leaving `/student`
- The slice still uses existing RLS-safe reads from `enrollments` and `class_logs`
- No mutation, schema, RLS, or RPC behavior was changed

#### Validation
- `npm run lint`
- `node node_modules/typescript/bin/tsc --noEmit`

#### Follow-up
- The next student-facing slice could add richer weekly metadata such as progress/reflection if that should be student-visible
- Otherwise the next high-value lane can switch back to admin export or repeatable verification work

### [2026-03-11] Planning and verification docs were resynced to current auth/access reality

#### Summary
- `docs/PLAN.md` was updated to stop treating access QA and mutation denied-path verification as open `NOW` items
- `docs/PLAN.md` now prioritizes one rendered-browser QA pass, stronger repeatable validation, and practical export reliability
- `docs/VERIFY.md` now captures the currently proven auth/mutation/export contracts more explicitly
- `docs/VERIFY.md` now distinguishes source-backed QA from rendered-browser proof
- `PROGRESS.md` handoff guidance was narrowed to the current remaining gaps

#### Current Impact
- The next agent should not reopen already-completed access guard or mutation contract work by mistake
- Documentation now better matches the actual state reached on 2026-03-11
- The main remaining gap is confidence depth, not a known API authorization hole

#### Validation
- cross-check only:
  - `docs/PLAN.md`
  - `docs/VERIFY.md`
  - `PROGRESS.md`

#### Follow-up
- Prefer one rendered-browser QA pass for `/`, `/student`, `/admin/matrix`
- If browser tooling is deferred, keep calling the current fallback checks "source-backed" rather than rendered proof

### [2026-03-11] Lightweight dual-builder operating model adopted

#### Summary
- The default day-to-day team shape is now `Owner + Builder 1 + Builder 2`
- `Builder 1` is the recommended default lane for `/student`
- `Builder 2` is the recommended default lane for `/admin`
- `QA` is now treated as conditional, not always-on
- `Explorer` is now treated as conditional, not always-on
- Shared auth / role / redirect / home-hub / DB-truth work remains single-owner even when the default team shape is dual-builder
- The user retains final approval on intentional behavior or workflow changes; Owner is responsible for lane strategy and risk framing

#### Current Impact
- Route-local student/admin work can start faster without activating unnecessary roles
- Shared auth or permission work should still collapse to one Builder lane immediately
- Future lane planning should assume two Builder lanes first, then reduce or expand only when the boundary or risk requires it

#### Validation
- Docs sync review only

#### Follow-up
- Use the updated model in the next real lane claim
- Add merged QA only when auth / role / mutation or other risky paths are touched

### [2026-03-11] Access QA found an admin API authorization gap

#### Summary
- A runtime access-QA pass was run against local demo accounts for `OWNER`, `ADMIN`, `STUDENT`, and anonymous access
- `STUDENT` could call `GET /api/admin/matrix` successfully and received one populated row plus one class option
- anonymous access to the same endpoint returned `200` with an empty dataset instead of an explicit auth/permission error
- `OWNER` and `ADMIN` could read the matrix API, but `student_name` values fell back to UUIDs
- direct `profiles` reads for another user returned no row for `OWNER` and `ADMIN`, which does not match the documented `profiles_select_self_or_admin` expectation in `docs/db/RLS.SQL`

#### Current Impact
- `/admin/matrix` page-level UI may still block `STUDENT`, but the underlying admin API is not currently admin-only
- runtime DB behavior for cross-user `profiles` visibility appears narrower than the documented RLS intent
- access control confidence improved because the gap is now concrete and reproducible, but the unsafe API behavior is an immediate follow-up item

#### Validation
- `npm run seed:matrix-demo`
- local runtime checks with `OWNER` / `ADMIN` / `STUDENT` / anonymous tokens against `GET /api/admin/matrix`
- direct Supabase role-based reads for `profiles`, `enrollments`, and `class_logs`
- `npm run lint`
- `npm run build` failed: `Next.js build worker exited with code: 1`
- `node node_modules/typescript/bin/tsc --noEmit` failed in `hooks/useSupabaseSession.ts`

#### Follow-up
- Fix explicit role guarding for `GET /api/admin/matrix` in a single-owner lane
- Check whether `GET /api/admin/matrix/export` has the same authorization gap
- Re-run access QA after the server-side fix
- Treat browser fallback UI QA as still incomplete

### [2026-03-11] Admin GET access guard was tightened and validation chain restored

#### Summary
- Added an explicit admin-only access guard for `GET /api/admin/matrix`
- Applied the same guard to `GET /api/admin/matrix/export`
- Anonymous access now returns `401 AUTH_REQUIRED`
- `STUDENT` access now returns `403 ADMIN_REQUIRED`
- `OWNER` and `ADMIN` still receive `200`
- `hooks/useSupabaseSession.ts` type handling was tightened so Supabase thenables no longer break `tsc` / `next build`

#### Current Impact
- The previously confirmed unsafe admin GET gap is now closed
- Export now follows the same access contract as the main admin matrix GET route
- Baseline validation confidence is back because lint, typecheck, and build all pass again
- One access-related follow-up still remains: admin matrix rows still fall back to UUID-based `student_name`, which points to a live `profiles` visibility mismatch or contract drift

#### Validation
- `npm run lint`
- `node node_modules/typescript/bin/tsc --noEmit`
- `npm run build`
- production-build runtime checks for `GET /api/admin/matrix` and `GET /api/admin/matrix/export` with:
  - anonymous
  - `OWNER`
  - `ADMIN`
  - `STUDENT`

#### Follow-up
- Investigate why live `profiles` visibility for `OWNER` / `ADMIN` is narrower than the documented RLS expectation
- Re-run browser-level fallback/access QA when practical
- Continue with mutation denied-path verification after the remaining access mismatch is understood

### [2026-03-11] Profiles visibility mismatch was narrowed to live RLS behavior

#### Summary
- Runtime helper functions were checked directly with `OWNER`, `ADMIN`, and `STUDENT`
- `current_app_role()`, `is_admin_or_owner()`, and `is_owner()` all returned the expected values
- Despite that, direct `profiles` selects for `OWNER` and `ADMIN` still returned only the caller's own row
- In the same runtime check, `OWNER` and `ADMIN` could read multiple `enrollments` rows normally

#### Current Impact
- The remaining `student_name` UUID fallback in admin matrix is not best explained by a broken role helper
- The evidence now points more specifically to live `profiles` SELECT behavior being self-only, while `docs/db/RLS.SQL` currently documents a broader `profiles_select_self_or_admin` rule
- This narrows the next decision to DB/auth truth:
  - align live RLS to the documented policy
  - or revise docs if live self-only behavior is actually intended

#### Validation
- runtime checks for:
  - `rpc('current_app_role')`
  - `rpc('is_admin_or_owner')`
  - `rpc('is_owner')`
  - direct `profiles` selects
  - direct `enrollments` selects

#### Follow-up
- Treat the next step as a DB/auth truth decision, not a frontend fix
- Do not assume admin matrix name fallback can be safely fixed in UI alone
- If the team wants admin/owner to see student names, a DB/RLS change will likely be required
- A focused apply patch is prepared at `docs/db/patches/2026-03-11-profiles-select-self-or-admin.sql`
- Live apply is currently blocked from this environment because there is no DB admin execution path (`psql` / Supabase CLI / DB URL / management token)

### [2026-03-11] Live `profiles` RLS was aligned and admin matrix names recovered

#### Summary
- The focused patch at `docs/db/patches/2026-03-11-profiles-select-self-or-admin.sql` was applied in the live DB
- Recheck confirmed `OWNER` / `ADMIN` can now read other users' `profiles` rows, while `STUDENT` remains self-only
- Admin matrix rows no longer fall back to UUID-based `student_name` values for admin reads

#### Current Impact
- The earlier `profiles` visibility mismatch is now resolved
- Admin matrix name rendering is again aligned with the documented `profiles_select_self_or_admin` intent
- The main remaining risky surface is now mutation denied-path behavior, not admin read visibility

#### Validation
- runtime `profiles` visibility recheck after live patch:
  - `OWNER`: all rows `10`, other-user rows `1`
  - `ADMIN`: all rows `10`, other-user rows `1`
  - `STUDENT`: all rows `1`, other-user rows `0`
- local production runtime recheck on `127.0.0.1:3001`
  - `ADMIN` `GET /api/admin/matrix?year_month=2026-03`:
    - `200`
    - `rowCount = 4`
    - first `student_name = 학생1`
  - `STUDENT` `GET /api/admin/matrix?year_month=2026-03`:
    - `403 ADMIN_REQUIRED`

#### Follow-up
- Move next to payment / attendance mutation denied-path verification
- Keep browser-level fallback/access QA as a separate narrow slice

### [2026-03-11] Mutation denied-path QA found inconsistent permission signaling

#### Summary
- `PATCH /api/admin/matrix` was runtime-checked for both:
  - payment mutation
  - attendance mutation
- `ADMIN` success path works for both mutations
- Denied-path behavior is currently inconsistent:
  - payment:
    - `STUDENT` -> `404 ENROLLMENT_NOT_FOUND`
    - anonymous -> `404 ENROLLMENT_NOT_FOUND`
  - attendance:
    - `STUDENT` -> `400 ATTENDANCE_UPDATE_FAILED` with `permission denied`
    - anonymous -> `404 CLASS_LOG_NOT_FOUND`

#### Current Impact
- Mutation success path is available to the intended admin role
- Permission-denied signaling is not yet reliable enough to distinguish:
  - unauthorized
  - real not-found
- The clearest contract gap is payment update, where unauthorized callers currently look identical to a missing enrollment target

#### Validation
- local production runtime checks on `127.0.0.1:3001`
- `PATCH /api/admin/matrix` with:
  - admin token
  - student token
  - no token
- checked:
  - payment success / denied / missing-target
  - attendance success / denied / missing-target

#### Follow-up
- Treat explicit mutation permission signaling as the next single-owner backend decision
- Keep browser-level fallback/access QA separate from mutation contract work

### [2026-03-11] PATCH mutation guard now returns explicit auth/permission errors

#### Summary
- Added explicit admin access guarding to `PATCH /api/admin/matrix`
- Payment and attendance mutations now reject callers before class resolution when the caller is:
  - anonymous
  - signed-in non-admin
- The route now returns a consistent contract:
  - anonymous -> `401 AUTH_REQUIRED`
  - `STUDENT` -> `403 ADMIN_REQUIRED`
  - valid admin missing target -> `404 ..._NOT_FOUND`

#### Current Impact
- Mutation permission signaling is now aligned across payment and attendance
- Unauthorized callers no longer receive ambiguous RLS-shaped not-found responses for mutation attempts
- The main remaining verification gap has shifted from API permission ambiguity to browser fallback/access-state QA

#### Validation
- `npm run lint`
- `npm run build`
- `node node_modules/typescript/bin/tsc --noEmit`
- production runtime recheck on `127.0.0.1:3001`
  - payment success / denied / missing-target
  - attendance success / denied / missing-target

#### Follow-up
- Run one narrow browser fallback/access QA pass for `/`, `/student`, `/admin/matrix`
- Keep any future mutation contract changes single-owner

### [2026-03-11] Route-local fallback UX is explicit, but home hub fallback remains weaker

#### Summary
- A source-backed browser fallback QA pass was recorded for:
  - `/`
  - `/student`
  - `/admin/matrix`
- `/student` and `/admin/matrix` both have explicit fallback branches for:
  - `reconnecting`
  - `login_required`
  - `session_delayed`
  - `role_unknown`
  - `role_delayed`
  - `unauthorized`
- `/` remains more lightweight:
  - `login_required` and basic reconnecting hint are covered
  - but delayed/missing-role states are not surfaced with dedicated panels or recovery actions

#### Current Impact
- Route-local auth fallback UX is now reasonably clear on the two main surfaces
- The remaining browser-level UX ambiguity is concentrated in the home hub rather than the student/admin pages
- This is a UX clarity issue, not the same kind of access-control gap that the API routes had earlier

#### Validation
- source-backed branch inspection for:
  - `app/page.tsx`
  - `app/student/page.tsx`
  - `app/admin/matrix/page.tsx`
- cross-checked against already-confirmed runtime auth/API behavior

#### Follow-up
- Decide whether `/` should stay lightweight or receive explicit delayed/missing-role panels similar to the route-local pages
- If actual rendered-browser proof is needed later, add a headless browser toolchain first

### [2026-03-11] Home hub fallback panels were aligned with route-local surfaces

#### Summary
- `/` now has explicit fallback panels for:
  - `reconnecting`
  - `session_delayed`
  - `role_unknown`
  - `role_delayed`
  - `login_required`
- The home hub also now exposes direct recovery actions where relevant:
  - `세션 다시 확인`
  - `세션 초기화`
  - `Role 다시 확인`

#### Current Impact
- The earlier fallback clarity gap on `/` is reduced
- Fallback UX is now more consistent across `/`, `/student`, and `/admin/matrix`
- Remaining browser QA work is now mostly about rendered proof, not missing branch coverage

#### Validation
- `npm run lint`
- `npm run build`
- `node node_modules/typescript/bin/tsc --noEmit`

#### Follow-up
- If stronger confidence is needed later, add a headless browser toolchain and run a rendered-browser pass
- Otherwise this area is ready for commit/handoff

### [2026-03-10] Refresh no longer drops authenticated users into `ROLE 미확인` immediately

#### Summary
- `useSupabaseSession` now preserves the last confirmed role per user during refresh/bootstrap
- If live `profiles.role` lookup is slow or temporarily fails, the UI keeps the last known role instead of immediately degrading to `ROLE 미확인`
- Live role lookup still revalidates in the background and updates the cache on success
- Refresh/bootstrap now also reuses the last confirmed account hint so the page can show a stable "reconnecting" state instead of rendering the full matrix with a generic session-checking message
- Auth bootstrap UI interpretation is now centralized into a shared auth view-state hook instead of each page recomputing its own loading/role/fallback conditions
- Role/account-hint sessionStorage handling is now split into a dedicated bootstrap storage helper so `useSupabaseSession` can focus on auth flow orchestration instead of storage details
- Admin Matrix login/logout/session-reset actions are now moved into a dedicated auth session actions hook so the page does less auth-specific imperative work
- A follow-up regression was fixed where `useSupabaseSession` still referenced `isAppRole(...)` after helper extraction, causing successful role lookup to fail at runtime and fall back into `ROLE 미확인`

#### Current Impact
- Refreshing as `OWNER` / `ADMIN` should stop falling straight into the role-missing panel when the session is valid but role lookup is delayed
- During refresh, the page should prefer a compact reconnect panel over briefly showing the full admin screen with `세션 확인 중...`
- Future auth-aware pages can reuse the same `reconnecting / login_required / role_unknown / unauthorized` state model
- This is a bootstrap-stability fix, not a permission-model change

#### Validation
- `npm run lint`

#### Follow-up
- Real browser refresh should still be checked once for `OWNER` and one non-admin account
- If stale-role concerns appear later, inspect whether short-lived cache should be tightened further

### [2026-03-10] Student basic screen opened at `/student`

#### Summary
- A first student-facing surface now exists at `/student`
- The page reuses the shared auth bootstrap flow and shows role-aware states for reconnecting, login required, delayed role lookup, unauthorized admin access, and normal student entry
- The first follow-up now connects a safe student read path for current-month enrollment/payment/attendance/feedback summary using existing RLS-safe tables

#### Current Impact
- The product is no longer admin-only at the route level
- `STUDENT` users have a dedicated default-style surface that can later receive payment / attendance / feedback data safely
- `OWNER` / `ADMIN` who enter `/student` are directed back toward the admin surface
- Students can now see current-month class summary cards and class-by-class payment / attendance / feedback counts without adding new mutation scope
- The root route `/` now acts as a practical home hub for moving between student and admin surfaces during testing
- The home hub now also includes the core auth action set (Google login, email login, logout, refresh session, reset session) so testing can start directly from `/`
- Home auth UI now collapses the email login form after successful login and Google OAuth now returns to `/` instead of hardcoded `/admin/matrix`

#### Validation
- `npm run lint`

#### Follow-up
- Decide whether the next expansion should be week-level detail, richer class metadata, or explicit payment guidance
- Consider whether `/` should later redirect to `/student` or `/admin/matrix` based on role after auth flow is fully stable
  - `PROGRESS.md` reflects recent operational reality
  - `docs/PLAN.md` reflects intended next execution priority
  - `docs/SPEC.md` should be synced after behavior is stabilized

### Merge Order
1.
2.
3.

### Cross-Lane Risks
- overlap risk:
- merge risk:
- validation risk:
- doc sync risk:

---

## Active Blockers

- Full rendered-browser fallback/access QA is still incomplete because no local browser automation toolchain is installed
- RLS / auth behavior remains a high-risk area for accidental regression if future work reopens shared auth or DB truth
- Some older historical notes may still reference now-closed access gaps or already-removed clone scope

---

## Next Recommended Task

### Preferred next move
1. Define the next bounded feature package before reopening new Builder work

2. If confidence proof is more urgent than feature work, run one narrow rendered-browser QA pass for `/`, `/student`, `/admin/matrix`

3. Otherwise move to the next product-priority slice after explicitly choosing between:
   - student-facing detail expansion
   - repeatable validation strengthening
   - rendered-browser proof

### If staying single-owner
1. Keep shared auth / route protection / mutation contract work single-owner only

2. Keep new feature work bounded to one route-local slice unless separate worktrees are actually prepared first

3. Keep DB/auth truth changes single-owner if any new RLS or permission mismatch appears

### Operating reminders for the next package
1. Keep shared auth / redirect / role / route protection / RLS / RPC / mutation contract work as single-owner only
2. For route-local parallel work, use `Builder 1 + Builder 2 -> Reviewer` as the default code path
3. Add `QA` after merge only when auth / role / mutation or other risky paths were touched

---

## Handoff for Next Agent

### What to trust first
1. `AGENTS.md`
2. `docs/PLAN.md`
3. `PROGRESS.md`

### What may be stale
- Older product descriptions
- Older README-style explanations
- Any old note that still references removed clone-related behavior

### What is currently claimed
- see `Active Lanes` above before starting work
- do not claim an already active risky area without Owner / Lead approval

### What is risky
- auth redirects
- role handling
- RLS / permission changes
- payment / attendance mutation behavior
- anything that changes UI + API + DB together

### What is already closed
- `GET /api/admin/matrix` explicit auth/permission guard
- `GET /api/admin/matrix/export` explicit auth/permission guard
- `PATCH /api/admin/matrix` explicit auth/permission guard for payment and attendance mutations
- Home / student / admin route-level fallback branch coverage in source

### Merge reminder
- write lanes should be isolated by worktree or dedicated branch
- merge in Owner / Lead order
- run `Reviewer` before risky merge sign-off
- validate the merged result, not only lane-local changes

### Before changing DB/Auth
Always re-check:
- `docs/db/SCHEMA.sql`
- `docs/db/RLS.sql`
- `docs/db/RPC.sql`

### Practical reminder
If current code behavior and old documentation conflict, do not guess.
Document the conflict and update the docs after confirming actual behavior.

---

## Recent Entries

### [2026-03-10] Dev auth bootstrap timing logs added

#### Summary
- Development-mode timing logs were added around session bootstrap, auth events, role lookup, and session refresh
- The goal is to identify whether future stale-session loops come from duplicate bootstrap work, slow auth/session resolution, or slow role lookup

#### Current Impact
- Console output now provides request ids, event order, and rough elapsed time for the auth bootstrap path in development
- This should make the next stale-session investigation much faster and less guess-based

#### Validation
- `npm run lint` passed

#### Follow-up
- Reproduce the loop once and capture the `[spm-auth]` console sequence
- Use the captured order/timings to decide whether the next fix belongs in client bootstrap logic or Supabase/network timing analysis

### [2026-03-10] Dev stale-session recovery was hardened

#### Summary
- Development-mode source updates now trigger a more explicit stale-session recovery path
- The app can auto-attempt one session re-sync when a dev runtime update is detected while a session already exists
- Error boundaries now expose a direct "clear session and reload" exit instead of forcing users to manually recover outside the page

#### Current Impact
- Dev-time code updates should cause fewer confusing loops between waiting states and error pages when an old browser session is still present
- Recovery from a stale session should now be faster both from the main page and from error boundaries

#### Validation
- `npm run lint` passed

#### Follow-up
- Runtime confirmation after an actual dev hot-update is still needed to judge how much the looping symptom improved
- If the same symptom persists, the next target should be direct auth/network timing instrumentation

### [2026-03-10] Session bootstrap duplication was reduced

#### Summary
- The browser session bootstrap flow was tightened to reduce duplicate hydration of the same session
- Initial auth bootstrap and later auth events are now less likely to repeat the same session/role loading work unnecessarily
- This change complements the earlier recovery UI by reducing one likely cause of delayed role recognition

#### Current Impact
- Repeated session/role bootstrap work for the same session should happen less often
- Session recovery should now rely less on accidental re-entry timing and more on a cleaner single flow

#### Validation
- `npm run lint` passed

#### Follow-up
- Real runtime observation is still needed to confirm whether the long "세션 확인 중 / ROLE 확인 중" cases become less frequent
- If the symptom still appears often, the next check should focus on Supabase network/auth latency rather than client-state duplication

### [2026-03-10] Session and role bootstrap recovery was improved

#### Summary
- Session/role bootstrap in the browser now treats long waits more explicitly instead of silently hanging
- Session lookup and role lookup were given bounded timeout handling
- `/admin/matrix` now exposes quicker recovery actions when session or role bootstrap is delayed, including session refresh and forced reset paths

#### Current Impact
- Operators should spend less time waiting without feedback when session or role bootstrap stalls
- The page now makes the existing practical recovery flow more visible instead of requiring users to guess it

#### Validation
- `npm run lint` passed

#### Follow-up
- A runtime smoke check should confirm delayed session/role states now surface the intended recovery actions
- If bootstrap delays continue frequently, the next step should inspect Supabase auth latency and profile-query timing more directly

### [2026-03-10] Admin Matrix mutation flow was centralized

#### Summary
- Row-level payment/attendance action state management was extracted out of the page component
- `/admin/matrix` now delegates pending-state, save-state, and retry handling to a dedicated mutation-flow hook
- This keeps the page focused more on screen composition and less on row-action state orchestration

#### Current Impact
- Payment/attendance row actions now follow one centralized state flow
- Future mutation changes in the Admin Matrix should be easier to adjust without growing page-level complexity again

#### Validation
- `npm run lint` passed

#### Follow-up
- If the same pattern grows further, the hook can become the base for broader admin mutation reuse
- Runtime smoke-check for payment/attendance happy path remains useful after this refactor

### [2026-03-10] Admin Matrix row-action trust improved

#### Summary
- Row-level save feedback in `/admin/matrix` was strengthened for payment and attendance actions
- The table now surfaces how many rows are still saving or still in error
- Rows with a failed action now expose a direct "retry last action" path instead of only showing an error string

#### Current Impact
- Operators should be able to spot failed row actions faster and retry without manually reconstructing the last toggle
- Save-state feedback is now clearer at both row level and table level during active operations

#### Validation
- `npm run lint` passed

#### Follow-up
- A runtime smoke check would confirm the retry flow feels correct on both payment and attendance failures
- If needed later, more granular field-level badges can be added as a separate package

### [2026-03-10] Admin Matrix CSV export UX clarified

#### Summary
- `/admin/matrix` export area now shows the current CSV target more clearly
- Export guidance was added so operators can see month/class requirements before downloading
- Export button wording was localized and duplicate auth/error noise was reduced on export failure

#### Current Impact
- Operators should have clearer feedback about what will be exported and why export may be unavailable
- Export failures now rely on the export-specific message area instead of also surfacing duplicate generic auth noise

#### Validation
- `npm run lint` passed

#### Follow-up
- A quick runtime check would confirm the export helper text feels clear in practice
- If needed later, filename/record-count preview can be added as a separate package

### [2026-03-10] Admin Matrix state UX tightened

#### Summary
- `/admin/matrix` state handling UI was tightened without changing auth or mutation contracts
- Login-required, role-unknown, access-denied, and in-page admin state context were made more explicit
- Empty table state now offers a quick reset action when a class filter is narrowing results

#### Current Impact
- Operators should get clearer next-step guidance when the page is empty, restricted, or waiting on account state
- Admin users now see a small summary of current month/class and current table state before interacting

#### Validation
- `npm run lint` passed

#### Follow-up
- If needed later, the same state-panel pattern can be reused on other admin pages
- Runtime smoke-check on `/admin/matrix` would confirm the wording and empty-state action feel right in practice

### [2026-03-10] `/admin/matrix` STUDENT mutation denied path verified

#### Summary
- `STUDENT` role was checked against `/admin/matrix` mutation denied behavior
- Final UI remained access-restricted
- `MatrixFilters`, `MatrixTable`, and payment/attendance trigger UI were not visible
- One direct attendance-side bypass check also returned `permission denied`

#### Current Impact
- For `/admin/matrix`, the current denied path looks aligned at both UI and server level for the checked `STUDENT` case
- No misleading success state was observed in the checked path

#### Validation
- Real UI check confirmed access-restricted final state for `STUDENT`
- Mutation trigger UI remained hidden
- One bypass request was denied by the server

#### Follow-up
- Payment direct-request denial was not checked in this slice
- Treat this as page-level denied-path confidence, not full mutation QA closure for every path

### [2026-03-10] Copy-paste-friendly short role prompts added

#### Summary
- A short prompt pack was added for `Owner / Explorer / Builder / QA`
- The long-form prompts remain in `AGENTS.md`
- The short prompts were separated into `docs/meta/ROLE_PROMPTS.md` for easier terminal copy-paste use

#### Current Impact
- Operators can now launch role terminals faster without copying large prompt blocks from `AGENTS.md`
- Prompt maintenance still stays anchored to the stable rules in `AGENTS.md`

#### Validation
- `AGENTS.md` now points to `docs/meta/ROLE_PROMPTS.md` for short prompt use

#### Follow-up
- If practical use shows the short prompts are still too long, trim the wording without changing role boundaries

### [2026-03-10] Fixed prompts added for Owner / Explorer / Builder / QA

#### Summary
- `AGENTS.md` now includes fixed terminal prompts for the four-role operating model
- The practical default role set is now explicitly documented as `Owner / Explorer / Builder / QA`
- The prompts are aligned with the work-package model rather than micro-slice execution

#### Current Impact
- Operators can now copy a stable role prompt directly into each terminal without rewriting instructions each time
- Role behavior should be more consistent across repeated sessions

#### Validation
- `AGENTS.md` updated with practical operating-set guidance and fixed role prompts

#### Follow-up
- If a role prompt proves too verbose or too weak in practice, tune the prompt text rather than inventing a new ad hoc role

### [2026-03-10] Execution moved from micro-slices to work packages

#### Summary
- The operating model was adjusted again because micro-sliced execution caused too many approval pauses and response turns
- The new default is one safe work package per lane, not one tiny step per turn
- Low-risk work should usually complete investigation, implementation, minimum validation, and required docs sync in one pass

#### Current Impact
- Throughput should improve because obvious low-risk follow-up steps no longer need separate user turns
- High-risk areas still remain checkpointed and single-owner where required

#### Validation
- `AGENTS.md` was updated as the stable source of truth for work-package-based execution

#### Follow-up
- Watch for cases where work packages become too broad and re-tighten only if safety drops
- Keep using explicit next-action choices only when a real decision is needed

### [2026-03-10] Approval workflow relaxed for low-risk lanes

#### Summary
- Owner / Lead workflow was adjusted to reduce repeated user approvals for low-risk tasks
- Safe local workflow changes, docs-only sync, and clearly bounded low-risk fixes should now usually proceed without per-task confirmation
- Owner responses should prefer builder-ready instructions and explicit next-action choices instead of repeated role-switch prompts

#### Current Impact
- Low-risk execution should move faster with less approval fatigue
- High-risk areas such as auth, role handling, DB schema, RLS, RPC, and mutation contracts still require explicit confirmation

#### Validation
- `AGENTS.md` was updated as the stable source of truth for approval and handoff behavior

#### Follow-up
- Keep using short numbered next-action choices at the end of task results
- If this model causes unsafe drift, tighten approval scope again

### [2026-03-10] Admin Matrix attendance RPC mismatch resolved

#### Summary
- `/admin/matrix` attendance update failure was traced to an RPC contract mismatch between route code and the connected DB
- Route code was aligned to `update_attendance_status`
- The connected DB/cache was then updated so the expected attendance RPC became available again

#### Current Impact
- Admin Matrix attendance changes are working again with the current route contract
- The failure was isolated to attendance RPC availability, not payment/auth/UI behavior

#### Validation
- Confirmed the earlier failure mode was `update_attendance_status` missing from schema cache
- After DB-side correction, attendance change was rechecked and is now reported working

#### Follow-up
- Keep DB RPC deployment state aligned with `docs/db/RPC.sql`
- If the same symptom returns, check PostgREST schema cache and remote RPC drift first

### [2026-03-10] `npm run dev` now bootstraps local demo accounts

#### Summary
- `npm run dev` now runs a best-effort local demo seed before starting the Next dev server
- `tsx`-based scripts were switched to `node node_modules/tsx/dist/cli.mjs ...` to avoid local executable-bit issues

#### Current Impact
- Running `npm run dev` now attempts to create/update demo login accounts automatically
- Even if the seed step fails, the dev server still starts instead of blocking local development entirely

#### Validation
- `node --check scripts/dev-with-seed.mjs` passed
- `npm run lint` passed

#### Follow-up
- If the local seed fails repeatedly, check Supabase env values in `.env.local`
- If needed later, a dedicated `dev:no-seed` script can be added for cases where startup seeding is undesirable

### [2026-03-10] Local login error message clarified for unseeded test accounts

#### Summary
- Local email login now shows a specific recovery hint when Supabase returns `Invalid login credentials`
- The local preset area now also tells operators to run `npm run seed:matrix-demo` first

#### Current Impact
- Local testers get a direct next step instead of a generic auth error
- This reduces confusion when preset credentials are used before demo accounts are seeded

#### Validation
- `npm run lint` passed

#### Follow-up
- If needed, the same helper copy can be reused on other local auth screens

### [2026-03-10] Local test account names shortened and quick-fill added

#### Summary
- Local/demo test account default emails were shortened to easier addresses
- Admin Matrix email login form now shows one-click local preset buttons on `localhost` / `127.0.0.1`

#### Current Impact
- Demo seed defaults now use:
  - `a@spm.local`
  - `s1@spm.local`
  - `s2@spm.local`
- RLS/local test defaults now use:
  - `o@spm.local`
  - `a@spm.local`
  - `s@spm.local`
- Local operators no longer need to memorize or type long email addresses for common login checks

#### Validation
- `npm run lint` passed
- Confirmed local preset buttons only render for local hostnames

#### Follow-up
- If needed, the same quick-fill pattern can be added to other local-only login surfaces
- Existing env overrides still take precedence if custom test accounts are preferred

### [2026-03-10] Markdown filename case duplicates cleaned up

#### Summary
- Duplicate Markdown files differing only by extension case were consolidated
- The project now uses lowercase canonical names for active working docs:
  - `AGENTS.md`
  - `docs/PLAN.md`
  - `docs/SPEC.md`
  - `docs/VERIFY.md`
  - `docs/DECISIONS.md`
  - `docs/meta/DEVELOPMENT_METHOD.md`

#### Current Impact
- Case-variant duplicates like `AGENTS.MD` / `AGENTS.md` no longer coexist
- Active doc references now align with actual lowercase filenames on disk

#### Validation
- Confirmed active duplicate pairs were removed
- Confirmed the active doc set now resolves to lowercase `.md` filenames

#### Follow-up
- Archived files under `docs/archive/*` still contain some historical `PLAN.MD` references
- Keep archive references untouched unless there is a separate archive-normalization task

### [2026-03-10] `/admin/matrix` role-access spot check recorded

#### Summary
- `/admin/matrix` page access was spot-checked with real browser confirmation for the three primary roles
- `OWNER` could access the page normally
- `ADMIN` could access the page normally
- `STUDENT` was blocked from admin content and shown access-restricted UI

#### Current Impact
- Current role-aware access behavior for the Admin Matrix page looks aligned for the checked roles
- This reduces uncertainty for one page only and should not be treated as full admin-surface role QA completion

#### Validation
- Real browser check confirmed `OWNER` can enter `/admin/matrix`
- Real browser check confirmed `ADMIN` can enter `/admin/matrix`
- Real browser check confirmed `STUDENT` does not see `MatrixFilters` or `MatrixTable`

#### Follow-up
- Keep mutation and fallback behavior as separate verification slices
- Check other admin pages separately before treating broader role access as verified

### [2026-03-09] Deployment/domain/auth callback corrections stabilized

#### Summary
- Domain / redirect related deployment fixes were addressed
- Preview / production mismatch around auth callback behavior was investigated and corrected
- Related QA notes were captured separately in `docs/reports/2026-03-09-deployment-qa.md`

#### Current Impact
- Auth callback / domain issue is no longer treated as the primary active blocker
- However, auth flow should still be treated as sensitive and rechecked if changed again

#### Validation
- Practical deployment QA recorded in report doc

#### Follow-up
- Keep auth redirect handling within high-risk review category

---

### [2026-03-09] Clone flow removed from current active scope

#### Summary
- Clone-related UI / flow is treated as removed from the current active product scope

### DB Changes
- None documented here

### Validation
- Cross-reference required because old scope documents may still mention clone behavior

### Follow-up
- Do not reintroduce clone-related features unless explicitly added back to `docs/PLAN.md` and `docs/SPEC.md`

---
