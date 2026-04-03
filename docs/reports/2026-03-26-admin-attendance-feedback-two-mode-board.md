# 2026-03-26 Admin Attendance Feedback Two-Mode Board

## Summary

- `/admin` 운영판을 `출석 / 피드백` 2모드로 재정렬했다.
- 기본 진입은 `출석`으로 고정했고, `피드백` 모드에서는 `주차별 수업 피드백 + 학생 개별 피드백 + 학생 reply read-only`만 다루게 했다.
- `/admin/students`의 `피드백` action은 `/admin?mode=feedback...` deep link로 정렬했다.
- student lessons는 `개별 피드백 + reply`만 노출하고, shared/legacy notes는 active UI에서 숨겼다.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Notes

- `class_logs.progress`, `class_logs.reflection`, `class_logs.member_admin_notes`는 schema에 남아 있지만 active UI에서는 hidden legacy data로만 취급한다.
- `/api/admin/weekly-notes`는 새 UI가 hidden legacy 값을 지우지 않도록 기존 row를 읽어 preserve한 뒤 canonical RPC를 호출한다.
