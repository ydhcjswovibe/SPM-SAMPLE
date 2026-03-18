# 2026-03-18 Student Header Bar Controls Follow-Up

## Scope

- `/student`의 수업 선택, 월 선택을 페이지 내부 sticky bar에서 기존 최상단 헤더 바로 이동
- 학생 상황판에서 `수강중 / 2026.03 / 클래스명` 묶음을 제거하고, 더 짧은 compact summary만 유지
- 학생 헤더와 메인 화면이 같은 선택 상태를 공유하도록 정리

## Commands

- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass

## Source-backed Review

- [components/student-nav.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-nav.tsx)에서 `/student`일 때만 기존 최상단 헤더 바 안에 `수업 선택`, `월 선택` control이 나타나도록 옮겼다.
- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx)는 상단 선택 섹션을 제거하고, 선택된 수업의 compact summary와 상세만 남기도록 단순화했다.
- [lib/student-lessons.ts](/home/ydhcjswo/projects/SPM_SAMPLE/lib/student-lessons.ts)를 추가해 학생 수업 선택 기본값 계산과 요약 fetch를 헤더/페이지에서 공통으로 재사용하게 정리했다.

Confidence: `source-backed`

## Not Attempted

- 실제 모바일 브라우저에서 기존 헤더 바 안의 두 select가 충분히 눌리기 쉬운지 수동 확인하지는 않았다.
- 헤더 바 높이가 늘어난 상태에서 safe area와 스크롤 밀도가 자연스러운지는 브라우저 QA가 남아 있다.

## Remaining Risk

- 구현과 빌드/타입체크는 닫혔지만, 좁은 화면에서 헤더 안 select 두 개가 답답하지 않은지는 실제 기기 확인이 필요하다.
