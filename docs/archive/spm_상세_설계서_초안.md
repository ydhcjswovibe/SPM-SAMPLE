# SPM 상세 설계서 초안

> 보관 문서: 이 초안에서 정리된 현재 active 제품 truth는 `docs/SPEC.md`다.

## 1. 문서 목적

이 문서는 `SPEC.md`에 정의된 제품 의도와 범위를 기준으로, SPM(SocialPlusManager)의 실제 화면 구조, 사용자 흐름, 권한 동작, 상태 처리, 운영 행동, 실패 복구 기준을 더 구체화한 상세 설계 초안이다.

이 문서는 다음을 목표로 한다.

- 제품 범위를 실제 화면과 행동 단위로 해석한다.
- admin-first operations tool로서의 핵심 상호작용을 명확히 한다.
- mobile-first baseline 위에서 desktop 확장 기준을 정리한다.
- auth / role / failure / unauthorized 상황을 안전하게 다루는 UX 기준을 정의한다.
- 이후 구현, QA, SOP 문서 작성 시 기준점으로 사용할 수 있는 제품 레벨 truth를 제공한다.

이 문서는 DB schema, RLS, RPC의 canonical technical truth를 새로 정의하지 않는다. 기술 동작의 canonical truth는 기존 문서(`docs/db/SCHEMA.sql`, `docs/db/RLS.sql`, `docs/db/RPC.sql`)를 따른다.

---

## 2. 문서 범위

### 2.1 포함 범위

- Admin mobile/desktop 운영 표면
- Student mobile read surface baseline
- Admin Matrix 조회 및 행 단위 조작 흐름
- payment 상태 변경
- attendance 상태 변경
- CSV export
- student enrollment 배정 관리
- 주차별 YouTube / 이미지 콘텐츠 관리
- student의 주차 콘텐츠 소비 흐름
- auth / role / access fallback
- loading / empty / error / unauthorized 처리 기준

### 2.2 제외 범위

- 신규 DB truth 정의
- speculative abstraction을 위한 대규모 구조 개편
- clone enrollment / clone flow 재도입
- 근거 없는 대규모 student feature 확장
- 검증되지 않은 bulk operations의 광범위한 도입

---

## 3. 제품 구조 요약

SPM은 하나의 제품 안에 두 개의 서로 다른 표면을 가진다.

1. **Admin Surface**
   - 운영자가 실제 업무를 처리하는 운영 도구
   - 신뢰 가능성, 안전한 mutation, 명확한 권한 경계가 핵심

2. **Student Surface**
   - 학생이 자신의 수업, 콘텐츠, 상태를 읽는 소비형 표면
   - admin surface를 방해하지 않는 범위에서 실용적으로 제공

핵심 우선순위는 항상 admin surface에 있다.

---

## 4. 사용자 및 역할

### 4.1 역할

#### OWNER
- 전체 운영 기능 접근 가능
- payment / attendance 변경 가능
- enrollment 관리 가능
- media 생성/수정/삭제 가능
- export 가능
- delete와 같은 고위험 동작 최종 권한 보유

#### ADMIN
- 일반 운영 기능 접근 가능
- payment / attendance 변경 가능
- enrollment 관리 가능
- media 생성/수정/삭제 가능
- export 가능
- OWNER 전용 파괴적 동작은 제한 가능

#### STUDENT
- student surface만 접근 가능
- 자신의 수업/콘텐츠/기본 상태 읽기 가능
- admin surface mutation 불가

### 4.2 역할별 핵심 UX 원칙

- 올바른 역할은 올바른 surface로 빠르게 도달해야 한다.
- 잘못된 역할은 모호하게 보이지 않고 명시적으로 안내되어야 한다.
- unauthorized 상황은 단순 blank screen이 아니라 safe fallback으로 보여야 한다.
- role confusion은 조용한 실패보다 명시적 안내가 우선한다.

---

## 5. 정보 구조

## 5.1 Admin Mobile Information Architecture

하단 탭 baseline:
- `운영`
- `학생`
- `수업`
- `계정`

### 운영
운영 탭은 admin의 실질적 home이자 작업 허브 역할을 한다.

포함 기능:
- 오늘 요약
- 현재 범위 요약
- Admin Matrix 진입 및 조회
- 검색 / 필터
- payment 상태 변경
- attendance 상태 변경
- CSV export
- 학생 row 상세 진입

### 학생
학생별 검색, 상세 조회, enrollment 관련 조작, 상태 확인을 위한 탭이다.

포함 기능:
- 학생 검색
- 학생 리스트
- 학생 상세
- enrollment 상태 확인 및 관리
- 학생별 상태 맥락 확인

### 수업
`클래스 -> 주차 -> 콘텐츠` 흐름으로 주간 콘텐츠를 관리하는 탭이다.

포함 기능:
- 클래스 선택
- 주차 선택
- 주차별 YouTube media 관리
- 주차별 이미지 관리
- student-facing 콘텐츠 미리보기 성격의 확인

### 계정
인증과 계정 관련 보조 표면이다.

포함 기능:
- 현재 로그인 계정 정보
- role 인지
- logout
- 안전한 이동 또는 wrong-role recovery 안내

## 5.2 Student Mobile Information Architecture

하단 탭 baseline:
- `홈`
- `수업`
- `내상태`
- `내정보`

### 홈
- 이번 주 볼 것
- 새 콘텐츠
- 이어보기
- 공지성 정보

### 수업
- `클래스 -> 주차 -> 콘텐츠` 소비 흐름
- 같은 주차 안에서 영상/이미지를 함께 소비

### 내상태
- 출석
- 결제
- 진행 상태
- 피드백 등 상태형 정보 우선

### 내정보
- 계정/프로필/로그아웃 등 기본 정보

---

## 6. 핵심 개념 모델

이 문서는 DB truth를 다시 정의하지 않지만, 제품 동작을 이해하기 위한 운영 개념 모델은 다음과 같다.

### 6.1 Student Profile
- 시스템 안에서 학생으로 인식되는 기본 단위
- 기존 profile을 현재 class/month enrollment에 배정하는 구조를 baseline으로 한다
- 새 auth 계정 생성은 current baseline의 핵심이 아니다

### 6.2 Enrollment
- 특정 학생이 특정 운영 범위에 속하는 현재 참여 상태
- 상태값은 baseline상 `ACTIVE / PENDING / CANCELLED`
- `CANCELLED` enrollment는 ops 표에서 payment/attendance 토글이 비활성화되어야 한다

### 6.3 Weekly Content
- `클래스 -> 주차 -> 콘텐츠` 맥락 안에서 관리/소비되는 단위
- media는 주차 맥락을 벗어난 독립 최상위 navigation을 갖지 않는다

### 6.4 Media
- 주차 콘텐츠 아래 여러 건의 `VIDEO` / `IMAGE` row 허용
- 영상 baseline은 YouTube URL 연동
- 이미지 baseline은 별도 업로드
- admin은 write/delete 가능, student는 consume 가능

---

## 7. Admin 상세 동작 설계

## 7.1 운영 탭

### 목적
운영자가 가장 자주 수행하는 작업을 한곳에서 빠르게 처리하도록 한다.

### 핵심 구성
1. 오늘 요약
2. 현재 범위 요약
3. Matrix 요약 / 진입
4. 검색 / 필터
5. recent action 또는 상태성 피드백
6. export 액션

### 설계 원칙
- current state가 상단에서 먼저 보여야 한다.
- action은 상태 확인 이후 수행되도록 배치한다.
- high-risk mutation은 가벼운 accidental tap처럼 느껴지지 않아야 한다.
- 필터 변경이 현재 보고 있는 범위를 항상 분명하게 드러내야 한다.

## 7.2 Admin Matrix View

### 목적
운영자가 실제 업무에 필요한 matrix 데이터를 보고, 필요한 상태 변경을 안전하게 수행하는 핵심 운영 표면이다.

### 필수 표시 정보
- 학생 식별 정보
- class/enrollment 맥락
- attendance 관련 상태
- payment 관련 상태
- row 상세 진입 가능성
- 현재 필터 범위

### 필수 행동
- row 단위 payment 상태 변경
- row 단위 attendance 상태 변경
- 학생 row 상세 진입
- 현재 범위 CSV export

### 행(row) 단위 UX 원칙
- row는 조회 중심으로 스캔 가능해야 한다.
- 토글/버튼은 현재 상태와 변경 가능한 상태를 직관적으로 보여야 한다.
- mutation 직후 row가 success처럼 보이더라도 서버 반영 실패면 실패로 명확히 되돌아가야 한다.
- `CANCELLED` enrollment는 변경 불가 상태를 시각적으로 드러내야 한다.

### mobile에서의 해석
- matrix 자체는 dense table로 구현할 수 있지만, mobile에서는 스캔과 안전한 조작을 위해 카드형/압축형 row layout을 우선한다.
- 모든 열을 한 화면에 보여주려 하기보다, 핵심 상태를 우선 노출하고 나머지는 row 상세로 넘긴다.

### desktop에서의 해석
- 고정 열, 더 넓은 컬럼 노출, 빠른 비교가 허용된다.
- 단, mobile shell을 강제로 복제하지 않는다.

## 7.3 Search / Filter

### 목적
운영자가 현재 작업 범위를 좁히고 정확한 대상을 찾을 수 있게 한다.

### 공통 원칙
- 필터는 현재 범위를 바꾸는 고의적 행위로 인식되어야 한다.
- 필터 적용 후 현재 범위는 화면 상단에 다시 요약되어야 한다.
- 검색 결과가 비어 있을 때는 empty state를 명확히 제공해야 한다.

### 기대 동작
- 검색어 입력 시 관련 student row를 찾을 수 있어야 한다.
- 필터 조합이 유효하지 않아 결과가 0건일 경우, failure가 아니라 empty로 처리한다.
- unauthorized 또는 unavailable 데이터는 데이터 미노출 혹은 안전한 실패로 처리한다.

## 7.4 Payment Status Update

### 목적
운영자가 결제 상태를 안전하게 변경하도록 한다.

### UX 기준
- 현재 payment 상태가 변경 UI보다 먼저 보여야 한다.
- 변경 가능한 role이 아닌 경우, control은 비활성 또는 차단되어야 한다.
- mutation은 accidental tap으로 느껴지지 않아야 한다.
- 요청 중, 성공, 실패가 분리되어 보여야 한다.

### 상태 처리 기준
- 저장 중: 해당 row/action은 중복 요청을 막는다.
- 성공: 변경 후 상태가 명확히 반영된다.
- 실패: 기존 상태로 남거나 복귀하며 실패 메시지를 보여준다.
- unauthorized: 변경 시도 자체가 거부되고 이유를 이해 가능한 문구로 안내한다.

### 금지 사항
- silent success처럼 보이는 실패
- 서버 실패 후 낡은 optimistic state를 성공처럼 유지
- role이 불명확한 상태에서 조작 가능한 것처럼 보이기

## 7.5 Attendance Status Update

### 목적
운영자가 출석 상태를 안전하게 변경하도록 한다.

### UX 기준
- 현재 attendance 상태를 명확히 보여준다.
- 변경 동작은 payment와 마찬가지로 안전하고 분명해야 한다.
- RPC contract를 따르며, direct table mutation을 canonical처럼 취급하지 않는다.

### 상태 처리 기준
- 요청 중: action control lock
- 성공: row에 즉시 반영
- 실패: 이전 상태 유지 또는 복귀 + 에러 메시지
- unauthorized: 차단 + 이유 안내

## 7.6 Student Row Detail

### 목적
행(row)에서 다 보여주기 어려운 세부 운영 정보를 확인하고, 행 수준보다 더 문맥적인 작업을 수행하도록 한다.

### 포함 정보
- 기본 학생 식별 정보
- enrollment 상태
- 최근 payment / attendance 상태 요약
- 필요 시 운영 참고 정보

### 목적상 제한
- row detail은 matrix를 대체하는 새로운 home이 아니다.
- row detail은 admin이 상세 맥락을 확인하기 위한 보조 surface다.

## 7.7 CSV Export

### 목적
운영자가 현재 범위 기준의 데이터를 실제 업무에 사용할 수 있도록 내보낸다.

### 동작 기준
- export는 현재 필터/범위를 반영해야 한다.
- export 전 사용자에게 어떤 범위를 내보내는지 명확히 보여야 한다.
- invalid / unavailable / unauthorized 상태는 명확히 실패해야 한다.

### UX 기준
- export 시작 시 진행 중 상태를 인식 가능하게 한다.
- export 실패 시 “무엇이 안 됐는지”를 설명해야 한다.
- export가 완료되었는지 불완전한지 모호하게 두지 않는다.

---

## 8. Enrollment Management 상세 설계

### 목적
운영자가 `/admin`에서 기존 `STUDENT` profile을 현재 class/month enrollment에 배정하고 상태를 관리할 수 있도록 한다.

### 핵심 동작
- 기존 student profile 검색
- 현재 운영 범위에 배정
- enrollment status를 `ACTIVE / PENDING / CANCELLED` 수준에서 관리
- OWNER 전용 delete 제공

### 상태별 기대 동작
- `ACTIVE`: 일반 운영 표면에서 정상 처리 가능
- `PENDING`: 완전 운영 확정 전 상태로 해석 가능
- `CANCELLED`: ops 표에서 payment/attendance 토글 비활성화

### UX 원칙
- enrollment 상태는 숨겨진 내부값이 아니라 운영자가 해석 가능한 상태로 보여야 한다.
- `CANCELLED`는 “조작 불가 이유”가 명확해야 한다.
- delete는 일반 상태 토글과 시각적으로 구분되어야 한다.

---

## 9. Weekly Content Media 상세 설계

## 9.1 Admin 수업 탭 구조

### 목적
운영자가 주차 콘텐츠를 `클래스 -> 주차 -> 콘텐츠` 흐름 안에서 관리하도록 한다.

### 기본 흐름
1. 클래스 선택
2. 주차 선택
3. 해당 주차의 콘텐츠 목록 확인
4. YouTube / 이미지 추가, 수정, 삭제

### 금지 원칙
- 영상과 이미지를 product-level 최상위 navigation으로 분리하지 않는다.
- media type보다 class/week 맥락이 먼저 읽혀야 한다.

## 9.2 Weekly Video

### baseline
- YouTube URL 기반
- 주차별 다건 저장 허용
- admin save/update/delete 가능
- student는 선택한 주차 내에서 바로 consume 가능

### UX 원칙
- invalid media row가 있어도 전체 콘텐츠 소비를 막지 않는다.
- 개별 row 오류는 경고로 분리해 보여준다.
- student는 주차 상세 안에서 바로 재생 가능해야 한다.

## 9.3 Weekly Image

### baseline
- 별도 업로드 방식
- 주차별 다건 허용
- admin upload/replace/delete 가능
- student는 해당 주차 안에서 이미지 확인 가능

### 저장 관련 baseline
- public bucket / public object URL / admin-owner write contract
- fixed weekly image path convention 사용
- metadata는 현재 별도 truth로 잠그지 않음

### UX 원칙
- 업로드 진행 중 상태가 보여야 한다.
- replace/delete는 명확한 대상 이미지를 기준으로 작동해야 한다.
- storage cleanup이 필요한 삭제/교체는 운영자가 성공/실패를 이해 가능해야 한다.

## 9.4 Student Weekly Content Consumption

### 목적
student가 자신의 수업 탭 안에서 class/week 맥락에 따라 콘텐츠를 자연스럽게 소비하게 한다.

### 핵심 원칙
- step UI보다 자연스러운 class -> week -> content 흐름 우선
- 영상/이미지를 같은 주차 문맥 안에서 함께 보여줌
- student는 media type보다 “이번 주에 무엇을 보면 되는가”를 먼저 이해해야 함

---

## 10. Auth / Role / Access 상세 설계

## 10.1 Login

### 지원 방식
- email login
- configured 환경에서 Google login

### UX 원칙
- 로그인 방식 선택은 단순해야 한다.
- mobile browser / in-app browser에서 redirect confusion을 줄여야 한다.
- 로그인 이후 role에 맞는 목적 surface로 이동해야 한다.

## 10.2 Role-aware Access

### 기대 동작
- OWNER / ADMIN은 admin surface 접근 가능
- STUDENT는 student surface 접근 가능
- 잘못된 surface 접근 시 명시적인 안내 제공

### wrong-role 처리
- admin 계정이 student 화면으로 들어온 경우 wrong-role 안내 + 복구 동선 제공
- student 계정이 admin 화면으로 들어온 경우 safe block + student surface로 돌아갈 수 있는 동선 제공

### 금지 사항
- 권한 없음인데 빈 화면만 보이기
- 잠깐이라도 위험한 admin UI가 노출되기
- 사용자가 현재 role 상태를 추론해야만 하는 UX

## 10.3 Safe Fallback

다음 상황에서 보수적 fallback을 제공한다.
- 권한 미확정
- 세션 불안정
- mobile redirect confusion
- in-app browser 제약

fallback 메시지는 모호한 기술 문구보다, 사용자가 다음 행동을 이해할 수 있는 운영 문구를 우선한다.

---

## 11. 상태 설계

## 11.1 공통 상태 종류

모든 핵심 surface는 최소한 다음 상태를 명시적으로 구분한다.

- initial / loading
- success / loaded
- empty
- failure
- unauthorized
- partial degradation 가능 상태

## 11.2 Loading

- 단순 spinner만 두지 않는다.
- 어떤 데이터를 불러오는 중인지 맥락을 가능하면 제공한다.
- 지연이 길어지면 사용자가 문제가 있는지 인지할 수 있어야 한다.

## 11.3 Success

- mutation 성공은 toast 수준에만 의존하지 않고, 실제 row/state 반영으로 확인 가능해야 한다.

## 11.4 Failure

- 실패는 성공처럼 보이면 안 된다.
- failure는 action명과 연관된 문구로 제공하는 것이 바람직하다.
- 사용자가 재시도 가능한지 여부를 이해할 수 있어야 한다.

## 11.5 Unauthorized

- 단순 403 노출보다 역할/접근 제한 의미를 이해 가능한 문구로 안내한다.
- 조회는 가능하지만 수정 불가인지, 완전 접근 불가인지 구분한다.

## 11.6 Empty

- 결과 없음은 오류가 아니다.
- 검색/필터 결과 0건이면 current filter를 기준으로 설명한다.

---

## 12. 오류 및 복구 UX 기준

### 12.1 원칙
- 사용자는 무엇이 실패했는지 알아야 한다.
- 실패 후 다음 행동이 있어야 한다.
- 실패가 조용히 사라지면 안 된다.

### 12.2 mutation 실패
- action 단위로 실패를 표시한다.
- 기존 상태를 유지하거나 명시적으로 복귀시킨다.
- 재시도가 가능하면 재시도 동선을 제공한다.

### 12.3 page-level load 실패
- 전체 페이지 오류 안내
- 새로고침 또는 안전한 이전 이동 동선 제공

### 12.4 media 예외
- 일부 invalid media row가 있어도 전체 주차 콘텐츠 소비를 중단하지 않는다.
- 유효한 media는 계속 읽을 수 있어야 한다.
- 문제가 있는 media만 분리된 경고로 다룬다.

### 12.5 session / redirect confusion
- 재로그인 필요 여부를 분명히 한다.
- wrong-role인지 단순 세션 이슈인지 구분해야 한다.

---

## 13. Mobile / In-App Browser Handling

### 목적
실제 mobile browser와 in-app browser 환경에서 로그인, 리디렉션, 접근 혼란을 줄인다.

### 기준
- 보수적 안내를 사용한다.
- 리디렉션 실패 또는 불안정성이 의심되면 사용자가 직접 회복할 수 있는 안내를 제공한다.
- 가능하면 현재 사용자가 어느 surface로 가야 하는지 문구로 알려준다.

---

## 14. Desktop 확장 기준

SPM은 mobile-first지만, desktop에서 같은 shell을 강제로 유지하지 않는다.

### desktop 목표
- 더 넓은 정보량을 안전하게 보여준다.
- 비교, 스캔, 다중 row 확인이 쉬워야 한다.
- matrix 활용성을 높인다.

### desktop에서 허용되는 확장
- 고정 열
- 더 많은 컬럼 노출
- 넓은 검색/필터 영역
- 병렬 정보 배치

### desktop에서도 유지해야 하는 원칙
- current state 우선
- 명확한 mutation
- unauthorized / failure의 분명한 표시
- role confusion 최소화

---

## 15. 화면별 상세 명세

## 15.1 로그인 화면
- 목적: 사용자가 적절한 인증 흐름으로 진입
- 주요 사용자: OWNER / ADMIN / STUDENT
- 핵심 요소: email login, Google login(구성된 환경), 로그인 안내
- 실패 상태: 로그인 실패 메시지, 브라우저 제약 안내
- 성공 후: role-aware surface로 이동

## 15.2 Admin 운영 화면
- 목적: 운영 작업 허브
- 주요 요소: 오늘 요약, 현재 범위, matrix, 필터, export
- 핵심 액션: payment/attendance 변경, 상세 진입, export

## 15.3 Admin 학생 화면
- 목적: 학생 탐색 및 enrollment 중심 확인
- 주요 요소: 검색, 리스트, 학생 상세 진입

## 15.4 Admin 수업 화면
- 목적: weekly content 관리
- 주요 요소: 클래스 선택, 주차 선택, YouTube/image 리스트, write/delete action

## 15.5 Admin 계정 화면
- 목적: 현재 계정 확인 및 안전한 종료/복귀
- 주요 요소: role 표시, 계정 정보, logout

## 15.6 Student 홈 화면
- 목적: 이번 주 우선 소비 항목 제시
- 주요 요소: 이번 주 볼 것, 새 콘텐츠, 이어보기, 공지

## 15.7 Student 수업 화면
- 목적: class/week 기반 콘텐츠 소비
- 주요 요소: 클래스 선택, 주차 선택, inline video/image consume

## 15.8 Student 내상태 화면
- 목적: 기본 상태 가시성 제공
- 주요 요소: 출석, 결제, 진행 상태, 피드백

## 15.9 Student 내정보 화면
- 목적: 기본 계정/프로필 정보와 로그아웃

---

## 16. 비기능 요구 기준

### 신뢰성
- 핵심 mutation은 실무에서 믿고 사용할 수 있어야 한다.

### 명확성
- 성공/실패/권한 없음/지연 상태가 구분되어야 한다.

### 운영성
- export와 admin matrix는 실제 운영 작업에 유용해야 한다.

### 보수성
- 권한이 모호할 때는 더 안전한 방향으로 동작해야 한다.

### 문서 일치
- 문서와 구현 간 drift를 최소화해야 한다.

---

## 17. QA 관점의 설계 포인트

이 문서는 QA checklist는 아니지만, 상세 설계 관점에서 다음 포인트는 반복 검증 대상이다.

- OWNER / ADMIN / STUDENT별 route access 분기
- wrong-role 안내와 recovery
- matrix row 단위 payment/attendance mutation success/failure 반영
- `CANCELLED` enrollment에서 control 비활성화
- current filter 기반 export 정합성
- invalid media row 존재 시 유효 media 소비 지속 여부
- admin weekly video/image write/delete와 student inline read의 연결성
- mobile browser / in-app browser에서 login redirect confusion 완화

---

## 18. 현재 문서 기준에서 아직 열려 있는 결정 사항

현재 `SPEC.md`만으로는 아래는 완전히 잠기지 않았다. 구현 전에 별도 명시가 필요하다.

1. Student `내상태`에서 결제/출석/진행 상태를 어느 수준까지 노출할지
2. enrollment 상세 편집 범위와 UI 레벨 action 분리 방식
3. payment / attendance 상태값의 구체적 enum과 전이 규칙
4. media 공개 상태를 row 단위로 둘지, 주차 단위로 둘지에 대한 제품 레벨 해석
5. export 컬럼의 최종 고정안
6. row detail과 student detail surface의 구체적 정보 밀도
7. desktop matrix에서 허용할 추가 비교/고정 컬럼 범위

---

## 19. 권장 다음 단계

이 초안 다음에는 아래 문서를 분리해 붙이는 것이 좋다.

1. **화면 명세서**
   - 화면별 컴포넌트, 버튼, 상태, empty/failure 문구

2. **권한 매트릭스**
   - 역할별 page access / view / mutate / delete / export 가능 여부 표

3. **상태 전이표**
   - payment / attendance / enrollment 상태값과 허용 전이

4. **운영 SOP**
   - 수업 전 / 수업 중 / 수업 후 운영 절차
   - wrong-role / 실패 / media 오류 대응 절차

5. **QA 시나리오 문서**
   - 문서의 intended behavior를 실제 검증 항목으로 변환

---

## 20. 요약

SPM의 상세 설계에서 가장 중요한 것은 기능 추가가 아니라 다음 네 가지다.

1. admin operator가 현재 상태를 먼저 이해할 수 있어야 한다.
2. payment / attendance mutation은 안전하고 분명해야 한다.
3. auth / role / access 실패는 위험하게 열리지 않고 명시적으로 닫혀야 한다.
4. weekly content는 `클래스 -> 주차 -> 콘텐츠` 흐름을 깨지 않는 범위에서 관리/소비되어야 한다.

이 문서는 현재 `SPEC.md`를 기반으로 상세 설계 방향을 구체화한 1차 초안이며, 이후 상태 enum, 권한표, 화면별 세부 명세가 붙으면 실무용 상세 설계서로 확정할 수 있다.
