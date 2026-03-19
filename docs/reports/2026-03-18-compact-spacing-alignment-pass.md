# 2026-03-18 Compact Spacing Alignment Pass

## Scope

- 학생 메인, 학생 내상태, 운영 메인, 학생 관리 탭의 과한 여백과 흐트러진 row/action 정렬을 compact baseline으로 재조정
- 기능 계약은 유지한 채 메인 요약 카드, 헤더, 목록 row, 다이얼로그 list의 밀도만 낮추는 표면 polish

## Commands

- `npm run lint`
- `npm run build`
- `npm run typecheck`

## Source-Backed Notes

- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx) 에서 학생 상황판을 `상태칩 row`와 `출석 + 새 수업 요청 row`로 나눠 wrap 혼잡을 줄였다.
- [app/student/profile/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/profile/page.tsx) 의 4개 상태 카드와 계정/테마 카드 높이를 줄이고, 테마 버튼을 3열 grid로 맞췄다.
- [components/student-class-detail-view.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-class-detail-view.tsx) 의 주차 탭, 카드 내부 block, 메모/피드백 panel 간격을 함께 압축했다.
- [app/admin/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/admin/page.tsx) 에서 운영 헤더와 3개 요약 카드를 더 낮은 one-line metric 형태로 바꿨다.
- [app/admin/students/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/admin/students/page.tsx) 에서 학생 row를 `이름 | 결제 | 상태 | 삭제` 고정열 느낌으로 재정렬하고, 학생 배정 다이얼로그 list padding도 줄였다.

## Remaining Risk

- 이번 패키지는 source-backed + static validation 기준의 spacing/alignment 정리다.
- 실제 모바일 브라우저에서 `/student`, `/student/profile`, `/admin`, `/admin/students`를 함께 열어 top bar wrap, action touch target, list scan rhythm을 다시 보는 실브라우저 QA는 아직 남아 있다.
