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
- 운영/학생 탭 class selector는 활성 수업 전체를 보여 주되, 해당 월 등록이 있는 수업이 먼저 와야 한다
- 운영/학생/수업 탭 헤더 control은 수업 selector가 월 input보다 먼저 보여야 한다
- 모바일에서는 matrix가 얇은 학생 카드 + `1~4주` 가로 출석 버튼 구조로 읽히고, 한 화면에서 여러 학생을 훑기 어렵지 않아야 한다
- 운영 메인 첫 진입에서는 현재 월과 해당 월 첫 수업이 기본 선택으로 열려야 하고, 월 변경 시에도 선택 수업이 활성 상태면 유지돼야 한다
- owner class delete mode는 `수업 삭제` 진입 후 `-` 표시된 항목 선택 -> 확인 다이얼로그 -> soft delete로 이어져야 한다
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
- duplicate enrollment shows an explicit failure instead of silent success
- lifecycle status change uses the canonical RPC helper when available, or the route compatibility fallback when the connected project has not picked that helper up yet
- owner-only delete stays explicit in both route contract and UI copy
- 학생 배정 표면은 현재 월을 기본으로 두고 활성 수업 전체를 보여 주되, 그 달 등록 기준 class가 먼저 와야 한다
- 학생 배정 표면 첫 진입에서는 해당 월 첫 수업이 기본 선택으로 열려야 하고, 목록 재로딩이나 월 변경 중에도 선택 수업이 활성 상태면 비거나 흔들리지 않아야 한다
- 학생 배정 목록의 row action은 mobile에서도 경계 밖으로 밀리지 않고, 가능한 한 한 줄에 가깝게 읽혀야 한다
- 학생 배정 목록의 row 왼쪽에는 이름만 남고, 결제 여부와 등록 상태는 오른쪽 action control에만 보여야 한다
- owner delete 버튼은 상시 노출되지 않고 `삭제 모드`에서만 보여야 한다
- denied outcomes stay distinguishable:
  - anonymous -> auth-required
  - signed-in non-owner delete -> owner-required
  - signed-in non-admin create/status update -> admin-required
  - missing target -> not-found

### Remote enrollment RPC sync
- connected Supabase helper drift는 먼저 `npm run verify:enrollment-rpc-presence`로 확인한다
- `SUPABASE_ACCESS_TOKEN`이 확보되면 `npm run apply:enrollment-rpc`로 `docs/db/RPC.sql`의 `update_enrollment_status` helper를 remote에 반영한다
- helper 반영 후에는 `npm run verify:enrollment-rpc-presence`, `npm run verify:enrollment-runtime`를 다시 실행한다
- compatibility fallback 제거는 remote helper 존재와 runtime 재검증 이후에만 판단한다

### Account / Settings self-update
- authenticated user can read current account info on the secondary route
- authenticated user can update only their own `full_name`
- anonymous `PATCH /api/profile` stays `401 AUTH_REQUIRED`
- save success / failure / retry meaning stays explicit
- profile read failure must not fabricate local demo data

### Student read flow / weekly content consume UI
- `/student` 첫 진입에서 기본 선택된 월별 수업 상세가 바로 보여야 한다
- 상단 수업 선택기에서 다른 월별 수업으로 바꾸면 같은 탭 안에서 상태 요약과 주차 콘텐츠가 함께 바뀌어야 한다
- selected class -> week -> content order is still understandable
- touched cards, tabs, and panels do not disagree on `loading` / `syncing` / `empty` / `selection-needed` / `all-clear` meaning
- current selection label matches the actual selected class, month, and week, or clearly says that nothing is selected
- student weekly media에서 영상은 현재 선택된 1개 플레이어와 이전/다음 또는 가로 선택 strip이 함께 유지돼야 한다
- student 선택 영상의 전체화면 버튼은 fullscreen 진입을 시도하고, 종료 뒤에도 같은 주차/영상 맥락으로 자연스럽게 복귀해야 한다
- student weekly image는 여러 건일 때 한 줄 가로 스크롤로 훑히고, snap 없이 엉키지 않아야 한다
- student 이미지 카드는 tap/click으로 확대 다이얼로그가 열리고, 닫은 뒤 주차 맥락으로 자연스럽게 돌아와야 한다
- CTA labels match the real action:
  - tab move
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

### Route-local copy / state alignment
- touched labels, helper text, status chips, and empty/error copy must match the real reachable state in the touched block
- when the same state is shown on mobile and desktop surfaces, label and tone should keep the same meaning unless the package explicitly changed that rule
- internal contract words such as `row`, `scope`, `class_log`, `media_id`, `upload_method`, or `storage contract` should not leak into operator-facing or student-facing copy unless the product text intentionally requires them
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
- configured 환경에서는 `/auth/login`의 Google entry가 GIS button 기반으로 열리고, 성공 path는 ID token sign-in 뒤 역할 화면으로 이어져야 한다
- Google client 설정이 없거나 GIS script load가 실패한 환경에서는 `/auth/login`이 Google entry를 끊지 않고 redirect 기반 compatibility fallback으로 이어져야 한다
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
- `/auth/login`은 localhost에서만 `오너 / 운영 / 학생` 원클릭 QA 로그인 표면을 보여 줄 수 있다
- weekly media allowed-session smoke는 `next start` 후 `SPM_BASE_URL=... npm run verify:weekly-media-runtime`로 재현할 수 있어야 한다
- student weekly media browser smoke는 `next start` 후 `SPM_BASE_URL=... npm run verify:student-browser-smoke`로 재현할 수 있어야 한다
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
- anonymous `/admin`, `/student`는 access gate를 명시적으로 렌더해야 한다
- allowed role은 자기 route에서 gate 없이 진입해야 한다
- wrong-role surface는 route는 보여 주되, raw role token(`role:`, `OWNER`, `STUDENT`)을 그대로 노출하지 않는다
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
