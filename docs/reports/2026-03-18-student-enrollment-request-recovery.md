# 2026-03-18 Student Enrollment Request Recovery

## Scope

- 학생 표면에서 `수업 선택 -> 승인 요청` 흐름 복구
- `PENDING` enrollment를 student self-request create/reopen에도 사용하도록 route contract 추가
- 학생 empty state와 profile에서 같은 신청 surface 재사용

## Commands

- `npm run lint`
- `npm run build`
- `npm run typecheck`

## Source-Backed Notes

- 새 route는 [app/api/student/enrollment-request/route.ts](/home/ydhcjswo/projects/SPM_SAMPLE/app/api/student/enrollment-request/route.ts)이고, authenticated `STUDENT`만 접근할 수 있다.
- student request는 활성 수업 목록을 읽고, 같은 달에 기존 row가 없으면 `PENDING` enrollment를 생성한다.
- 같은 달 row가 `CANCELLED`이면 새 row를 만들지 않고 기존 row를 `PENDING`으로 다시 연다.
- 학생 홈 empty state와 프로필은 [components/student-enrollment-request-card.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-enrollment-request-card.tsx)를 공통으로 사용한다.
- 운영 승인 표면은 기존 [app/admin/students/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/admin/students/page.tsx)의 status 변경 흐름을 그대로 사용한다.

## Remaining Risk

- 이번 복구는 source-backed와 static validation까지는 닫혔지만, 실제 runtime에서 `student request -> admin pending 확인 -> ACTIVE 승인` 왕복 QA는 아직 남아 있다.
