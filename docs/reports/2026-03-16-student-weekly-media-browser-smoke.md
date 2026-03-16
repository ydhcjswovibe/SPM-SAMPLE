# 2026-03-16 Student Weekly Media Browser Smoke

## Scope

- Playwright Chromium 기준 student weekly media 실제 브라우저 DOM consume 확인
- mobile viewport에서 iframe/image render와 reload 후 지속성 확인

## Commands

- `npm run build`: pass
- `npm run runtime:seed-auth`: pass
- `npm run start -- --hostname 127.0.0.1 --port 3008`: pass
- `SPM_BASE_URL=http://127.0.0.1:3008 npm run verify:student-browser-smoke`: pass

## Runtime-Proven

- role: `STUDENT`
- route: `/auth/login`
  - observed: 이메일/비밀번호 로그인 success
- route: `/student/class/11111111-1111-4111-8111-111111111111?yearMonth=2026-03`
  - observed:
    - `1주차` tab에서 video iframe visible
    - `1주차 이미지` actual browser DOM visible
    - image `naturalWidth > 0` load success
    - reload 후 iframe/image 계속 visible
- route: `/api/admin/weekly-media?...`
  - observed: same browser session에서 `403 ADMIN_REQUIRED`

Confidence: `runtime-proven`

## Notes

- 이 패키지에서는 admin route로 test video/image를 만들고, 브라우저 smoke 종료 후 cleanup했다.
- 이 환경은 Chromium shared library가 비어 있어 `tmp/playwright-libs/*` local extracted libs를 자동으로 붙였다.

## Remaining Risk

- 없음. student weekly media DOM consume 기준의 browser smoke는 닫혔다.
