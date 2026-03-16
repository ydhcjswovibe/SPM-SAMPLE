# 2026-03-16 Auth Callback And Home Entry Hotfix

## Scope

- Google OAuth callback에서 session cookie가 redirect 응답에 유지되도록 정렬
- 홈 `/`에서 `운영 화면`, `학생 화면` 진입 링크를 실제 클릭 가능한 요소로 복구

## Commands

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run runtime:seed-auth`: pass
- `SPM_BASE_URL=http://127.0.0.1:3010 npm run verify:route-guards`: pass
- Playwright local smoke:
  - `/`에서 `운영 화면 열기` 클릭 -> `/admin` -> `관리자 로그인이 필요합니다`
  - `/`에서 `학생 화면 열기` 클릭 -> `/student` -> `학생 로그인이 필요합니다`

## Source-backed Review

- [app/auth/callback/route.ts](/home/ydhcjswo/projects/SPM_SAMPLE/app/auth/callback/route.ts)에서 `exchangeCodeForSession()` 이후 Supabase가 만든 cookie를 redirect 응답에 복사하도록 수정했다.
- 기존 구현은 redirect 응답에 cookie를 복사하지 않아 OAuth 성공 후에도 서버가 세션을 못 읽을 가능성이 있었다.
- 배포/프록시 환경을 고려해 `x-forwarded-host`, `x-forwarded-proto` 기반 redirect base도 함께 반영했다.

Confidence: `source-backed`

## Rendered Proof

- route: `/`
  - observed: `운영 화면 열기`, `학생 화면 열기` 링크가 실제 클릭 가능
- route: `/admin`
  - observed: anonymous 상태에서 `관리자 로그인이 필요합니다` gate visible
- route: `/student`
  - observed: anonymous 상태에서 `학생 로그인이 필요합니다` gate visible

Confidence: `rendered proof`

## Not Attempted

- 실제 Google OAuth provider를 통한 end-to-end callback runtime 재현은 이번 패키지에서 수행하지 않았다.

## Remaining Risk

- Google provider 자체의 외부 설정 mismatch가 있다면 별도 runtime 확인이 필요하다. 다만 코드 레벨 session cookie 누락 문제는 정리됐다.
