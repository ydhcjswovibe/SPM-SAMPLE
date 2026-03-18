# 2026-03-18 Student Active Selector And Owner Delete Visibility

## Scope

- `/student` selector에서 soft delete된 inactive 수업이 보이지 않도록 student read를 active class 기준으로 정렬
- `/admin`에서 `오늘 운영` 블록 제거
- `/admin` 헤더에 owner 전용 `삭제 모드` trigger를 상시 노출하고, delete mode 문구를 더 직접적으로 정리

## Commands

- `npm run lint`
- `npm run build`
- `npm run typecheck`

## Source-Backed Notes

- admin class selector는 활성 수업 전체를 계속 보여 주되, owner delete mode는 헤더에서 바로 진입할 수 있어야 한다.
- student selector는 학생 자신의 `ACTIVE`/`PENDING` enrollment만 보여 주고, 연결된 class가 soft delete(`is_active=false`)된 경우 목록에서 숨긴다.
- delete mode 안에서는 선택 중인 운영 수업 이름을 재사용하지 않고, `삭제할 수업 선택` 문구로 현재 모드를 명확히 드러낸다.

## Remaining Risk

- 이번 패키지는 source-backed와 static validation까지는 닫혔지만, `/admin`, `/student`에서 실제 헤더 control 노출과 delete flow는 실브라우저 QA가 아직 남아 있다.
