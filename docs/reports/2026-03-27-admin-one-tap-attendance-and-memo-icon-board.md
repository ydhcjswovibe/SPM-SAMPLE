# 2026-03-27 admin one-tap attendance + memo-icon board

## Summary

- `/admin` 학생-주차 셀을 `원터치 출석 + 메모 아이콘` 구조로 다시 단순화했다.
- admin 출석 board에서는 체크되지 않은 값을 별도 `pending`으로 두지 않고 `결석`으로 읽도록 정규화했다.
- 셀 아래 상태 표시는 `출석 / 메모` 2개 점만 남겼다.
- 항상 보이는 filter chip strip를 없애고, 우상단 filter menu에 `답글 도착만` 1개만 남겼다.

## Changed

- [components/admin-matrix.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/admin-matrix.tsx)
  - 주차 셀을 `출석 토글 + 메모 icon` 2액션으로 축소
  - 학생 메모 sheet는 `메모 textarea + 학생 답글 read-only`만 유지
  - 주차 헤더 note icon은 계속 주차 운영 메모만 열게 유지
- [app/api/admin/attendance/route.ts](/home/ydhcjswo/projects/SPM-SAMPLE/app/api/admin/attendance/route.ts)
  - admin operator input을 `present / absent` 기준으로 정규화
- [lib/admin/matrix.ts](/home/ydhcjswo/projects/SPM-SAMPLE/lib/admin/matrix.ts)
  - admin board read model에서 old `pending / excused / null`을 `absent`로 normalize
- [scripts/019_verify_admin_mobile_browser.mjs](/home/ydhcjswo/projects/SPM-SAMPLE/scripts/019_verify_admin_mobile_browser.mjs)
  - 새 attendance toggle / memo icon / filter button 기준으로 browser smoke selector 갱신

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run runtime:seed-auth`
- `SPM_BASE_URL=http://127.0.0.1:3920 npm run verify:admin-mobile-browser`

## Notes

- DB schema와 RPC는 compatibility를 위해 wider status set을 유지하지만, 현재 admin operator UI와 route contract는 `present / absent` 2상태만 적극 사용한다.
- student-facing lessons의 `개별 피드백 + reply` 노출 기준은 이번 패키지에서 바꾸지 않았다.
- local runtime mobile smoke에서 새 `출석 토글 / 학생 메모 아이콘 / 답글 필터 메뉴` selector까지 다시 확인했다.
