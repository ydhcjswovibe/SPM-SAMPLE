# 2026-03-18 Student Inline Topbar Controls Follow-Up

## Scope

- `/student`의 수업/월 선택을 `Student Lessons / SPM` 옆 inline control로 압축
- 선택 수업 상황판을 더 짧은 가로 칩 나열 구조로 단순화
- 상태 설명 문단을 제거하고 compact summary만 남기기

## Commands

- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass

## Source-backed Review

- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx)에서 상단 sticky bar의 브랜드 옆에 `수업 선택`, `월 선택`을 inline으로 붙였다.
- 선택 수업 상황판은 큰 블록형 설명 대신 `다음`, `결제`, `공개`, `피드백`, `출석`, `상태`를 가로 칩처럼 나열하는 compact summary로 줄였다.
- 이번 follow-up은 화면 밀도와 정보 배치 조정이며, 학생 수업 탭의 기본 contract 자체는 바꾸지 않았다.

Confidence: `source-backed`

## Not Attempted

- 모바일 브라우저에서 inline top bar control이 실제로 충분히 눌리기 쉬운지 수동 확인은 하지 않았다.
- safe area, sticky 상태, 스크롤 중 top bar 압박감은 브라우저 QA 패키지에서 별도 확인이 남아 있다.

## Remaining Risk

- source-backed로는 구조가 더 간결해졌지만, 좁은 모바일 폭에서 select 두 개가 답답하지 않은지는 직접 확인이 필요하다.
