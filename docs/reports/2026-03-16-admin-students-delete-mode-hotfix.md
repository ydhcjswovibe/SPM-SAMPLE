# 2026-03-16 admin students delete mode hotfix

## Summary

- `/admin/students` 목록 row를 mobile에서 한 줄에 가깝게 읽히도록 다시 압축했다.
- owner delete는 상시 노출을 없애고 상단 `삭제` 버튼으로 진입하는 `삭제 모드`에서만 보이게 바꿨다.
- 삭제 모드가 켜지면 row 오른쪽에만 휴지통 버튼이 나타난다.

## Validation

- `npm run lint -- app/admin/students/page.tsx`
- `npm run typecheck`
- `npm run build`

## Result

- source-backed 기준으로 mobile 학생 배정 row 정렬과 delete-mode UX 정리 완료
