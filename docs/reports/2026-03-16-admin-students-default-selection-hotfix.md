# 2026-03-16 admin students default selection hotfix

## Summary

- `/admin/students`는 해당 월 수업 목록이 열리면 첫 항목을 기본 선택한다.
- 수업 헤더 아래 설명은 긴 운영 안내 대신 현재 월 학생 상태 요약으로 바꿨다.
- 학생 row는 `상태 / 결제 / 이메일` 중심으로 압축했고, mobile에서 action 영역이 경계 밖으로 밀리지 않도록 정렬했다.

## Validation

- `npm run lint -- app/admin/students/page.tsx`
- `npm run typecheck`
- `npm run build`

## Result

- source-backed 기준으로 학생 탭 첫 진입 가독성과 기본 선택 흐름 정리 완료
