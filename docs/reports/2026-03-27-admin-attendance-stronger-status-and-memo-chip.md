# 2026-03-27 Admin Attendance Stronger Status And Memo Chip

## Summary
- `/admin` 출석부 학생-주차 셀을 `세로 스택`에서 `출석 토글 + 메모 칩` 가로 구조로 다시 정리했다.
- 학생 행은 `이름 + 결제` 중심으로 낮추고, 비정상 enrollment status만 보조 라벨로 남겼다.
- 출석 상태는 `출석=green`, `지난 주차 결석=red`, `현재/미래 미체크=neutral`로 더 강하게 구분하게 바꿨다.

## Applied Truth
- 학생 메모 entry는 더 이상 하단 점이 아니라 주차 토글 옆의 작은 `메모` 칩이다.
- `red 결석`은 마지막 실제 session date가 지난 주차에서만 쓴다.
- legacy fallback 주차는 같은 absent라도 overdue red를 쓰지 않는다.

## Verification
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run runtime:seed-auth`
- `SPM_BASE_URL=http://127.0.0.1:3920 npm run verify:admin-mobile-browser`

## Runtime Notes
- mobile browser smoke에서 `/admin`의 green 출석 토글, 32px 메모 칩 hit target, 상단 `CSV / filter` icon action을 다시 확인했다.
- verify output 기준 mobile attendance trigger는 `36x36`, memo chip은 `32x32` tap target으로 유지됐다.
