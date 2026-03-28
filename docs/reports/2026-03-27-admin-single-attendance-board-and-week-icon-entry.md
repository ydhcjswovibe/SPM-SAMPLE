# 2026-03-27 admin single attendance board + week icon entry

## Summary

- `/admin` 운영판을 `출석 / 피드백` 2모드에서 다시 `단일 출석부`로 정리했다.
- 학생-주차 셀은 `출석 + 학생 개별 피드백 + 학생 reply read-only`를 함께 여는 상세 sheet entry로 고정했다.
- 주차 전체 작업은 `1주 / 2주 / 3주 / 4주` 헤더 옆의 작은 icon-only button으로만 열리게 바꿨다.
- 메인 보드에는 날짜를 상시 노출하지 않고, desktop은 hover tooltip, mobile은 opened sheet 안에서만 날짜+요일을 보여 주도록 잠갔다.

## Changed

- [components/admin-matrix.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/admin-matrix.tsx)
  - visible `출석 / 피드백` mode UI 없이 단일 보드로 유지
  - mobile week row와 desktop week header에 icon-only week note entry 유지
  - 학생-주차 cell main interaction은 attendance, cell detail은 student sheet로 정리
- [app/admin/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/page.tsx)
  - `/admin` query sync를 `classId + yearMonth + week + studentId` 기준으로 유지
- [app/admin/students/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/students/page.tsx)
  - `피드백` action deep link를 단일 `/admin` student/week focus contract로 유지
- [lib/admin/content-selection.ts](/home/ydhcjswo/projects/SPM-SAMPLE/lib/admin/content-selection.ts)
  - visible `mode` query helper 제거
- [docs/SPEC.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/SPEC.md), [docs/VERIFY.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/VERIFY.md), [PROGRESS.md](/home/ydhcjswo/projects/SPM-SAMPLE/PROGRESS.md)
  - 2모드 truth 제거
  - 단일 출석부 + 주차 헤더 icon entry truth로 sync

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run runtime:seed-auth`
- `SPM_BASE_URL=http://127.0.0.1:3920 npm run verify:admin-mobile-browser`

## Notes

- admin mobile browser smoke까지 다시 통과했으므로, 이번 패키지의 운영 출석부 shell/interaction 변경은 local runtime 기준에서도 한 번 더 확인했다.
- physical device finger test와 configured GIS login success path runtime proof는 아직 후속으로 남아 있다.
