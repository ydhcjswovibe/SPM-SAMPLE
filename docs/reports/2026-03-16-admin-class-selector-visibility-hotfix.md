# 2026-03-16 admin class selector visibility hotfix

## Summary

- `/api/admin/classes?yearMonth=...`는 더 이상 해당 월 등록이 있는 수업만 반환하지 않는다.
- 활성 수업 전체를 반환하되, 해당 월에 등록이 있는 수업을 먼저 정렬한다.
- `/admin`과 `/admin/students`는 이 응답을 그대로 사용해 새 수업도 바로 선택할 수 있다.
- `/admin`에서 수업 생성 직후에는 방금 만든 수업을 자동 선택한다.

## Why

- 기존 month-first hotfix 이후에는 새 수업이 현재 월 등록이 없으면 `운영` 탭과 `학생` 탭 selector에서 숨겨졌다.
- 이 상태에서는 새 수업을 만든 뒤 곧바로 matrix 확인이나 첫 학생 배정을 이어서 할 수 없었다.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- local runtime owner session으로 새 수업 생성 후 `GET /api/admin/classes?yearMonth=2026-03` 응답에 해당 수업이 포함되는지 확인
- local runtime admin session으로 같은 route가 success인지 확인

## Result

- source-backed + runtime route proof 확보
- 남은 open risk는 remote Supabase helper drift(`update_enrollment_status`, `update_enrollment_payment_status`)이며, 이번 selector hotfix 범위와는 분리된다
