# 2026-03-27 Admin Attendance Dense List And Memo Dot

## Summary
- `/admin` 출석부 mobile shell을 fluffy card stack에서 `조밀한 리스트`로 다시 정리했다.
- 학생-주차 셀의 `메모 아이콘`은 제거하고, 출석 버튼 아래 `점 1개`만 남겨 메모 entry와 메모 존재 표시를 겸하게 바꿨다.
- 출석부 상단 helper text, fallback notice box, wide `CSV 다운로드` 버튼을 제거하고 `출석부 + 우상단 icon action`만 남겼다.

## Applied Truth
- 학생 행 정보는 `이름 + 상태 배지 + 1~4주 출석 버튼`만 남긴다.
- 출석 버튼은 `present / absent` 2상태만 쓰고, unchecked는 `결석`으로 읽는다.
- 주차 전체 운영 메모는 계속 `1주~4주` 헤더 옆 작은 note icon으로만 연다.
- 학생 메모는 학생-주차 버튼 아래의 작은 점으로만 연다.

## Verification
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run runtime:seed-auth`
- `SPM_BASE_URL=http://127.0.0.1:3920 npm run verify:admin-mobile-browser`

## Runtime Notes
- mobile browser smoke에서 `/admin` 상단 `CSV / filter` icon button, 40px 출석 버튼, 32px 메모 점 hit target을 다시 확인했다.
- old `3000` dev server는 stale bundle 때문에 login timeout이 있었고, fresh `next start` on `3920` 기준으로 재검증해 통과했다.
