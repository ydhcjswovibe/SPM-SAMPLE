# 2026-03-18 Student Topbar Selector And Compact Summary Follow-Up

## Scope

- `/student`의 수업 선택과 월 선택을 상단바로 올리고, control을 분리
- `지금 볼 수업` 설명 블록과 큰 검은 상태판을 제거
- 선택된 수업의 핵심 정보만 남긴 간단한 상황판으로 요약
- 위 변경에 맞춰 `docs/SPEC.md`, `docs/VERIFY.md`, `PROGRESS.md`를 follow-up sync

## Commands

- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass

## Source-backed Review

- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx)에서 상단 sticky bar에 `수업 선택`, `월 선택`을 분리하고, 아래에는 선택된 수업의 간단한 상황판만 남기도록 정리했다.
- 큰 hero/설명 섹션과 검은 상태판을 제거해 학생 수업 첫 화면을 더 짧고 직접적인 구조로 줄였다.
- [docs/SPEC.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/SPEC.md), [docs/VERIFY.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/VERIFY.md), [PROGRESS.md](/home/ydhcjswo/projects/SPM_SAMPLE/PROGRESS.md)에 새 top bar/상황판 기준과 후속 상태를 반영했다.

Confidence: `source-backed`

## Not Attempted

- 모바일 브라우저에서 sticky top bar와 두 개 select의 실제 터치 감각은 수동 확인하지 않았다.
- `상단바 -> 상황판 -> 주차 콘텐츠` 흐름의 시각 밀도와 safe area는 브라우저 QA 패키지에서 별도 확인이 남아 있다.

## Remaining Risk

- 구조는 더 단순해졌지만, 실제 모바일에서 상단 select 두 개가 좁게 느껴지지 않는지는 수동 확인이 필요하다.
- student top bar follow-up은 source-backed 수준이며, 브라우저에서 직접 보고 난 뒤에야 rendered proof로 올릴 수 있다.
