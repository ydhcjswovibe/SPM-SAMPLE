# 2026-03-16 Student Weekly Media Manual Checklist

## Scope

- student weekly media의 실제 브라우저 DOM consume 확인 절차 정리
- 현재 local runtime harness와 weekly media runtime script를 manual smoke 준비 단계로 연결

## Preconditions

- `npm run build`
- `npm run runtime:seed-auth`
- `npm run start -- --hostname 127.0.0.1 --port 3007`
- 필요 시 `SPM_BASE_URL=http://127.0.0.1:3007 npm run verify:weekly-media-runtime`

## Manual Checklist

- `a@spm.local`로 로그인해 `/admin/content`에서 `11111111-1111-4111-8111-111111111111 / 2026-03 / 1주차`를 연다
- 영상 1건과 이미지 1건이 저장된 상태인지 확인한다
- `s1@spm.local`로 로그인해 `/student/class/11111111-1111-4111-8111-111111111111?yearMonth=2026-03`를 연다
- 1주차 탭에서 `영상` iframe이 실제로 렌더되는지 확인한다
- 같은 화면에서 `이미지`가 실제 브라우저 DOM에 렌더되는지 확인한다
- 학생 세션에서 새로고침 후에도 같은 주차에서 접근이 유지되는지 확인한다
- 학생 세션에서 `/api/admin/weekly-media?...` 호출은 계속 `403 ADMIN_REQUIRED`인지 확인한다

## Status

- manual checklist 준비 완료
- 실제 브라우저 수동 실행은 이번 패키지에서 아직 하지 않았다

## Remaining Risk

- student weekly media의 실제 iframe/image DOM 상호작용은 manual browser smoke가 끝나기 전까지 `runtime-proven DOM consume`으로 부르지 않는다.
