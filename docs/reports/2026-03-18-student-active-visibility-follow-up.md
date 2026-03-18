# 2026-03-18 Student Active Visibility Follow-Up

## Scope

- 학생 `수업` 탭에서 `ACTIVE`와 `PENDING` 차이가 더 직접적으로 읽히도록 상태 표현 보강
- 오너 승인 후 학생 표면이 stale하게 보이던 refresh gap 추가 보정

## Commands

- `npm run lint`
- `npm run build`
- `npm run typecheck`

## Source-Backed Notes

- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx)에 `상태` 칩을 다시 추가해 `수강 중 / 등록 예정`을 한눈에 보이게 했다.
- `다음` 칩은 `PENDING + no content`일 때 `승인 대기`, `ACTIVE + no content`일 때 `준비 중`으로 다르게 읽히도록 정리했다.
- [components/student-class-detail-view.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-class-detail-view.tsx)의 empty 상태 문구를 `운영 승인 전`과 `수강 시작 후 콘텐츠 준비 중`으로 분리했다.
- student summary/detail/nav/profile polling을 5초로 줄여 운영 승인 결과가 학생 표면에 더 빠르게 반영되게 했다.

## Remaining Risk

- 이번 follow-up은 source-backed와 static validation까지는 닫혔지만, 실제 브라우저에서 `student request -> owner approve -> student active visible` 왕복 QA는 아직 남아 있다.
