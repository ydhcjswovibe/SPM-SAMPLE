# VERIFY.md

## Purpose

This document defines the practical validation checklist for the current project.
It is not a changelog or a dated QA diary.
Date-specific QA results belong in `docs/reports/*`.

## Validation Baseline

Run the smallest relevant baseline when code changed:
- typecheck
- build when the change can affect compilation or release confidence
- lint only when the local ESLint toolchain is actually installed and passing in this repo

Default commands:
- `npm run typecheck`
- `npm run build`
- `npm run lint`

Practical note:
- if `npm run typecheck` fails only because `tsconfig.json` includes `.next/types/**/*.ts` and those files are missing, run `npm run build` once and rerun `npm run typecheck`
- when this rerun passes, record the first failure as a build-artifact/setup issue, not as a product regression
- if `npm run lint` fails because `eslint` is unavailable locally, record it as toolchain/setup gap rather than product regression

If one check is unavailable or intentionally skipped, say so explicitly.
If the package is docs-only, commands are optional; say which source docs or reports were consulted instead.

## Focused Checks

### Admin / Matrix read paths
- page renders
- critical table data loads
- filters / search still behave as expected
- touched area has no obvious broken interaction
- class selection order stays explicit: `current yearMonth default + class first + optional yearMonth change`
- 운영 탭 class selector는 활성 수업 전체를 보여 주되, 해당 월 등록이 있는 수업이 먼저 와야 한다
- 학생 `수업` 탭 class selector는 해당 학생의 `ACTIVE`/`PENDING` 등록만 보여 주고, soft delete된 inactive 수업은 숨겨야 한다
- 운영 탭과 학생 `수업` 탭 헤더 control은 수업 selector가 월 input보다 먼저 보여야 한다
- 학생은 `홈` 탭의 `수업 신청` quick action 다이얼로그에서 활성 수업과 월을 골라 승인 요청을 보낼 수 있어야 한다
- 학생의 중복 요청은 `이미 수강 중` 또는 `이미 승인 요청`처럼 구분된 결과로 보여야 한다
- 오너가 `PENDING -> ACTIVE` 승인한 뒤 학생 수업 상세는 같은 `class + month` 키여도 stale status에 머물지 않고 다시 읽혀야 한다
- 학생 수업 상황판과 빈 상태 문구는 `등록 예정`과 `수강 중`을 서로 다르게 직접 읽을 수 있어야 한다
- 모바일에서는 matrix가 얇은 학생 카드 + `1~4주` 가로 출석 버튼 구조로 읽히고, 한 화면에서 여러 학생을 훑기 어렵지 않아야 한다
- desktop에서는 좌상단 brand block과 우측 toolbar가 같은 첫 줄에서 정렬돼 한 shell처럼 읽혀야 한다
- desktop에서는 `운영 / 학생 / 수업` 이동 축이 상단이 아니라 고정 left sidebar rail로 유지돼야 한다
- desktop sidebar rail은 viewport 최상단이 아니라 brand block 아래에서 시작해야 한다
- desktop 본문 workspace는 rail 바깥의 narrower lane 안에 머물고, wide full-bleed처럼 퍼져 보이지 않아야 한다
- desktop shell 조정 이후에도 mobile `< md` 위치/정렬은 바뀌지 않아야 한다
- 운영 메인 첫 진입에서는 현재 월과 해당 월 첫 수업이 기본 선택으로 열려야 하고, 월 변경 시에도 선택 수업이 활성 상태면 유지돼야 한다
- owner class delete mode는 운영 헤더의 `삭제 모드` trigger로 진입되고, `-` 표시된 항목 선택 -> 확인 다이얼로그 -> soft delete로 이어져야 한다
- 운영 mobile browser smoke에서는 상단 `수업 selector / 월 selector / 메뉴 / 하단탭`과 `월 popover / menu open state / content week rail / bottom nav active-inactive`가 `background alpha > 0.9` 또는 `backgroundImage` 기반 opaque surface여야 하고, matrix/card action이 viewport 안에서 눌릴 크기를 유지해야 한다
- access-sensitive GET contract stays explicit:
  - anonymous -> `401 AUTH_REQUIRED`
  - signed-in non-admin -> `403 ADMIN_REQUIRED`
  - `OWNER` / `ADMIN` -> success

### Payment / Attendance mutations
- allowed role can trigger the mutation
- success is reflected in the UI
- denied or invalid cases are visible
- no silent success on failure
- payment helper drift가 있더라도 route contract는 유지되고, runtime 결과는 성공/실패를 구분해야 한다
- 운영 matrix에서는 결제 상태가 read-only로만 보이고, 실제 결제 변경은 학생 배정 표면에서 이뤄져야 한다
- when the contract changed, keep outcomes distinguishable:
  - anonymous -> auth-required
  - signed-in non-admin -> admin-required
  - allowed role + missing target -> not-found

### Enrollment mutations
- allowed admin or owner can add a monthly enrollment
- allowed student can create or reopen a self-request enrollment as `PENDING`
- duplicate enrollment shows an explicit failure instead of silent success
- lifecycle status change uses the canonical RPC helper directly
- owner-only delete stays explicit in both route contract and UI copy
- 학생 배정 표면은 현재 월을 기본으로 두고 활성 수업 전체를 보여 주되, 그 달 등록 기준 class가 먼저 와야 한다
- 학생 배정 표면 첫 진입에서는 해당 월 첫 수업이 기본 선택으로 열려야 하고, 목록 재로딩이나 월 변경 중에도 선택 수업이 활성 상태면 비거나 흔들리지 않아야 한다
- 학생 배정 목록의 row action은 mobile에서도 경계 밖으로 밀리지 않고, 가능한 한 한 줄에 가깝게 읽혀야 한다
- 학생 배정 목록의 row 왼쪽에는 이름만 남고, 결제 여부와 등록 상태는 오른쪽 action control에만 보여야 한다
- 학생 배정 목록의 결제/상태 action은 row마다 시작점이 크게 어긋나지 않도록 정렬돼야 한다
- owner delete 버튼은 상시 노출되지 않고 `삭제 모드`에서만 보여야 한다
- denied outcomes stay distinguishable:
  - anonymous -> auth-required
  - signed-in non-student self-request -> student-required
  - signed-in non-owner delete -> owner-required
  - signed-in non-admin create/status update -> admin-required
  - missing target -> not-found

### Weekly notes mutations
- allowed admin or owner can read and save weekly notes on `/admin`
- weekly notes mutation uses the canonical RPC helper directly
- `/admin` first entry must open a single student-by-week attendance board on both mobile and desktop
- `/admin`에는 visible `출석 / 피드백` 모드 전환이 남아 있으면 안 된다
- `/admin/content`는 실제 session이 있는 월이면 그 session이 속한 주차를 기본 선택으로 열어야 하고, `week` deep link는 실제 존재하는 weekNumber에만 맞춰야 한다
- `/admin/content`는 media-only surface여야 하며, notes/피드백 편집 textarea가 남아 있으면 안 된다
- `/admin/students`의 `피드백` action은 notes editor를 복제하지 않고 `/admin` 해당 학생/주차 sheet로 연결돼야 한다
- 주차 헤더 옆 icon-only button은 `주차별 운영 메모` sheet만 열어야 하고, 학생-주차 메모 icon은 `학생 메모 + 학생 reply read-only`만 보여야 한다
- 주차 헤더에는 큰 카드 strip이나 `운영` 텍스트 버튼이 남아 있으면 안 된다
- student surface에는 `개별 피드백`과 `reply slot`만 보이고, 주차별 수업 피드백이나 hidden legacy notes는 어떤 학생 DOM/API payload에도 노출되면 안 된다
- `/admin` 학생 메모 sheet에는 학생의 `reply slot`이 read-only로 함께 보여야 한다
- denied outcomes stay distinguishable:
  - anonymous -> auth-required
  - signed-in non-admin -> admin-required
  - invalid input -> invalid-notes-input

### Remote canonical sync
- connected Supabase drift는 먼저 `npm run verify:remote-canonical-presence`로 확인한다
- enrollment status helper만 좁게 볼 때는 `npm run verify:enrollment-rpc-presence`를 유지해도 된다
- `SUPABASE_ACCESS_TOKEN`이 확보되면 `npm run apply:remote-canonical-sync`로 아래 canonical drift를 remote에 반영한다:
  - `update_enrollment_status`
  - `update_enrollment_payment_status`
  - `class_logs.admin_note`
  - `upsert_weekly_class_log_notes`
- enrollment status helper만 따로 반영할 때는 `npm run apply:enrollment-rpc`를 유지해도 된다
- helper/column 반영 후에는 `npm run verify:remote-canonical-presence`, `npm run verify:enrollment-runtime`, `npm run verify:weekly-media-runtime`를 다시 실행한다
- remote helper/column 반영 뒤에는 runtime 재검증이 다시 통과해야 한다

### Account / Settings self-update
- authenticated user can read current account info on the account/settings route
- authenticated user can update only their own `full_name`
- anonymous `PATCH /api/profile` stays `401 AUTH_REQUIRED`
- save success / failure / retry meaning stays explicit
- profile read failure must not fabricate local demo data

### Student read flow / weekly content consume UI
- `/student` 첫 진입에서는 `홈` 탭의 대시보드가 먼저 보여야 하고, 요약/체크리스트/quick action이 과도한 세로 스크롤 없이 읽혀야 한다
- `/student/lessons`는 `수업` 탭 destination으로 열리고, 기본 선택된 월별 수업 상세가 바로 보여야 한다
- query selection이 없으면 current month enrollment가 우선 선택되고, 없을 때만 기존 대표 수업 fallback으로 내려가야 한다
- `/student/profile`는 `내상태` 탭 destination으로 열리고, 계정/상태 카드가 직접 보여야 한다
- legacy `/student/class/[classId]?yearMonth=...` deep link는 새 `수업` route contract로 정규화되어야 한다
- `홈`과 `수업`은 같은 `classId + yearMonth` selection key를 공유해야 하고, `홈 -> 수업` 이동 뒤에도 선택이 바뀌지 않아야 한다
- 기존 최상단 헤더 바의 수업/월 선택 control에서 다른 월별 수업으로 바꾸면 `수업` 탭 안의 주차 콘텐츠가 함께 바뀌어야 한다
- 실제 session이 있는 월이면 student `수업` 탭 기본 주차는 실제 수업 날짜를 따라야 하고, 없는 legacy 월만 기존 주차 fallback을 쓴다
- 학생 상단 헤더는 전 탭에서 `캐릭터 / 수업 selector / YY.MM 월 selector / 메뉴`가 한 줄에서 바로 보여야 하고, 숨겨진 가로 스크롤에 의존하지 않아야 한다
- 학생 상단 헤더는 뒤판 plate와 본체 bar가 구분되어 배경과 한 덩어리로 붙어 보이지 않아야 한다
- student browser smoke는 학생 헤더 selector/menu, 하단탭 active-inactive, 홈 progress rail, 홈 summary cards, 수업 주차 rail/button, reply composer, 이미지 확대 프레임, 비디오 overlay control을 같은 opaque surface 기준으로 확인해야 한다
- `홈` 탭과 `수업` 탭은 역할이 겹치지 않아야 한다:
  - `홈`: 요약 / 진행 / 체크리스트 / quick action
  - `수업`: 선택 / 주차 / 콘텐츠
- `홈` 탭의 `주차 열기`, `콘텐츠 보기`, `피드백 보기` CTA는 page-internal scroll이 아니라 `수업` 탭 이동으로 동작해야 한다
- `수업 신청` quick action은 `홈` 탭에만 있고, `수업`/`내상태`에서 중복 노출하지 않아야 한다
- `수업` 탭은 `홈`의 체크리스트/quick action을 반복하지 않아야 한다
- `수업` 탭 상단 본문은 `출석 / 공개 / 피드백` 요약 카드만 남고, hero/helper/status card를 반복하지 않아야 한다
- empty ownership은 다음처럼 나뉘어야 한다:
  - `홈`: 수업 없음 / 신청 필요 / 승인 대기 / 대표 수업 요약
  - `수업`: selection-needed / week-empty / content-empty / detail-refetch
  - `내상태`: account/status load/save
- selected class -> week -> content order is still understandable
- touched cards, tabs, and panels do not disagree on `loading` / `syncing` / `empty` / `selection-needed` / `all-clear` meaning
- current selection label matches the actual selected class, month, and week, or clearly says that nothing is selected
- student weekly media 주차 버튼은 기본 `1~4주차`가 보이고, `5주차`는 ready video/image가 있을 때만 보인다
- student `수업` 탭의 기본 주차는 현재 날짜 기준 `월의 n주차`를 사용하고, 콘텐츠 유무와 무관하게 그 주차를 먼저 연 뒤 invalid 범위만 clamp해야 한다
- student weekly media에서 영상은 현재 선택된 1개 플레이어와 같은 줄의 이전/다음 이동 control로 유지돼야 한다
- student 선택 영상의 전체화면 버튼은 fullscreen 진입을 시도하고, 종료 뒤에도 같은 주차/영상 맥락으로 자연스럽게 복귀해야 한다
- student weekly image는 여러 건일 때 한 줄 가로 스크롤로 훑히고, snap 없이 엉키지 않아야 한다
- student 이미지 카드는 tap/click으로 확대 다이얼로그가 열리고, 닫은 뒤 주차 맥락으로 자연스럽게 돌아와야 한다
- student `수업` 탭 본문은 주차 제목/상태 badge/helper를 반복하지 않고, ready media 뒤에 `개별 피드백`만 이어서 보여 줘야 한다
- 피드백이 있는 주차에서는 학생이 `reply slot`을 저장/수정/비우기 할 수 있어야 하고, 다른 학생 reply나 운영 내부메모는 노출되면 안 된다
- 학생 홈 상황판과 내상태 요약 카드는 불필요한 세로 부피 없이 한 화면에서 핵심 상태를 빠르게 읽을 수 있어야 한다
- 학생 하단 탭은 icon-only로 낮아져도 active tab이 색/배경만으로 즉시 구분되고, touch target과 safe area 여백이 유지돼야 한다
- CTA labels match the real action:
  - tab move
  - request quick action
  - class or week selection
  - read-state refetch
  - logout
- wrong-role, recovery, and refetch meaning stays unchanged unless the package explicitly targeted those flows

### Admin mutation confidence UI
- separate the claim before sign-off:
  - source-backed UI confidence:
    - running / saved / error / retry labels match reachable code paths
    - raw keys or internal ids are not exposed as operator-facing copy
    - denied / invalid / retry states stay distinguishable in the touched UI
  - runtime-proven mutation confidence:
    - an actual allowed admin session executed at least one success case
    - and at least one failure or retry-recovery case when that path was claimed
    - the observed UI matched the claimed running / saved / error feedback
- if no interactive mutation was executed, keep the result `source-backed` only and do not report it as runtime-proven

### Admin mobile attendance shell
- `/admin` mobile 출석부는 `이름 + 결제 + 1~4주 컨트롤` 조밀한 리스트 구조로 보여야 한다
- 같은 기준은 desktop에서도 `학생 행 + 주차 열` 운영판으로 이어져야 한다
- 출석부 상단에는 `출석부` 제목과 우상단 icon action(`CSV`, `필터`)만 남아야 하고, helper text / wide export button / fallback notice box가 고정 노출되면 안 된다
- mobile/desktop 모두 학생-주차 셀은 `원터치 출석 버튼 + 옆 작은 메모 칩` 구조여야 한다
- 원터치 출석 버튼은 해당 주의 실제 수업 날짜 전체를 한 번에 `출석 / 결석`으로 토글해야 한다
- 체크되지 않은 값은 operator UI에서 `결석`으로 읽혀야 하고, admin board에는 별도 `pending` state가 남아 있으면 안 된다
- `지난 실제 수업 주차 결석`은 red tone으로, `현재/미래 미체크`는 neutral tone으로 구분돼야 한다
- 학생 메모 칩은 `메모 있음 / 답글 도착` 상태를 tint로 구분하면서도 32px 이상 tap target을 유지해야 한다
- 주차별 운영 메모는 `1주 / 2주 / 3주 / 4주` 헤더 옆의 작은 icon-only button으로만 열려야 한다
- desktop에서는 주차 라벨 hover에만 날짜+요일 tooltip이 보이고, mobile에서는 sheet 안에서만 날짜+요일이 보여야 한다
- 학생 리스트 row, 출석 버튼, 메모 칩, 주차 헤더 note icon은 pressed/open/saving 상태에서도 반투명해 보이면 안 된다
- attendance icon은 모든 상태에서 실제로 보여야 하고, week auto-focus와 필터 상태가 즉시 구분돼야 한다
- `class_sessions`가 있는 월에서는 버튼 라벨과 tab label이 실제 날짜 range와 일치해야 한다
- `class_sessions`가 없는 legacy 월에서도 같은 출석부 surface로 열려야 하고, main surface에 legacy fallback 설명 박스를 새로 띄우지 않아야 한다
- 우상단 필터 메뉴에는 `답글 도착만`만 남아 있어야 하고, 기존 filter chip strip는 없어야 한다

### Route-local copy / state alignment
- touched labels, helper text, status chips, and empty/error copy must match the real reachable state in the touched block
- when the same state is shown on mobile and desktop surfaces, label and tone should keep the same meaning unless the package explicitly changed that rule
- internal contract words such as `row`, `scope`, `class_log`, `media_id`, `upload_method`, or `storage contract` should not leak into operator-facing or student-facing copy unless the product text intentionally requires them
- 한 화면 안에서 같은 상태 의미를 요약칩 / 범례 / empty helper로 반복 설명하지 않는지 확인한다
- if the interaction contract itself did not change, a file-scoped source-backed review is enough; say explicitly that runtime proof was not attempted

### Route-local local-mock / prototype truth
- copy explicitly says `local mock`, `prototype`, or equivalent when no real contract exists
- copy does not imply cross-route, cross-role, persisted, uploaded, published, or permission-backed truth unless implementation actually proves it
- if the current mock scope is narrower than product intent, say the current scope explicitly:
  - selected week only
  - `class + week`
  - local state in this tab only
- helper lines, success messages, and status chips must stay inside the actual mock scope and must not overclaim student-visible or admin-visible truth

### Auth / Access behavior
- login entry works
- mobile viewport는 browser zoom을 막지 않아야 한다
- `/`는 화면 중앙의 단일 로그인 카드와 `Social Plus` 브랜드 라벨이 먼저 읽히고, 이메일/비밀번호 form이나 회원가입 CTA를 노출하지 않아야 한다
- `/auth/login`은 compatibility alias로만 남고 `/`로 redirect해야 한다
- configured 환경에서는 `/`의 Google entry가 GIS button 기반으로 열리고, 성공 path는 ID token sign-in 뒤 역할 화면으로 이어져야 한다
- Google client 설정이 없거나 GIS script load가 실패한 환경에서는 `/`가 다른 auth method로 우회하지 않고, 명시적 로그인 unavailable 안내만 보여 줘야 한다
- logout still works
- protected page access still behaves correctly
- unauthorized users do not see misleading success states
- when fallback UX changed, check the active routes directly:
  - `/`
  - `/student`
  - `/admin`

### Local runtime auth harness
- allowed-session runtime proof가 막혀 있으면 먼저 `npm run runtime:seed-auth`로 로컬 QA 계정을 맞춘다
- local runtime login/session route는 `127.0.0.1` 또는 `localhost`에서만 써야 한다
- local runtime login은 `@spm.local` 계정만 허용해야 한다
- `/`는 localhost에서만 `오너 / 운영 / 학생` 원클릭 QA 로그인 표면을 추가로 보여 줄 수 있다
- weekly media + notes allowed-session smoke는 `next start` 후 `SPM_BASE_URL=... npm run verify:weekly-media-runtime`로 재현할 수 있어야 한다
- student weekly media browser smoke는 `next start` 후 `SPM_BASE_URL=... npm run verify:student-browser-smoke`로 재현할 수 있어야 한다
- admin mobile browser smoke는 `next start` 후 `SPM_BASE_URL=... npm run verify:admin-mobile-browser`로 재현할 수 있어야 한다
- auth / wrong-role / self-profile route smoke는 `next start` 후 `SPM_BASE_URL=... npm run verify:route-guards`로 재현할 수 있어야 한다
- enrollment create/status/delete smoke는 `next start` 후 `SPM_BASE_URL=... npm run verify:enrollment-runtime`로 재현할 수 있어야 한다
- connected Supabase helper drift는 `npm run verify:enrollment-rpc-presence`로 먼저 확인한다
- 이 결과는 로컬 반복 검증 수단이지 운영 환경 기능이 아님을 기록한다

### Weekly media input UX
- admin `수업` 탭의 새 영상 입력은 YouTube 주소/영상 ID 붙여넣기와 링크 드롭을 받아야 한다
- 유효한 입력은 canonical YouTube watch URL로 정리돼 저장 전 preview가 가능해야 한다
- admin 저장 영상이 여러 건일 때 현재 선택된 1개 preview/edit surface와 가로 선택 strip이 함께 유지돼야 한다
- admin 선택 영상의 전체화면 버튼은 fullscreen 진입을 시도하고, 종료 뒤에도 같은 편집 맥락으로 복귀해야 한다
- admin 이미지 목록은 가로 스크롤 카드와 확대 보기, 교체/삭제 action이 함께 동작해야 한다
- 무료 운영 기준에서는 영상 파일 선택/드롭 업로드를 열지 않고, YouTube에 먼저 업로드한 뒤 링크를 붙여 넣는 흐름만 유지해야 한다

### Route guard / wrong-role rendered smoke
- anonymous `/admin`, `/student`는 access gate 대신 `/`로 redirect해야 한다
- allowed role은 자기 route에서 redirect 없이 진입해야 한다
- wrong-role signed-in access는 gate render 대신 자기 권한의 기본 화면으로 redirect해야 한다
- auth/role package를 건드렸다면 local runtime이 준비된 상태에서 `verify:route-guards`를 우선 고려한다

### Student weekly media browser / manual check
- route와 API runtime proof만으로 iframe/image DOM 상호작용을 runtime-proven으로 부르지 않는다
- 실제 player/image consume을 주장하려면 브라우저 또는 수동 DOM 확인이 필요하다
- local browser smoke는 `npm run verify:student-browser-smoke`를 우선 사용한다
- 브라우저 자동화가 없으면 manual checklist를 별도 report로 남기고, 남은 gap을 그대로 기록한다

### CSV / Export
- export action is visible only where intended
- export still works for the allowed role
- denied roles do not get misleading export behavior

### Mobile / Preview / Callback changes
- page still opens
- key action is reachable
- auth guidance is still accurate
- preview/prod redirect assumptions are not mixed
- no obvious redirect loop appears

## High-Risk Triggers

Do not stop at lint or typecheck when touching:
- role / access rules
- auth flow
- redirect / callback behavior
- payment mutation logic
- attendance mutation logic
- export permission behavior
- RLS / RPC / DB schema
- mobile / in-app browser sensitive flows

## DB / Auth Consistency

When DB or auth behavior is involved, verify against:
- `docs/db/SCHEMA.sql`
- `docs/db/RLS.sql`
- `docs/db/RPC.sql`

Check that:
- UI assumptions match schema / RPC intent
- permission assumptions are still valid
- denied actions are not exposed as if they should succeed

If code and docs disagree, report it explicitly.
Do not paper over DB / auth truth mismatches in UI code alone.

## Documentation Check

When behavior changed, confirm the right docs were updated:
- `docs/SPEC.md` for user-visible scope changes
- `PROGRESS.md` for meaningful completed work and handoff
- `docs/db/*` for schema / RLS / RPC truth changes
- `docs/reports/*` for dated runtime/source-backed evidence when a package meaningfully changed validation confidence
- `docs/reports/README.md` and `docs/reports/TEMPLATE.md` when reporting format or conventions changed

## Parallel / Merge Check

Run this when two or more lanes changed code or docs in the same work cycle:
1. each lane completes its own focused validation
2. after merge, run one combined smoke pass on the merged result
3. if auth / role / mutation / export changed across lanes, re-check denied and fallback paths after merge
4. if any lane touched DB / auth truth, re-read `docs/db/*` before sign-off
5. state unresolved overlap or merge risk explicitly

## Confidence Levels

### Source-backed
Use when the task is a narrow branch / contract check or runtime tooling is unavailable.
Say clearly that the result is source-backed, not rendered proof.

### Rendered proof
Prefer when fallback UX clarity, route protection, or release confidence is in question.
Say which routes and states were actually observed.

### Runtime-proven
Use when an interactive route or mutation was actually executed end-to-end.
Say the exact route, role, action, and observed outcome.
For mutation confidence, prefer this level before claiming operator trust.

## Handoff Evidence Minimum

### Builder
- changed files
- minimal validation actually run, or docs-only reason why no command was needed
- claimed confidence level:
  - source-backed
  - rendered proof
  - runtime-proven
- if local mock or prototype UI was touched, the current truth scope and unopened contracts

### Reviewer
- findings or `No findings` with touched scope
- confidence level used for the review
- explicit statement when runtime proof was not attempted
- whether copy, helper text, or status labels overclaim contract, scope, or visibility

### QA
- route, role, state, and action actually observed
- what was runtime-proven versus still source-backed
- remaining gap and what must happen before the package can be treated as higher confidence

## Reporting Rule

Keep validation reporting concise and honest:
- what was checked
- what passed
- what failed
- what was not checked
- remaining risk

Separate runtime-proven results from inference.
Do not let a stronger confidence label appear in the report than the evidence actually supports.

## What This File Is Not

This file is not:
- a changelog
- a one-time QA diary
- a design philosophy note

Use:
- `PROGRESS.md` for current state and history
- `docs/reports/*` for dated QA results
- `AGENTS.md` for operating rules
