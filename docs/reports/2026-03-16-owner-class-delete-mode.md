# 2026-03-16 Owner Class Delete Mode

## Scope

- `/admin` class selector에 owner 전용 삭제 모드 추가
- class delete는 actual row delete가 아니라 `is_active=false` soft delete로 정렬

## Commands

- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass
- `npm run runtime:seed-auth`: pass
- owner runtime login: pass
- `POST /api/admin/classes`: pass
- `DELETE /api/admin/classes`: pass
- Playwright local smoke:
  - class selector -> `수업 삭제`
  - `-` 표시된 수업 선택
  - 확인 다이얼로그 렌더
  - delete response `200`

## Runtime-Proven

- role: `OWNER`
- route: `POST /api/admin/classes`
  - observed: 테스트 수업 생성 success
- route: `DELETE /api/admin/classes`
  - observed: `200`, payload `is_active: false`
- route: `/admin`
  - observed: `수업 삭제` 진입 후 선택한 수업에 대한 확인 다이얼로그 렌더
  - observed: confirm 이후 DELETE response success

Confidence: `runtime-proven`

## Notes

- 삭제 모드에서는 현재 월 수업 목록이 아니라 전체 활성 수업 목록을 보여 준다.
- 현재 구현은 owner-only다. admin은 삭제 모드 진입을 볼 수 없다.

## Remaining Risk

- soft delete 이후 월 기준 목록에서는 바로 사라지지만, 연관 enrollment/class_logs/media row는 보존된다.
