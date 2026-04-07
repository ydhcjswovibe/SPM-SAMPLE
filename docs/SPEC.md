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
- 특정 외부 앱(Finch 포함)과의 시각적 유사도 자체는 목표나 acceptance 기준으로 두지 않는다.

### 핵심 UX 원칙

- current state가 action보다 먼저 보여야 한다
- action label은 직접적이고 해석이 필요 없게 간다
- loading / success / failure / unauthorized 상태를 명확히 구분한다
- payment / attendance 변경은 accidental하게 느껴지면 안 된다
- mobile에서도 scannability와 state visibility를 우선한다
- media 종류보다 `클래스 -> 주차 -> 콘텐츠` 흐름이 먼저 읽혀야 한다
- 메인 표면은 불필요한 여백 때문에 핵심 상태나 action이 화면 아래로 밀리지 않도록 compact density와 정렬 일관성을 유지한다
- primary surface의 실제 배경 fill은 `opaque color` 또는 `alpha 없는 gradient`만 허용한다
- `transparent`, `bg-white/95` 같은 alpha fill, `rgba(..., <1)` gradient, `backdrop-blur` 의존 배경은 장식용 ambient layer에만 쓰고 실제 조작 surface에는 쓰지 않는다
- 헤더 selector/menu, 하단 탭/item, 요약/진척 카드, 주차 rail/button, dialog frame, reply composer, admin row action 같은 primary surface는 ghost/transparent baseline으로 두지 않는다

### 현재 mobile surface baseline

이 baseline은 현재 active scope에서 유지하기로 한 구조다.
광범위한 redesign 없이 이 baseline 위에서 작은 slice를 이어간다.

#### Admin

- 하단 탭 구조:
  - `운영`
  - `학생`
  - `수업`
- 운영 core header는 mobile/tablet에서는 student shell과 같은 브랜드 언어의 floating topbar를 사용하되, 현재 섹션 / 선택 수업 / 월 / 유틸리티를 한눈에 읽을 수 있어야 한다
- 운영 desktop topbar는 `작은 operator toolbar`를 유지하고, 항상 보이는 primary control은 `수업 선택 + 월 선택`으로 제한한다
- 운영 desktop에서는 student형 floating hero header를 재사용하지 않고, sidebar와 분리된 본문 툴바 기준으로 `selector/control + utility`만 남긴다
- 운영 mobile 하단 탭은 compact shell에서 icon-first로 낮출 수 있지만, active state와 접근성 label만으로 현재 위치를 바로 식별할 수 있어야 한다
- 운영 mobile 하단 탭은 inactive 상태에서도 투명해 보이지 않도록 기본 pill 배경과 경계를 유지해야 한다
- 운영 mobile의 header control, menu, bottom tab, week rail, row action은 shared opaque surface token 위에서만 움직여야 한다
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
  - `홈`
  - `수업`
  - `내상태`
- 현재 compact student shell에서는 하단 탭 라벨을 숨기고 icon-only로 낮게 유지할 수 있다
- `홈` 탭은 student dashboard 역할을 맡고, 현재 선택 또는 대표 수업의 `캐릭터 hero + 진행 카드 + 오늘의 체크리스트 + 빠른 action` 흐름을 사용한다
- `수업` 탭은 기존 최상단 헤더 바의 수업/월 선택 control과 선택된 월별 수업 상세를 보여 주며, `클래스 -> 주차 -> 콘텐츠` 소비에 집중한다
- 프로필/로그아웃은 하단 탭이 아니라 헤더 유틸리티 메뉴 또는 보조 화면으로 둔다
- `홈` 탭은 요약과 빠른 action만 두고, 주차 상세나 긴 콘텐츠 목록을 함께 쌓아 스크롤을 과도하게 늘리지 않는다
- `수업` 탭은 step UI보다 자연스러운 `클래스 -> 주차 -> 콘텐츠` 소비 흐름을 우선한다
- 영상/이미지는 최상위 분리 탭이 아니라 주차 콘텐츠 안에서 함께 본다
- `내상태`는 출석 / 결제 / 진행 상태 / 피드백처럼 status-heavy 정보를 우선한다
- `내상태`는 profile card처럼 보이는 상단 요약과 설정 카드로 구성할 수 있지만, 수정 가능한 truth는 여전히 계정 이름과 테마 선택에 한정한다
- 학생 표면에는 출석률 / 진행률 / 참여 흐름을 부드럽게 재해석한 `light gamification` 레이어를 둘 수 있지만, 본래 상태 정보의 판독성을 가리면 안 된다
- 학생 hero의 공기감과 ambient glow는 허용하지만, 실제 카드 / 버튼 / 요약 surface의 배경 fill은 `opaque color` 또는 `alpha 없는 gradient`로만 유지한다
- 학생 header selector/menu, 하단 탭, 홈 hero/progress/summary, 수업 주차 rail/button, reply composer, profile 요약/설정 카드는 같은 opaque surface contract를 공유한다
- 학생용 시각 톤은 `소프트 파스텔 + 절제된 귀여움`을 기본으로 하고, 주 사용 대상이 `20대~40대`인 점을 고려해 유아용처럼 과장된 캐릭터/색감은 피한다
- 학생 현재 표면은 visual baseline으로 고정하고, 운영 표면은 shared primitive를 다시 흔들지 말고 학생 baseline의 surface/icon language를 운영 전용 layer로 따라간다

### 탭 셸 기준

- 탭은 가로 선택 바로 보이고, 항상 고정된다
- 화면 본문은 탭 위 영역 안에서만 보이거나 스크롤된다
- 전체 페이지 스크롤보다 shell 내부 스크롤을 우선한다
- desktop은 mobile shell을 그대로 강제하지 않고 별도 레이아웃을 허용한다
- 운영 desktop core는 `md+`에서 좌상단 brand block, 그 아래 고정 left sidebar rail, 우측 본문 workspace를 분리하고, 좌측 rail은 navigation-only로 유지한다
- 운영 shell breakpoint는 `md+`부터 desktop으로 간주하고, 이 구간에서는 bottom tab 대신 left sidebar navigation을 사용한다
- 운영 desktop의 `설정 / 처음으로 / 로그아웃` utility는 sidebar가 아니라 본문 toolbar 오른쪽 작은 버튼 묶음으로 둔다
- 운영 desktop control/button은 본문 폭을 채우기 위해 늘어나지 않고, compact fixed width와 truncate를 우선한다
- 운영 desktop shell은 bottom tab 대신 `좌상단 brand block + 우측 top toolbar + 그 아래 fixed left sidebar rail + constrained content workspace`를 기준으로 하고, 본문은 rail 바깥의 workspace 안에서 시작해야 한다
- 운영 desktop toolbar와 좌상단 brand block은 같은 shell language로 읽혀야 하며, sidebar는 brand block 아래에서 시작해야 한다
- 운영 desktop core 페이지는 mobile 단일열을 그대로 늘리지 않되, 좌측 summary rail을 추가하지 않고 `single main workspace + 본문 상단 compact toolbar` 기준으로 정리하며, 본문 lane은 wide full-bleed 대신 한 단계 더 좁힌 inner width를 유지한다
- 운영 shell은 `md~lg`에서 먼저 desktop IA로 전환하되, dense table처럼 가로 폭을 많이 쓰는 데이터 표면은 필요 시 `lg+`에서만 확장할 수 있다
- 운영 mobile 상단바는 `캐릭터 / 수업 selector / YY년 M월 selector / 단일 메뉴` 순서를 유지한다
- 운영 mobile 월 selector는 세로 목록 dropdown이 아니라 `연도 헤더 + 12개월 grid` month popover를 사용한다
- 운영 mobile 단일 메뉴 안에는 현재 탭 action을 먼저 두고, 구분선 아래에 `설정 / 처음으로 / 로그아웃` utility를 함께 둔다
- 운영 mobile matrix/card 안의 주차 상태 변경은 텍스트 칩보다 원형 icon trigger를 우선한다
- 운영 mobile의 `수업 selector / 월 selector / 메뉴 / 하단탭`은 pressed/open 상태에서도 투명해지지 않는 불투명 surface를 유지한다

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
- 오너는 운영 메인 class selector에서 삭제 모드를 켜고 수업을 삭제할 수 있다
- 활성 수업을 삭제하면 soft delete(`is_active=false`)로 활성 목록에서만 빠지고, 이미 비활성 수업을 삭제하면 연결된 등록/기록 정리 후 완전 삭제된다
- 오너의 운영 메인 헤더에는 `삭제 모드` trigger가 별도로 보여야 하고, delete mode 안에서는 삭제 대상 수업을 명시적으로 다시 고른다

### Auth / Role / Access
- Google-only login
- 사용자-facing 로그인 entry route는 `/` 하나를 사용하고, 로그인 화면은 화면 중앙 rail의 단일 카드와 작은 `Social Plus` 브랜드 라벨만 사용한다
- legacy 로그인 경로인 `/auth/login`은 compatibility alias로만 유지하고 `/`로 redirect할 수 있다
- 로그인 화면은 self-serve 이메일 회원가입이나 이메일/비밀번호 form을 노출하지 않는다
- configured 환경에서의 Google login
- configured 환경에서 Google login은 Google Identity Services 기반 ID token sign-in을 우선 사용하고, 사용자-facing 기본 UX에서 Supabase-hosted OAuth redirect hop을 전면에 두지 않는다
- Google client 설정이 없거나 GIS 표면 로드에 실패한 환경에서는 로그인 화면이 다른 auth method로 우회하지 않고, 로그인 unavailable 안내만 명시적으로 보여 준다
- role-based access behavior
- role-aware page access
- 익명 사용자가 `/admin`, `/student`에 직접 들어오면 별도 gate 대신 `/` 로그인 entry로 이동한다
- 로그인된 사용자가 자기 권한과 다른 route에 들어오면 wrong-role gate 대신 자기 권한의 기본 화면으로 이동한다
- access가 제한되거나 불명확할 때의 safe fallback behavior

### Account / Settings Routes
- `/admin/settings`는 secondary route다
- `/student/profile`은 모바일 baseline에서 primary `내상태` 탭의 route destination이며, direct link entry도 허용한다
- 현재 baseline은 로그인 계정 확인, 이름 수정, 테마 선택이다
- 이메일은 읽기 전용으로만 보여 준다
- 계정 정보를 불러오지 못하면 local demo 데이터를 대신 보여주지 않고 명시적 오류/재시도로 처리한다
- `/student/profile`은 전체 상태 요약과 계정 관리에 집중하고, 학생 primary tab 바깥에서 수업 선택/신청 action을 다시 늘리지 않는다
- 학생 수업 신청 quick action은 `홈` 탭에, 수업 선택과 콘텐츠 소비는 `수업` 탭에 둔다

### Student Surface
- 학생용 기본 화면
- 학생이 읽을 수 있는 기본 상태 가시성
- 운영 계정으로 잘못 진입했을 때의 wrong-role 안내와 recovery
- mobile tab baseline(`홈 / 수업 / 내상태`) 위의 학생 read flow
- 학생 primary tab route contract는 다음을 사용한다:
  - `홈` -> `/student`
  - `수업` -> `/student/lessons`
  - `내상태` -> `/student/profile`
- 학생 수업 목록은 `class + year_month` 단위로 구성한다
- 학생은 `ACTIVE`와 `PENDING` 월을 본다
- 학생 primary selection key는 `classId + yearMonth`를 사용하고, `홈`과 `수업` 탭이 같은 selection을 공유한다
- 유효한 query selection이 있으면 그 값을 우선하고, 없으면 visible enrollment 안에서 `현재 월 우선 -> 대표 수업 fallback` 규칙으로 고른다
- 학생 헤더 selector는 해당 학생의 `ACTIVE`/`PENDING` 등록만 보여 주고, soft delete된 inactive 수업은 숨긴다
- 학생 상단 헤더는 전 탭에서 mobile 기준 한 줄 compact bar를 사용하고, `캐릭터 / 수업 selector / YY.MM 월 selector / 메뉴` 순서를 유지한다
- 학생 상단 헤더는 배경과 섞이지 않도록 별도 받침 plate와 떠 있는 본체 바의 2층 인상으로 분리할 수 있다
- 학생 `홈` 탭은 현재 선택 또는 대표 수업 기준 요약, 진행도, 체크리스트, 빠른 action을 먼저 보여 주고, 긴 주차 상세는 이 탭에 함께 쌓지 않는다
- 학생 `수업` 탭은 상단 1줄 헤더 아래에 `출석 / 공개 / 피드백` 요약 카드만 남기고, 바로 `콘텐츠` 영역으로 이어진다
- 학생 `수업` 탭의 기본 주차는 현재 날짜 기준 `월의 n주차`를 사용하고, 유효 범위를 벗어나면 현재 보이는 주차 안에서 clamp한다
- 학생은 수업이 없거나 추가 요청이 필요할 때 `홈` 탭의 `수업 신청` quick action 다이얼로그에서 활성 수업과 월을 고르고 승인 요청을 보낼 수 있다
- 학생 수업 신청은 새 계정 생성이 아니라 자기 `enrollments`를 `PENDING`으로 생성하거나, 취소된 같은 달 요청을 `PENDING`으로 다시 여는 흐름이다
- 학생 `홈` 탭의 `주차 열기`, `콘텐츠 보기`, `피드백 보기` 같은 CTA는 page-internal scroll 대신 `수업` 탭으로 이동하고 현재 selection을 유지한다
- 학생 `홈` 탭에 둔 `수업 신청` quick action은 `수업` 탭과 `내상태`에서 중복 노출하지 않는다
- 학생 `홈` 탭의 요약 카드와 quick action은 핵심 상태만 직접 보여 주고, 같은 의미를 범례/상태칩/보조 helper로 반복 설명하지 않는다
- 학생 `수업` 탭은 상단 상태 chip을 반복하지 않고, 승인 전/승인 후의 빈 상태 문구만 서로 다르게 읽히면 된다
- 학생 empty ownership은 다음처럼 나눈다:
  - `홈`: 수업 없음 / 신청 필요 / 승인 대기 / 대표 수업 요약
  - `수업`: 선택 필요 / 주차 없음 / 콘텐츠 없음 / 상세 refetch
  - `내상태`: 계정/상태 read와 저장 결과
- 학생 `홈`과 `내상태`의 핵심 요약 카드는 가능한 한 낮은 높이로 유지하고, 같은 row 안 control 폭이 들쭉날쭉 흔들리지 않게 정렬한다
- `PENDING` 월은 `등록 예정` 또는 이에 준하는 상태 라벨로 명확히 구분한다
- `CANCELLED` 월은 학생 수업 목록에 노출하지 않는다
- legacy deep link인 `/student/class/[classId]`는 `yearMonth`와 함께 `수업` route contract로 정규화해 redirect할 수 있어야 한다
- admin core보다 우선순위는 낮지만 active scope 안에 있음

### Mobile Tab Prototype Baseline
- `/admin`은 `운영 / 학생 / 수업` mobile tab baseline을 가진다
- `/student`는 `홈 / 수업 / 내상태` mobile tab baseline을 가진다
- `홈` 탭은 student dashboard, `수업` 탭은 콘텐츠 소비, `내상태`는 상태/계정 관리 역할로 나눈다
- 학생 하단 탭은 현재 active compact pass에서 icon-only navigation으로 낮게 유지한다
- student home 성격의 요약과 체크리스트는 `홈` 탭에 두고, 선택된 수업의 주차 상세는 `수업` 탭으로 분리한다
- `홈 -> 수업` 이동은 현재 selection을 유지하고, `수업` 탭에서 다시 같은 class/month를 바로 연다
- account utility와 logout은 primary tab이 아니라 header utility로 두고, profile/status는 `내상태` tab destination으로 둔다
- 이 구조는 현재 active scope에서 `keep`으로 잠긴 baseline이며, 다음 slice는 이 위에서 좁게 열린다

### Weekly Content Media Baseline
- 주차 콘텐츠는 `클래스 -> 주차 -> 콘텐츠` 맥락 안에서 다룬다
- 영상과 이미지는 최상위 navigation을 따로 갖지 않는다
- admin은 `수업` 탭 안에서 주차별 콘텐츠를 관리한다
- admin `수업` 탭의 헤더 control은 현재 월을 기본으로 유지하되, 관리할 수업을 먼저 고르고 필요할 때만 월을 바꾸는 흐름을 baseline으로 둔다
- admin `수업` 탭의 기본 주차도 현재 날짜 기준 `월의 n주차`를 사용하고, `학생 관리` deep link는 `class + month + week + student` 맥락을 그대로 복원한다
- admin 주차 영상 편집은 여러 영상을 세로로 모두 펼치기보다, 현재 선택된 영상 1개 preview와 가로 선택 strip을 중심으로 다룬다
- admin 선택 영상은 전체화면 진입 버튼을 통해 가능하면 landscape fullscreen으로 볼 수 있어야 하고, 종료 후 같은 편집 맥락으로 자연스럽게 돌아와야 한다
- admin 주차 이미지 목록도 한 줄 가로 스크롤로 훑고, 필요 시 확대해 확인할 수 있어야 한다
- admin은 `/admin/content`를 `media-only` 편집 surface로 두고, 출석과 피드백 관리는 `/admin` 운영판에서 다룬다
- `/admin/students`는 notes editor를 복제하지 않고 `/admin` 해당 학생/주차 sheet로 이동하는 바로가기만 둔다
- student는 `수업` 탭 안에서 주차별 콘텐츠를 소비한다
- student는 선택한 주차 화면 안에서 영상을 바로 재생할 수 있는 방향을 baseline으로 둔다
- student `수업` 탭의 주차 버튼은 기본 `1~4주차`를 항상 보여 주고, `5주차`는 ready video/image가 있을 때만 추가로 노출한다
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
- student `수업` 탭 본문은 주차 제목/상태 badge/helper를 반복하지 않고, `영상`과 `이미지`를 먼저 소비한 뒤 해당 주차의 `개별 피드백`만 조용히 이어서 읽는 구조를 우선한다

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
- 학생 표면의 공개 리더보드, 경쟁 순위, 과한 daily pressure copy, 현금성 보상/게임머니 economy

## 제거 / 비활성 범위

### Clone Enrollment / Clone Flow
- clone 관련 UI / flow는 현재 active scope 밖이다
- 비공식적으로 되살리지 않는다
- 다시 넣을 때는 planning 문서와 scope 문서를 함께 갱신한다

## 기능 요구사항

### Admin Matrix View
- 인가된 admin 사용자는 matrix 데이터를 불러올 수 있어야 한다
- 관련 class / enrollment / attendance / payment 정보가 보여야 한다
- 실제 출석 기준은 `주차 class_log`가 아니라 `실제 수업 날짜(session)`여야 하며, 하나의 주차 안에 여러 날짜가 들어갈 수 있어야 한다
- `/admin` 출석부는 mobile/desktop 모두 `학생별 x 주차별(기본 1~4주, 필요 시 5주)`를 한눈에 보는 운영판이어야 한다
- `/admin` 운영판은 별도 모드 전환 없이 `단일 출석부`로 유지하고, 학생-주차 셀에는 `원터치 출석 버튼 1개 + 옆 작은 메모 칩 1개`만 둔다
- mobile 출석부는 fluffy card stack이 아니라 `이름 + 결제 + 1~4주 컨트롤`이 바로 읽히는 조밀한 리스트여야 한다
- 출석부 상단 chrome은 `출석부` 제목과 우상단 icon action(`CSV`, `필터`)만 남기고, helper text / wide export button / fallback 안내 박스를 고정 노출하지 않는다
- 원터치 출석은 해당 학생-주차의 실제 수업 날짜 전체를 한 번에 `출석 / 결석`으로 맞추는 주차 토글로 동작한다
- admin 운영판에서는 `미처리`를 별도 상태로 두지 않고, 체크되지 않은 값은 `결석`으로 간주한다
- 학생 메모는 학생-주차 토글 옆의 작은 `메모` 칩으로 열고, 이 시트에서는 `학생 메모 + 학생 답글(read-only)`만 다룬다
- 출석 토글 색은 `출석=green`, `지난 실제 수업 주차 결석=red`, `현재/미래 미체크=neutral`로 즉시 구분돼야 한다
- 주차 전체 작업은 `1주 / 2주 / 3주 / 4주` 얇은 헤더 옆의 작은 icon-only button으로 연다
- 주차 헤더에는 날짜를 상시 노출하지 않고, desktop에서는 hover tooltip으로만 `날짜 + 요일`을 보여 주며 mobile에서는 opened sheet 안에서만 보여 준다
- 주차별 운영 메모는 별도 큰 카드나 텍스트 버튼 없이 icon entry로만 진입해야 한다
- 출석부의 카드/셀/버튼/sheet trigger는 pressed/open 상태에서도 투명하게 흐려지면 안 된다
- 비정상 enrollment status(`보류`, `취소`)만 예외적으로 학생 이름 옆의 작은 보조 라벨로 노출하고, 기본 row는 `이름 + 결제` 리듬을 우선한다
- 출석부 우상단 필터 메뉴에는 `답글 도착만` 같은 최소 필터만 남기고, 항상 보이는 chip strip는 두지 않는다
- 실제 session이 없는 legacy 월은 같은 출석부 surface 안에서 주차 fallback으로 읽을 수 있어야 하고, main surface에 별도 fallback 설명 박스를 고정 노출하지 않는다
- unavailable 또는 unauthorized 데이터는 안전하게 실패해야 한다
- 검색/필터 결과가 0건이면 failure가 아니라 empty로 해석해야 한다
- row detail은 보조 상세 surface이며 matrix나 학생 탭을 대체하지 않는다

### Class Schedule / Actual Session Dates
- 수업 생성 시에는 이름만이 아니라 기본 반복 일정(`요일 + 시작/종료 시간`)을 함께 정의해야 한다
- owner의 새 수업 만들기 입력은 기존 수업명 preset suggestion을 먼저 보여 줄 수 있어야 하지만, 기존 이름만 강제하지 않고 직접 입력도 계속 허용해야 한다
- owner/admin의 일정 시간 입력은 `00`/`30` 분 단위의 쉬운 선택 UI를 사용하고, browser native time input에만 의존하지 않는다
- 시작 시간을 고를 때 종료 시간이 비어 있으면 같은 행의 종료 시간은 기본 `+2시간`으로 먼저 채워져야 한다
- 한 수업은 주 2회 이상 반복을 가질 수 있어야 한다
- 운영자는 월별 실제 수업 날짜를 따로 조정할 수 있어야 하며, 이 월별 세션 목록이 출석 truth가 된다
- base repeating rule은 owner가 관리하고, 월별 실제 날짜 조정은 admin/owner가 관리할 수 있어야 한다
- 새 수업 생성과 월별 일정 관리는 connected Supabase의 `class_schedule_rules`, `class_sessions`, `session_attendance`를 실제 storage truth로 사용해야 한다
- week selection은 단순 `오늘 날짜 ÷ 7`이 아니라 실제 session이 속한 주차를 기준으로 잡아야 한다

### Student Enrollment Management
- 운영자는 `/admin`에서 기존 `STUDENT` profile을 현재 class/month enrollment로 배정할 수 있어야 한다
- 현재 구현 baseline은 새 auth 계정 생성이 아니라 기존 profile 배정 + student self-request + enrollment status(`ACTIVE / PENDING / CANCELLED`) 조정 + `OWNER` 전용 실제 delete다
- 학생 self-request가 들어오면 같은 `PENDING` enrollment로 운영 표면에 나타나고, 운영자는 상태를 `ACTIVE`로 바꿔 승인한다
- `CANCELLED` enrollment는 ops 표에서 결제/출석 토글이 비활성화되어야 한다
- 학생 배정 표면은 `현재 월 기본 선택 + 수업 먼저 선택 + 필요 시 월 변경` 순서를 따르고, 선택 가능한 수업 목록은 활성 수업 전체를 보여 주되 해당 월 등록 기준 수업을 먼저 노출한다
- 학생 배정 표면 첫 진입 시에는 해당 월 수업 목록의 첫 항목을 기본 선택으로 사용하고, 목록 재검증 중에도 그 기본 선택이 불안정하게 비지 않아야 하며 월 변경 시에도 선택한 수업이 계속 활성 상태면 유지한다
- 학생 배정 표면의 수업 헤더 아래에는 긴 설명 대신 학생 수, 수강 상태, 결제 상태 같은 현재 월 요약만 간결하게 보여 준다
- 학생 배정 목록은 mobile에서 가능한 한 한 줄에 가깝게 읽히도록 압축하고, row 왼쪽에는 이름만 남기며 결제 여부와 등록 상태는 오른쪽 action control에서 수정/확인하게 한다
- 학생 배정 목록의 오른쪽 action control은 row마다 시작점이 크게 흔들리지 않도록 고정폭에 가깝게 정렬한다
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
- attendance status는 `pending / present / absent / excused`를 실제 저장값으로 써야 한다
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
- 학생 표면의 게이미피케이션은 `현재 상태 -> 다음 행동 -> 작은 성취감` 순서로 읽혀야 하며, 수업 정보보다 앞서 사용자를 혼란스럽게 만들면 안 된다
- 학생은 출석률, 출석 streak, 공개된 콘텐츠 소비 같은 현재 앱에서 이미 읽을 수 있는 신호를 바탕으로 `경험치`, `레벨`, `다음 보상까지 진행률`을 이해할 수 있어야 한다
- 학생 홈의 진척 카드는 큰 캐릭터 성장 카드로 읽히되, 좌상단 `Lv.` 배지와 하단 `EXP` 바가 한 세트로 붙어 보여야 한다
- 현재 학생 홈의 `레벨/XP`는 기존 출석/공개/피드백 신호를 재해석한 light-gamification preview로 시작할 수 있고, 별도 저장 규칙이나 운영 로직은 추후에 확정한다
- 보상은 작은 디지털 보상에 한정한다:
  - 캐릭터 표정/소품 해금
  - 축하 카드/배지
  - 테마 변주 같은 비금전성 보상
- 캐릭터 성장은 학생 메인과 내상태에서 같은 세계관으로 읽혀야 하고, admin core flow와 기술 계약을 새로 요구하지 않는 선에서 시작한다

### Weekly Content Media
- 운영자는 `수업` 탭에서 클래스와 주차 맥락 안에 주차별 영상/이미지 콘텐츠를 다룰 수 있어야 한다
- 주차 콘텐츠는 계속 `주차 단위`로 유지하되, 주차 상단에는 그 주의 실제 수업 날짜 range가 함께 보여야 한다
- 영상은 YouTube 기준으로 연결할 수 있어야 한다
- 현재 구현 baseline은 admin weekly YouTube URL 다건 저장/수정/삭제 + admin weekly image 다건 업로드/교체/삭제 + admin 출석부 attendance/feedback save + student inline video/image/feedback 확인까지다
- admin은 여러 저장 영상을 가로 선택 strip에서 고르고, 현재 선택된 영상 1개를 기준으로 preview/edit/delete 할 수 있어야 한다
- admin 이미지 목록은 가로 스크롤로 훑고, click/tap 확대와 교체/삭제 action을 함께 사용할 수 있어야 한다
- 이미지는 업로드 기준으로 다룰 수 있어야 한다
- 현재 active image contract는 `spm-media` public bucket, `media.url` public URL, `upload_method=MANUAL`, fixed weekly image path convention이다
- 공개 / 수정 / 삭제는 주차 콘텐츠 관리의 기본 행동이어야 한다
- 학생은 `수업` 탭에서 클래스와 주차 맥락 안에서 주차별 영상/이미지를 볼 수 있어야 한다
- 학생은 선택한 주차에서 실제 수업 날짜 chip을 함께 보고, 같은 주 안의 여러 수업 날짜를 한 번에 이해할 수 있어야 한다
- 학생은 선택한 주차 화면 안에서 영상을 바로 재생할 수 있어야 한다
- 학생 주차 영상은 현재 선택된 1개 플레이어를 기준으로 보고, 여러 영상은 같은 줄의 좌우 이동 control로 바꿔 볼 수 있어야 한다
- 학생 선택 영상도 전체화면 버튼으로 가능하면 landscape fullscreen에 들어갈 수 있어야 하고, 종료 후 같은 주차 선택 상태로 자연스럽게 돌아와야 한다
- 학생 주차 이미지는 한 줄 가로 스크롤로 훑을 수 있어야 한다
- 학생 주차 이미지 카드는 tap/click으로 확대해 자세히 볼 수 있어야 한다
- 학생 `수업` 탭에서는 선택한 주차 안에서 자기 `개별 피드백`만 읽을 수 있어야 하고, 주차별 수업 피드백이나 운영 내부메모는 노출하지 않는다
- 학생은 피드백이 있는 주차에 한해 `주차당 1개 editable reply slot`으로 짧은 답글을 남길 수 있어야 한다
- 학생 답글은 thread가 아니라 단일 text slot이며, 운영은 `/admin` 출석부 학생-주차 sheet에서 read-only로 본다
- invalid media row가 있어도 유효한 media consume은 계속 가능해야 하고, student lessons 본문은 ready media 우선으로 유지한다
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

- `주차별 운영 메모`
  - 특정 class/month/week에 대한 내부 운영 정리다
  - `ADMIN + OWNER`만 읽고 수정한다
  - student surface에는 노출하지 않는다
- `학생별 피드백`
  - 특정 학생에게만 보여주는 개인 피드백이다
  - 대상 학생 본인과 `ADMIN + OWNER`만 읽을 수 있다
- `학생 답글`
  - 특정 학생이 특정 class/month/week에 대해 남기는 1개 응답 슬롯이다
  - admin/owner와 대상 학생 본인만 읽을 수 있다
  - 메신저형 thread나 다자 공개 댓글로 확장하지 않는다
- legacy `progress / reflection / member_admin_notes`
  - 현재 active UI에서는 쓰지 않는 hidden data로 간주한다
  - schema에 남아 있어도 제품 truth로 다시 해석하지 않는다

## 기술 의도

이 문서는 DB나 구현의 기술 truth를 정의하지 않는다.
제품 동작은 아래를 전제로 한다.
- schema behavior follows `docs/db/SCHEMA.sql`
- RLS / permission behavior follows `docs/db/RLS.sql`
- attendance / payment / weekly notes mutation behavior follows `docs/db/RPC.sql`
- payment / attendance / weekly notes mutation의 canonical truth는 `docs/db/RPC.sql`이며, route wrapper는 허용하지만 direct table update는 canonical이 아니다.
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
