# 2026-03-26 Admin Four-Week Ops Board And Media-Only Content

## Summary

- `/admin` 출석부를 mobile/desktop 공통 `학생별 x 주차별 4주 운영판`으로 재구성했다.
- 주차 공통 메모와 학생별 피드백/운영 메모 편집을 `/admin` sheet로 이동했다.
- `/admin/content`는 media-only 편집 surface로 축소했다.
- `class_logs.member_admin_notes`와 `upsert_weekly_class_log_notes(..., p_member_admin_notes, ...)` canonical truth를 문서에 추가했다.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Notes

- 새 `member_admin_notes` contract는 source-backed 기준으로 구현됐다.
- 연결된 Supabase에 schema/RPC가 아직 apply되지 않았다면, 학생별 운영 메모 저장은 runtime에서는 막힐 수 있다.
