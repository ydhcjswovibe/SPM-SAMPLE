# DESIGN.md

> 보관 문서: 이 상세 설계 내용은 `docs/SPEC.md`로 병합되었고, 현재 active truth는 `docs/SPEC.md`다.

## 목적

이 문서는 `docs/SPEC.md`에 정의된 제품 의도와 범위를 기준으로, 실제 화면 구조, 사용자 흐름, 권한 동작, 상태 처리, 운영 행동, 실패 복구 기준을 더 구체화한 active 상세 설계 문서다.

이 문서는 다음을 다룬다.

- 화면 구조와 탭 셸
- admin / student 주요 흐름
- auth / role / access fallback
- loading / empty / failure / unauthorized 처리 기준
- 운영자가 실제로 쓰는 mutation 표면의 UX 기준

이 문서는 DB schema, RLS, RPC의 canonical technical truth를 새로 정의하지 않는다.
- schema truth: `docs/db/SCHEMA.sql`
- permission truth: `docs/db/RLS.sql`
- payment / attendance mutation canonical truth: `docs/db/RPC.sql`

## 설계 잠금

- Admin mobile tab baseline은 `운영 / 학생 / 수업` 3탭이다.
- Student mobile tab baseline은 `수업 / 내상태` 2탭이다.
- account / profile / settings / logout은 primary tab이 아니라 header utility 또는 secondary route에 둔다.
- payment / attendance mutation은 route wrapper를 둘 수 있지만 canonical truth는 RPC다.
- weekly media cardinality truth는 `class_log -> media 1:N`이며 `VIDEO` / `IMAGE` 모두 `0..N` row를 허용한다.
- student 관리의 primary surface는 Admin `학생` 탭이다.
- Matrix row detail은 별도 제품 surface가 아니라 `운영` 탭과 `학생` 탭에서 공유하는 보조 상세 surface다.
- desktop은 mobile shell을 그대로 복제하지 않아도 되지만, 상태 의미와 mutation 의미는 동일해야 한다.

## 문서 관계

- 현재 active 제품 truth: `docs/SPEC.md`
- 검증 기준: `docs/VERIFY.md`
- 기술 truth: `docs/db/*`

이 문서는 보관용이며, 현재 구현 판단은 `docs/SPEC.md`와 `docs/db/*`를 따른다.

## 제품 구조

SPM은 하나의 제품 안에 두 개의 서로 다른 표면을 가진다.

1. `Admin Surface`
2. `Student Surface`

핵심 우선순위는 항상 admin surface에 있다.

### 역할

- `OWNER`
  - 전체 운영 기능 접근 가능
  - payment / attendance 변경 가능
  - enrollment 관리 가능
  - media 생성/수정/삭제 가능
  - export 가능
  - delete 같은 고위험 동작 최종 권한 보유
- `ADMIN`
  - 일반 운영 기능 접근 가능
  - payment / attendance 변경 가능
  - enrollment 관리 가능
  - media 생성/수정/삭제 가능
  - export 가능
  - OWNER 전용 파괴적 동작은 제한
- `STUDENT`
  - student surface 접근 가능
  - 자신의 수업 / 콘텐츠 / 기본 상태 읽기 가능
  - admin surface mutation 불가

### 역할 UX 원칙

- 올바른 역할은 올바른 surface로 빠르게 도달해야 한다.
- 잘못된 역할은 blank screen 대신 명시적인 안내를 본다.
- unauthorized 상황은 조용한 실패보다 safe fallback이 우선이다.
- 사용자가 현재 role 상태를 추론해야만 하는 UX를 만들지 않는다.

## Admin Surface

### Mobile IA

하단 탭 baseline:
- `운영`
- `학생`
- `수업`

유틸리티 진입:
- header avatar/menu
- secondary route for account/settings if needed

### `운영`

운영자의 실질적인 home이자 작업 허브다.

포함 기능:
- 오늘 요약
- 현재 범위 요약
- Admin Matrix 조회
- 검색 / 필터
- payment 상태 변경
- attendance 상태 변경
- CSV export
- row detail 진입

설계 원칙:
- current state가 action보다 먼저 보여야 한다.
- high-risk mutation은 accidental tap처럼 느껴지면 안 된다.
- 필터 변경 후 현재 범위를 화면 상단에서 다시 확인할 수 있어야 한다.

### `학생`

학생 검색, 학생 리스트, 학생 상세, enrollment 관련 조작을 위한 primary student-management surface다.

포함 기능:
- 학생 검색
- 학생 리스트
- 학생 상세
- enrollment 상태 확인 및 관리
- 학생별 상태 맥락 확인

추가 규칙:
- 학생 상세는 matrix row detail과 분리된 별도 제품이 아니다.
- `운영` 탭 row action에서 들어가더라도 같은 상세 surface 또는 같은 데이터 모델을 공유한다.

### `수업`

`클래스 -> 주차 -> 콘텐츠` 흐름으로 주간 콘텐츠를 관리하는 탭이다.

포함 기능:
- 클래스 선택
- 주차 선택
- 주차별 YouTube media 관리
- 주차별 이미지 관리
- student-facing 콘텐츠 미리보기 성격의 확인

금지 원칙:
- 영상과 이미지를 product-level 최상위 navigation으로 분리하지 않는다.
- media type보다 class/week 맥락이 먼저 읽혀야 한다.

### 계정 유틸리티

계정 관련 기능은 bottom tab이 아니라 header utility에서 연다.

포함 기능:
- 현재 로그인 계정 정보
- role 인지
- logout
- wrong-role recovery 또는 안전한 이동 안내

## Admin 핵심 상호작용

### Matrix View

목적:
- 운영자가 실제 업무에 필요한 matrix 데이터를 보고 필요한 상태 변경을 안전하게 수행한다.

필수 표시 정보:
- 학생 식별 정보
- class / enrollment 맥락
- attendance 관련 상태
- payment 관련 상태
- row 상세 진입 가능성
- 현재 필터 범위

필수 행동:
- row 단위 payment 상태 변경
- row 단위 attendance 상태 변경
- row 상세 진입
- 현재 범위 CSV export

행 단위 UX 원칙:
- row는 조회 중심으로 스캔 가능해야 한다.
- 토글/버튼은 현재 상태와 변경 가능 여부를 직관적으로 보여야 한다.
- 서버 반영 실패 시 optimistic state를 성공처럼 유지하지 않는다.
- `CANCELLED` enrollment는 변경 불가 이유가 시각적으로 드러나야 한다.

mobile 해석:
- dense table보다 카드형 또는 압축형 row layout을 우선한다.
- 핵심 상태를 먼저 노출하고 나머지는 상세로 넘긴다.

desktop 해석:
- 더 넓은 컬럼 노출과 빠른 비교를 허용한다.
- 단, 상태 의미와 action 의미는 mobile과 달라지지 않는다.

### Search / Filter

- 필터는 현재 범위를 바꾸는 고의적 행위로 인식돼야 한다.
- 필터 적용 후 현재 범위는 화면 상단에 요약되어야 한다.
- 결과 0건은 failure가 아니라 empty다.
- unauthorized 또는 unavailable 데이터는 미노출 또는 안전한 실패로 처리한다.

### Payment Status Update

- 현재 payment 상태가 변경 UI보다 먼저 보여야 한다.
- 변경 불가 role이면 control은 비활성 또는 차단 상태여야 한다.
- 요청 중 / 성공 / 실패 / unauthorized를 구분한다.
- canonical mutation truth는 RPC다.
- direct table update를 canonical처럼 취급하지 않는다.

### Attendance Status Update

- 현재 attendance 상태를 명확히 보여준다.
- payment와 동일하게 안전하고 분명한 조작이어야 한다.
- 요청 중 / 성공 / 실패 / unauthorized를 구분한다.
- canonical mutation truth는 RPC다.
- direct table update를 canonical처럼 취급하지 않는다.

### Row Detail

row에서 다 보여주기 어려운 세부 운영 정보를 확인하는 보조 surface다.

포함 정보:
- 기본 학생 식별 정보
- enrollment 상태
- 최근 payment / attendance 상태 요약
- 운영 참고 정보

제한:
- matrix를 대체하는 새로운 home이 아니다.
- `학생` 탭 primary flow와 충돌하는 별도 관리 surface가 아니다.

### CSV Export

- export는 현재 필터/범위를 반영해야 한다.
- export 전 어떤 범위를 내보내는지 명확히 보여야 한다.
- invalid / unavailable / unauthorized 상태는 명확히 실패해야 한다.
- 진행 중 상태와 완료/실패 결과를 모호하게 두지 않는다.

## Enrollment Management

목적:
- 운영자가 기존 `STUDENT` profile을 현재 class/month enrollment에 배정하고 상태를 관리한다.

핵심 동작:
- 기존 student profile 검색
- 현재 운영 범위에 배정
- enrollment status를 `ACTIVE / PENDING / CANCELLED`로 관리
- OWNER 전용 delete 제공

상태별 기대 동작:
- `ACTIVE`: 일반 운영 표면에서 정상 처리 가능
- `PENDING`: 완전 운영 확정 전 상태
- `CANCELLED`: ops 표에서 payment / attendance 토글 비활성화

UX 원칙:
- enrollment 상태는 운영자가 해석 가능한 상태로 보여야 한다.
- `CANCELLED`는 조작 불가 이유가 명확해야 한다.
- delete는 일반 상태 토글과 시각적으로 구분한다.

## Weekly Content Media

### 기본 흐름

1. 클래스 선택
2. 주차 선택
3. 해당 주차 콘텐츠 목록 확인
4. YouTube / 이미지 추가, 수정, 삭제

### Weekly Video

- YouTube URL 기반
- 주차별 다건 저장 허용
- admin save / update / delete 가능
- student는 선택한 주차 내에서 바로 consume 가능

### Weekly Image

- 별도 업로드 방식
- 주차별 다건 허용
- admin upload / replace / delete 가능
- student는 해당 주차 안에서 이미지 확인 가능

저장 관련 baseline:
- public bucket / public object URL / admin-owner write contract
- fixed weekly image path convention 사용
- metadata는 현재 별도 truth로 잠그지 않음

UX 원칙:
- 업로드 진행 중 상태가 보여야 한다.
- replace / delete는 명확한 대상 이미지를 기준으로 작동해야 한다.
- storage cleanup이 필요한 삭제/교체는 성공/실패를 이해 가능한 방식으로 보여야 한다.
- invalid media row가 있어도 전체 콘텐츠 소비를 막지 않는다.
- 문제가 있는 media만 분리된 경고로 다룬다.

## Student Surface

하단 탭 baseline:
- `수업`
- `내상태`

유틸리티 진입:
- header avatar/menu
- secondary route for profile if needed

### `수업`

- student의 실질적인 home 역할을 함께 가진다.
- 첫 화면에서 class list, 이번에 볼 것, 최근 콘텐츠 같은 요약을 함께 보여줄 수 있다.
- 수업 목록 단위는 `class + year_month`다.
- 학생은 `ACTIVE`와 `PENDING` 월을 본다.
- `CANCELLED` 월은 목록에서 숨긴다.
- `PENDING` 월은 `등록 예정` 상태로 노출한다.
- `PENDING` 월에 아직 공개된 콘텐츠가 없으면 진입 후 `곧 시작` 또는 `아직 공개된 콘텐츠 없음` 상태를 본다.
- `클래스 -> 주차 -> 콘텐츠` 소비 흐름
- 같은 주차 안에서 영상/이미지를 함께 소비
- 같은 주차 안에서 전체피드백과 학생별 피드백을 함께 본다.
- student는 media type보다 이번 주에 무엇을 보면 되는가를 먼저 이해해야 한다

### `내상태`

- 출석
- 결제
- 진행 상태
- 피드백 등 상태형 정보 우선

### 프로필 유틸리티

- 계정 / 프로필 / logout

## Auth / Role / Access

### Login

지원 방식:
- email login
- configured 환경에서 Google login

UX 원칙:
- 로그인 방식 선택은 단순해야 한다.
- mobile browser / in-app browser에서 redirect confusion을 줄여야 한다.
- 로그인 이후 role에 맞는 목적 surface로 이동해야 한다.

### Role-aware Access

- `OWNER` / `ADMIN`: admin surface 접근 가능
- `STUDENT`: student surface 접근 가능
- 잘못된 surface 접근 시 명시적인 안내 제공

wrong-role 처리:
- admin 계정이 student 화면으로 들어온 경우 wrong-role 안내 + 복구 동선 제공
- student 계정이 admin 화면으로 들어온 경우 safe block + student surface로 돌아갈 수 있는 동선 제공

금지 사항:
- 권한 없음인데 빈 화면만 보이기
- 잠깐이라도 위험한 admin UI가 노출되기
- 사용자가 현재 role 상태를 추론해야만 하는 UX

### Safe Fallback

다음 상황에서 보수적 fallback을 제공한다.
- 권한 미확정
- 세션 불안정
- mobile redirect confusion
- in-app browser 제약

fallback 메시지는 기술 문구보다, 사용자가 다음 행동을 이해할 수 있는 운영 문구를 우선한다.

## 상태 / 오류 / 복구 기준

핵심 surface는 최소한 아래 상태를 분리한다.
- initial / loading
- success / loaded
- empty
- failure
- unauthorized
- partial degradation

세부 원칙:
- loading은 가능하면 어떤 데이터를 불러오는지 맥락을 제공한다.
- mutation 성공은 toast만이 아니라 실제 row/state 반영으로 확인 가능해야 한다.
- 실패는 성공처럼 보이면 안 된다.
- failure는 action명과 연결된 문구로 제공하는 편이 바람직하다.
- unauthorized는 단순 403 노출보다 역할/접근 제한 의미를 이해 가능한 문구로 안내한다.
- 일부 invalid media row가 있어도 유효한 media consume은 계속 가능해야 한다.
- session / redirect confusion에서는 재로그인 필요인지 wrong-role인지 구분해야 한다.

## 피드백 가시성 기준

- `강사 자체피드백`
  - 수업 운영자 또는 강사 내부 기록이다.
  - student surface에는 노출하지 않는다.
- `전체피드백`
  - 특정 class/month/week에 대한 공통 피드백이다.
  - 해당 월 수업을 보는 학생 모두에게 노출한다.
- `학생별 피드백`
  - 특정 학생에게만 보여주는 개인 피드백이다.
  - 대상 학생 본인에게만 노출한다.

## Desktop 확장 기준

SPM은 mobile-first지만 desktop에서 같은 shell을 강제하지 않는다.

desktop에서 허용되는 확장:
- 고정 열
- 더 많은 컬럼 노출
- 넓은 검색/필터 영역
- 병렬 정보 배치

desktop에서도 유지해야 하는 원칙:
- current state 우선
- 명확한 mutation
- unauthorized / failure의 분명한 표시
- role confusion 최소화

## 현재 범위 밖

- 신규 DB truth 정의
- clone enrollment / clone flow 재도입
- 근거 없는 대규모 student feature 확장
- 검증되지 않은 bulk operations의 광범위한 도입
