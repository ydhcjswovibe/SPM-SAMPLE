# 2026-03-18 Student Request Dialog And Approved Refresh Follow-Up

## Scope

- 학생 `수업 신청` action을 `수업` 탭 다이얼로그로 이동
- `/student/profile`에서 반복되던 `수업 바로 가기`, `새 수업 요청` 제거
- 오너 승인 후 학생 상세가 stale `PENDING` 상태에 머무를 수 있던 refresh gap 보정

## Commands

- `npm run lint`
- `npm run build`
- `npm run typecheck`

## Source-Backed Notes

- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx)에서 empty state와 상단 action이 같은 request dialog를 열도록 정리했다.
- [app/student/profile/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/profile/page.tsx)는 다시 전체 상태 요약과 계정 정보에만 집중한다.
- [components/student-enrollment-request-card.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-enrollment-request-card.tsx)는 card 대신 dialog surface로 바뀌었다.
- 학생 summary/detail query에 짧은 polling을 추가했고, detail key에 `enrollmentStatus`를 포함해 owner 승인 뒤 같은 `class + month` 범위에서도 다시 읽히게 했다.

## Remaining Risk

- 이번 follow-up은 source-backed와 static validation까지는 닫혔지만, 실제 브라우저에서 `student request -> owner approve -> student detail refresh` 왕복 QA는 아직 남아 있다.
