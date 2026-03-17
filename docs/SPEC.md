# SPEC.md

## 목적

이 문서는 제품의 안정적인 의도와 범위를 정의한다.
이 문서는 화면 구조, 사용자 흐름, 상태 처리, fallback, 가시성 기준까지 포함한 현재 제품 truth다.
이 문서는 실행 계획, 진척 로그, workstream 상태표, 검증 체크리스트가 아니다.

## 제품 개요

### 제품 이름
SPM (SocialPlusManager)

### 제품 목표
SPM은 Social Plus 수업 운영과 관련 교육 워크플로를 실무적으로 관리하기 위한 운영 중심 도구다.

### 핵심 사용자 가치
인가된 운영자는 다음을 안전하고 신뢰 가능하게 수행할 수 있어야 한다.
- matrix 데이터를 확인한다
- 결제 상태를 안전하게 변경한다
- 출석 상태를 안전하게 변경한다
- 운영에 쓸 수 있는 데이터를 export한다
- auth / role 경계에서 혼란스럽지 않게 동작한다

## 대상 사용자

### 주요 사용자
- `OWNER`
- `ADMIN`

이 사용자들에게 가장 중요한 것은 빠르기보다도
실제 운영에서 믿고 쓸 수 있는 admin 도구다.

### 보조 사용자
- `STUDENT`

student-facing 흐름도 중요하지만,
제품의 핵심 목표는 여전히 안전하고 실용적인 admin 운영 표면이다.

## 제품 원칙

1. 운영 우선
2. 편의보다 안전
3. 작은 vertical slice
4. 이론보다 실용
5. 문서와 실제 구현의 드리프트 최소화

## UI / UX Baseline

### 제품 방향

- SPM은 `mobile-first web app`이다.
- 시각적으로 polished할 수 있지만 본질은 `admin-first operations tool`이다.
- consumer-app-inspired polish는 허용하되, operator confidence / explicit behavior / safe mutation / clear access handling을 해치면 안 된다.

### 핵심 UX 원칙

- current state가 action보다 먼저 보여야 한다
- action label은 직접적이고 해석이 필요 없게 간다
- loading / success / failure / unauthorized 상태를 명확히 구분한다
- payment / attendance 변경은 accidental하게 느껴지면 안 된다
- mobile에서도 scannability와 state visibility를 우선한다
- media 종류보다 `클래스 -> 주차 -> 콘텐츠` 흐름이 먼저 읽혀야 한다

### 현재 mobile surface baseline

이 baseline은 현재 active scope에서 유지하기로 한 구조다.
광범위한 redesign 없이 이 baseline 위에서 작은 slice를 이어간다.

#### Admin

- 하단 탭 구조:
  - `운영`
  - `학생`
  - `수업`
- 계정/설정/로그아웃은 하단 탭이 아니라 헤더 유틸리티 메뉴 또는 보조 화면으로 둔다
- `운영` 탭 상단 요약이 별도 home 역할을 흡수한다
- `운영` 탭은 다음 흐름을 담는다:
  - 오늘 요약
  - Admin Matrix
  - 검색 / 필터
  - payment 상태 변경
  - attendance 상태 변경
  - CSV export
  - 학생 row 상세 진입
- `학생` 탭은 student search / list / enrollment 관리 / 학생별 상태 맥락 확인 흐름을 담는다
- `수업` 탭은 `클래스 -> 주차 -> 콘텐츠` 관리 흐름을 담는다
- 영상/이미지는 최상위 탭으로 나누지 않고 주차 맥락 안에서 다룬다

#### Student

- 하단 탭 구조:
  - `수업`
  - `내상태`
- `수업` 탭의 첫 화면이 class list + 이번에 볼 것 + 최근 콘텐츠를 함께 보여주는 student home 역할을 흡수한다
- 프로필/로그아웃은 하단 탭이 아니라 헤더 유틸리티 메뉴 또는 보조 화면으로 둔다
- `수업` 탭은 step UI보다 자연스러운 `클래스 -> 주차 -> 콘텐츠` 소비 흐름을 우선한다
- 영상/이미지는 최상위 분리 탭이 아니라 주차 콘텐츠 안에서 함께 본다
- `내상태`는 출석 / 결제 / 진행 상태 / 피드백처럼 status-heavy 정보를 우선한다

### 탭 셸 기준

- 탭은 가로 선택 바로 보이고, 항상 고정된다
- 화면 본문은 탭 위 영역 안에서만 보이거나 스크롤된다
- 전체 페이지 스크롤보다 shell 내부 스크롤을 우선한다
- desktop은 mobile shell을 그대로 강제하지 않고 별도 레이아웃을 허용한다

## 현재 범위

### Admin Matrix 운영 표면
- matrix data view
- attendance status update
- payment status read visibility
- `CSV export`
- permission-aware behavior
- admin operator가 실제로 쓸 수 있는 수준의 usability
- 운영 표면의 class selector는 `현재 월 기본 선택 + 수업 먼저 선택 + 필요 시 월 변경` 순서를 따른다
- 운영 표면의 class selector는 활성 수업 전체를 보여 주되, 해당 월에 등록이 있는 수업을 먼저 노출한다
- 운영 메인 첫 진입 시에는 현재 월과 해당 월 우선순위 목록의 첫 항목을 기본 선택으로 사용하고, 월을 바꿔도 선택한 수업이 계속 활성 상태면 유지한다
- 모바일 운영 표면에서는 matrix를 축소된 표로만 강제하지 않고, 얇은 학생 카드 안에서 최소 정보와 `1~4주` 가로 출석 버튼을 빠르게 읽고 수정할 수 있어야 한다
- 운영 표면의 결제 상태는 read-only로 보이되, 실제 수정은 학생 배정 표면에서 수행한다
- 오너는 운영 메인 class selector에서 삭제 모드를 켜고 수업을 soft delete(`is_active=false`)할 수 있다

### Auth / Role / Access
- email login
- configured 환경에서의 Google login
- configured 환경에서 Google login은 Google Identity Services 기반 ID token sign-in을 우선 사용하고, 사용자-facing 기본 UX에서 Supabase-hosted OAuth redirect hop을 전면에 두지 않는다
- GIS client 설정이 없는 환경이나 GIS 표면 로드 실패 시에는 로그인 화면이 Google login을 끊지 않고 기존 redirect 기반 flow로 compatibility fallback 할 수 있어야 한다
- role-based access behavior
- role-aware page access
- access가 제한되거나 불명확할 때의 safe fallback behavior

### Account / Settings Secondary Routes
- `/admin/settings`와 `/student/profile`은 secondary route다
- 현재 baseline은 로그인 계정 확인, 이름 수정, 테마 선택이다
- 이메일은 읽기 전용으로만 보여 준다
- 계정 정보를 불러오지 못하면 local demo 데이터를 대신 보여주지 않고 명시적 오류/재시도로 처리한다

### Student Surface
- 학생용 기본 화면
- 학생이 읽을 수 있는 기본 상태 가시성
- 운영 계정으로 잘못 진입했을 때의 wrong-role 안내와 recovery
- mobile tab baseline(`수업 / 내상태`) 위의 학생 read flow
- 학생 수업 목록은 `class + year_month` 단위로 구성한다
- 학생은 `ACTIVE`와 `PENDING` 월을 본다
- `PENDING` 월은 `등록 예정` 또는 이에 준하는 상태 라벨로 명확히 구분한다
- `CANCELLED` 월은 학생 수업 목록에 노출하지 않는다
- admin core보다 우선순위는 낮지만 active scope 안에 있음

### Mobile Tab Prototype Baseline
- `/admin`은 `운영 / 학생 / 수업` mobile tab baseline을 가진다
- `/student`는 `수업 / 내상태` mobile tab baseline을 가진다
- student home 성격의 요약은 `수업` 탭 첫 화면 안으로 흡수한다
- account/profile/logout은 primary tab이 아니라 header utility 또는 secondary route로 둔다
- 이 구조는 현재 active scope에서 `keep`으로 잠긴 baseline이며, 다음 slice는 이 위에서 좁게 열린다

### Weekly Content Media Baseline
- 주차 콘텐츠는 `클래스 -> 주차 -> 콘텐츠` 맥락 안에서 다룬다
- 영상과 이미지는 최상위 navigation을 따로 갖지 않는다
- admin은 `수업` 탭 안에서 주차별 콘텐츠를 관리한다
- admin `수업` 탭의 헤더 control은 현재 월을 기본으로 유지하되, 관리할 수업을 먼저 고르고 필요할 때만 월을 바꾸는 흐름을 baseline으로 둔다
- admin 주차 영상 편집은 여러 영상을 세로로 모두 펼치기보다, 현재 선택된 영상 1개 preview와 가로 선택 strip을 중심으로 다룬다
- admin 선택 영상은 전체화면 진입 버튼을 통해 가능하면 landscape fullscreen으로 볼 수 있어야 하고, 종료 후 같은 편집 맥락으로 자연스럽게 돌아와야 한다
- admin 주차 이미지 목록도 한 줄 가로 스크롤로 훑고, 필요 시 확대해 확인할 수 있어야 한다
- student는 `수업` 탭 안에서 주차별 콘텐츠를 소비한다
- student는 선택한 주차 화면 안에서 영상을 바로 재생할 수 있는 방향을 baseline으로 둔다
- 영상 baseline은 `YouTube 연동`
- admin 주차 영상 입력은 YouTube 주소/영상 ID 붙여넣기와 링크 드롭을 우선 지원하고, 유효한 입력은 canonical YouTube watch URL로 정리해 저장한다
- 무료 운영 기준에서는 앱 안에서 영상 파일 자동 업로드를 수행하지 않고, 운영자가 YouTube에 먼저 올린 뒤 링크를 붙여 넣는다
- 이미지 baseline은 `별도 업로드`
- 공개 / 수정 / 삭제는 운영자가 제어해야 하는 기본 관리 행동이다
- 현재 active scope에서 mobile tab baseline은 유지하되, weekly video read/write/delete와 weekly image upload/delete/read는 current schema/RLS/storage contract 안에서 동작한다
- weekly image storage baseline은 `spm-media` public bucket / public object URL / admin-owner write contract를 사용한다
- current active media contract는 `class_log` 아래 `VIDEO` / `IMAGE` row를 여러 건 둘 수 있고, 각 row는 `media_id` 기준으로 수정/삭제한다
- current active weekly image contract는 `upload_method='MANUAL'`, `weekly-images/{class_id}/{year_month}/week-{week_number}/{timestamp}-{safe-filename}` path 규칙을 사용한다
- 이미지 추가 metadata contract는 아직 별도 truth로 잠기지 않는다

### Mobile / In-App Browser Handling
- mobile browser 흐름에 대한 실용적인 처리
- 보수적인 fallback messaging
- login / redirect confusion 완화

## 후순위 / 현재 범위 밖

- 광범위한 student product 확장
- 대규모 제품 리디자인
- 운영 가치가 증명되지 않은 큰 구조 개편
- 실제 pain이 드러나기 전의 speculative abstraction
- 명시적 재계획 없는 removed feature 재도입

## 제거 / 비활성 범위

### Clone Enrollment / Clone Flow
- clone 관련 UI / flow는 현재 active scope 밖이다
- 비공식적으로 되살리지 않는다
- 다시 넣을 때는 planning 문서와 scope 문서를 함께 갱신한다

## 기능 요구사항

### Admin Matrix View
- 인가된 admin 사용자는 matrix 데이터를 불러올 수 있어야 한다
- 관련 class / enrollment / attendance / payment 정보가 보여야 한다
- unavailable 또는 unauthorized 데이터는 안전하게 실패해야 한다
- 검색/필터 결과가 0건이면 failure가 아니라 empty로 해석해야 한다
- row detail은 보조 상세 surface이며 matrix나 학생 탭을 대체하지 않는다

### Student Enrollment Management
- 운영자는 `/admin`에서 기존 `STUDENT` profile을 현재 class/month enrollment로 배정할 수 있어야 한다
- 현재 구현 baseline은 새 auth 계정 생성이 아니라 기존 profile 배정 + enrollment status(`ACTIVE / PENDING / CANCELLED`) 조정 + `OWNER` 전용 실제 delete다
- `CANCELLED` enrollment는 ops 표에서 결제/출석 토글이 비활성화되어야 한다
- 학생 배정 표면은 `현재 월 기본 선택 + 수업 먼저 선택 + 필요 시 월 변경` 순서를 따르고, 선택 가능한 수업 목록은 활성 수업 전체를 보여 주되 해당 월 등록 기준 수업을 먼저 노출한다
- 학생 배정 표면 첫 진입 시에는 해당 월 수업 목록의 첫 항목을 기본 선택으로 사용하고, 목록 재검증 중에도 그 기본 선택이 불안정하게 비지 않아야 하며 월 변경 시에도 선택한 수업이 계속 활성 상태면 유지한다
- 학생 배정 표면의 수업 헤더 아래에는 긴 설명 대신 학생 수, 수강 상태, 결제 상태 같은 현재 월 요약만 간결하게 보여 준다
- 학생 배정 목록은 mobile에서 가능한 한 한 줄에 가깝게 읽히도록 압축하고, row 왼쪽에는 이름만 남기며 결제 여부와 등록 상태는 오른쪽 action control에서 수정/확인하게 한다
- owner delete는 학생 배정 목록에서 상시 노출하지 않고 `삭제 모드`에서만 보여 준다

### Payment Status Update
- 인가된 사용자는 학생 배정 표면에서 payment 상태를 변경할 수 있어야 한다
- unauthorized 변경은 안전하게 거부돼야 한다
- mutation 결과는 UI에서 이해 가능해야 한다
- 실패 상태가 silent success처럼 보이면 안 된다

### Attendance Status Update
- 인가된 사용자는 attendance 상태를 변경할 수 있어야 한다
- unauthorized 변경은 안전하게 거부돼야 한다
- UI는 성공/실패를 명확히 반영해야 한다
- 데이터 동작은 DB / RPC contract를 따라야 한다

### CSV Export
- export는 관련 matrix 상태를 반영해야 한다
- 실제 운영 시나리오에서 사용할 수 있어야 한다
- invalid 또는 unavailable 상태는 명확하게 실패해야 한다

### Auth / Role Behavior
- 인가된 역할은 맞는 UI에 도달해야 한다
- unauthorized 역할은 안전하게 차단돼야 한다
- ambiguous 상태가 위험한 접근으로 이어지면 안 된다
- fallback UX는 가능한 한 confusion을 줄여야 한다

### Account / Settings
- 로그인한 사용자는 자기 계정 정보를 확인할 수 있어야 한다
- 현재 active scope에서 수정 가능한 항목은 `full_name`뿐이다
- 이름 저장 성공/실패는 UI에서 명확히 구분돼야 한다
- 계정 정보를 못 불러온 상태를 정상 데이터처럼 꾸며서 보여주면 안 된다

### Student Surface
- 학생은 자기 화면에서 기본적인 상태를 읽을 수 있어야 한다
- 운영 계정으로 학생 화면에 들어온 경우 명확한 wrong-role 안내가 있어야 한다
- student-facing 기능은 admin core를 깨지 않는 범위에서 확장돼야 한다
- `PENDING` 월은 `등록 예정`으로 보이되, 아직 공개된 콘텐츠가 없으면 `곧 시작` 또는 `아직 공개된 콘텐츠 없음` 상태를 보여야 한다

### Weekly Content Media
- 운영자는 `수업` 탭에서 클래스와 주차 맥락 안에 주차별 영상/이미지 콘텐츠를 다룰 수 있어야 한다
- 영상은 YouTube 기준으로 연결할 수 있어야 한다
- 현재 구현 baseline은 admin weekly YouTube URL 다건 저장/수정/삭제 + admin weekly image 다건 업로드/교체/삭제 + student inline video/image 다건 확인까지다
- admin은 여러 저장 영상을 가로 선택 strip에서 고르고, 현재 선택된 영상 1개를 기준으로 preview/edit/delete 할 수 있어야 한다
- admin 이미지 목록은 가로 스크롤로 훑고, click/tap 확대와 교체/삭제 action을 함께 사용할 수 있어야 한다
- 이미지는 업로드 기준으로 다룰 수 있어야 한다
- 현재 active image contract는 `spm-media` public bucket, `media.url` public URL, `upload_method=MANUAL`, fixed weekly image path convention이다
- 공개 / 수정 / 삭제는 주차 콘텐츠 관리의 기본 행동이어야 한다
- 학생은 `수업` 탭에서 클래스와 주차 맥락 안에서 주차별 영상/이미지를 볼 수 있어야 한다
- 학생은 선택한 주차 화면 안에서 영상을 바로 재생할 수 있어야 한다
- 학생 주차 영상은 현재 선택된 1개 플레이어를 기준으로 보고, 여러 영상은 가로 선택 strip이나 좌우 이동으로 바꿔 볼 수 있어야 한다
- 학생 선택 영상도 전체화면 버튼으로 가능하면 landscape fullscreen에 들어갈 수 있어야 하고, 종료 후 같은 주차 선택 상태로 자연스럽게 돌아와야 한다
- 학생 주차 이미지는 한 줄 가로 스크롤로 훑을 수 있어야 한다
- 학생 주차 이미지 카드는 tap/click으로 확대해 자세히 볼 수 있어야 한다
- 학생은 주차별 피드백도 함께 볼 수 있어야 한다
- 주차별 피드백의 노출 규칙은 아래 `피드백 가시성 기준`을 따른다
- invalid media row가 있어도 유효한 media consume은 계속 가능해야 하고, 경고는 별도로 분리되어야 한다
- media는 별도 최상위 탭보다 `클래스 -> 주차 -> 콘텐츠` 흐름 안에서 먼저 이해돼야 한다
- local demo merged runtime QA에서는 admin weekly video save/delete, admin weekly image upload/replace/delete, student inline video/image read, image storage cleanup까지 다시 확인했다

## 상태 / 오류 / 복구 기준

핵심 surface는 최소한 아래 상태를 분리한다.

- initial / loading
- success / loaded
- empty
- failure
- unauthorized
- partial degradation

세부 원칙:
- loading은 가능하면 어떤 데이터를 불러오는지 맥락을 제공한다
- mutation 성공은 toast만이 아니라 실제 row/state 반영으로 확인 가능해야 한다
- 실패는 성공처럼 보이면 안 된다
- failure는 action명과 연결된 문구로 보여주는 편이 바람직하다
- unauthorized는 단순 403 노출보다 역할/접근 제한 의미를 이해 가능한 문구로 안내한다
- 일부 invalid media row가 있어도 유효한 media consume은 계속 가능해야 한다
- session / redirect confusion에서는 재로그인 필요인지 wrong-role인지 구분해야 한다

## 피드백 가시성 기준

- `강사 자체피드백`
  - 수업 운영자 또는 강사 내부 기록이다
  - student surface에는 노출하지 않는다
- `전체피드백`
  - 특정 class/month/week에 대한 공통 피드백이다
  - 해당 월 수업을 보는 학생 모두에게 노출한다
- `학생별 피드백`
  - 특정 학생에게만 보여주는 개인 피드백이다
  - 대상 학생 본인에게만 노출한다

## 기술 의도

이 문서는 DB나 구현의 기술 truth를 정의하지 않는다.
제품 동작은 아래를 전제로 한다.
- schema behavior follows `docs/db/SCHEMA.sql`
- RLS / permission behavior follows `docs/db/RLS.sql`
- attendance / payment mutation behavior follows `docs/db/RPC.sql`
- payment / attendance mutation의 canonical truth는 `docs/db/RPC.sql`이며, route wrapper는 허용하지만 direct table update는 canonical이 아니다.
- weekly media cardinality truth는 `class_log -> media 1:N`이며, `VIDEO` / `IMAGE` 모두 주차별 `0..N` row를 허용한다.

여기서 기술 truth를 새로 정의하거나 바꾸지 않는다.

## 성공 기준

제품은 아래가 충족될 때 성공으로 본다.

1. `Admin Matrix`가 intended operator에게 신뢰 가능하게 동작한다
2. payment / attendance mutation이 안전하게 동작한다
3. unauthorized behavior가 안전하게 실패한다
4. export가 실제 운영에서 쓸 만하다
5. auth / role 흐름이 일반 사용에서 혼란스럽지 않다
6. 문서가 실제 범위를 반영한다
7. 위험한 동작은 넓게 신뢰하기 전에 검증된다
