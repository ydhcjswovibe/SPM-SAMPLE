# SPEC.md

## 목적

이 문서는 제품의 안정적인 의도와 범위를 정의한다.
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
  - `수업`
  - `계정`
- `운영` 탭 상단 요약이 별도 home 역할을 흡수한다
- `운영` 탭은 다음 흐름을 담는다:
  - 오늘 요약
  - Admin Matrix
  - 검색 / 필터
  - payment 상태 변경
  - attendance 상태 변경
  - CSV export
  - 학생 row 상세 진입
- `수업` 탭은 `클래스 -> 주차 -> 콘텐츠` 관리 흐름을 담는다
- 영상/이미지는 최상위 탭으로 나누지 않고 주차 맥락 안에서 다룬다

#### Student

- 하단 탭 구조:
  - `홈`
  - `수업`
  - `내상태`
  - `내정보`
- `수업` 탭은 step UI보다 자연스러운 `클래스 -> 주차 -> 콘텐츠` 소비 흐름을 우선한다
- 영상/이미지는 최상위 분리 탭이 아니라 주차 콘텐츠 안에서 함께 본다
- `홈`은 이번 주 볼 것 / 새 콘텐츠 / 이어보기 / 공지 성격을 우선한다
- `내상태`는 출석 / 결제 / 진행 상태 / 피드백처럼 status-heavy 정보를 우선한다

### 탭 셸 기준

- 탭은 가로 선택 바로 보이고, 항상 고정된다
- 화면 본문은 탭 위 영역 안에서만 보이거나 스크롤된다
- 전체 페이지 스크롤보다 shell 내부 스크롤을 우선한다
- desktop은 mobile shell을 그대로 강제하지 않고 별도 레이아웃을 허용한다

## 현재 범위

### Admin Matrix 운영 표면
- matrix data view
- payment status update
- attendance status update
- `CSV export`
- permission-aware behavior
- admin operator가 실제로 쓸 수 있는 수준의 usability

### Auth / Role / Access
- email login
- configured 환경에서의 Google login
- role-based access behavior
- role-aware page access
- access가 제한되거나 불명확할 때의 safe fallback behavior

### Student Surface
- 학생용 기본 화면
- 학생이 읽을 수 있는 기본 상태 가시성
- 운영 계정으로 잘못 진입했을 때의 wrong-role 안내와 recovery
- mobile tab baseline(`홈 / 수업 / 내상태 / 내정보`) 위의 학생 read flow
- admin core보다 우선순위는 낮지만 active scope 안에 있음

### Mobile Tab Prototype Baseline
- `/admin/matrix`는 `운영 / 학생 / 수업 / 계정` mobile tab baseline을 가진다
- `/student`는 `홈 / 수업 / 내상태 / 내정보` mobile tab baseline을 가진다
- 이 구조는 현재 active scope에서 `keep`으로 잠긴 baseline이며, 다음 slice는 이 위에서 좁게 열린다

### Weekly Content Media Baseline
- 주차 콘텐츠는 `클래스 -> 주차 -> 콘텐츠` 맥락 안에서 다룬다
- 영상과 이미지는 최상위 navigation을 따로 갖지 않는다
- admin은 `수업` 탭 안에서 주차별 콘텐츠를 관리한다
- student는 `수업` 탭 안에서 주차별 콘텐츠를 소비한다
- student는 선택한 주차 화면 안에서 영상을 바로 재생할 수 있는 방향을 baseline으로 둔다
- 영상 baseline은 `YouTube 연동`
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

### Student Enrollment Management
- 운영자는 `/admin/matrix`에서 기존 `STUDENT` profile을 현재 class/month enrollment로 배정할 수 있어야 한다
- 현재 구현 baseline은 새 auth 계정 생성이 아니라 기존 profile 배정 + enrollment status(`ACTIVE / PENDING / CANCELLED`) 조정 + `OWNER` 전용 실제 delete다
- `CANCELLED` enrollment는 ops 표에서 결제/출석 토글이 비활성화되어야 한다

### Payment Status Update
- 인가된 사용자는 payment 상태를 변경할 수 있어야 한다
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

### Student Surface
- 학생은 자기 화면에서 기본적인 상태를 읽을 수 있어야 한다
- 운영 계정으로 학생 화면에 들어온 경우 명확한 wrong-role 안내가 있어야 한다
- student-facing 기능은 admin core를 깨지 않는 범위에서 확장돼야 한다

### Weekly Content Media
- 운영자는 `수업` 탭에서 클래스와 주차 맥락 안에 주차별 영상/이미지 콘텐츠를 다룰 수 있어야 한다
- 영상은 YouTube 기준으로 연결할 수 있어야 한다
- 현재 구현 baseline은 admin weekly YouTube URL 다건 저장/수정/삭제 + admin weekly image 다건 업로드/교체/삭제 + student inline video/image 다건 확인까지다
- 이미지는 업로드 기준으로 다룰 수 있어야 한다
- 현재 active image contract는 `spm-media` public bucket, `media.url` public URL, `upload_method=MANUAL`, fixed weekly image path convention이다
- 공개 / 수정 / 삭제는 주차 콘텐츠 관리의 기본 행동이어야 한다
- 학생은 `수업` 탭에서 클래스와 주차 맥락 안에서 주차별 영상/이미지를 볼 수 있어야 한다
- 학생은 선택한 주차 화면 안에서 영상을 바로 재생할 수 있어야 한다
- invalid media row가 있어도 유효한 media consume은 계속 가능해야 하고, 경고는 별도로 분리되어야 한다
- media는 별도 최상위 탭보다 `클래스 -> 주차 -> 콘텐츠` 흐름 안에서 먼저 이해돼야 한다
- local demo merged runtime QA에서는 admin weekly video save/delete, admin weekly image upload/replace/delete, student inline video/image read, image storage cleanup까지 다시 확인했다

## 기술 의도

이 문서는 DB나 구현의 기술 truth를 정의하지 않는다.
제품 동작은 아래를 전제로 한다.
- schema behavior follows `docs/db/SCHEMA.sql`
- RLS / permission behavior follows `docs/db/RLS.sql`
- attendance / payment mutation behavior follows `docs/db/RPC.sql`

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
