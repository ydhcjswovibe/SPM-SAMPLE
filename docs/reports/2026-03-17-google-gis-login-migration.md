# 2026-03-17 Google GIS Login Migration

## Scope

- `/auth/login`의 Google entry를 redirect 기반 OAuth 시작에서 Google Identity Services ID token sign-in으로 전환
- configured 환경에서는 Supabase-hosted OAuth redirect hop 대신 `signInWithIdToken` 경로를 기본 UX로 사용
- Google client 설정이 없는 환경이나 GIS script load 실패 시에는 기존 redirect 기반 Google login으로 compatibility fallback 하도록 정렬

## Commands

- `npm run typecheck` -> `.next/types` build artifact issue
- `npm run build`
- `npm run typecheck`
- `npm run runtime:seed-auth`
- `npm run start -- --hostname 127.0.0.1 --port 3012`
- `curl -s http://127.0.0.1:3012/auth/login`
- `SPM_BASE_URL=http://127.0.0.1:3012 npm run verify:route-guards`

## Source-backed Review

- [components/auth-login-form.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/auth-login-form.tsx)에서 Google login 기본 경로를 GIS script가 렌더한 button + Supabase `signInWithIdToken`으로 전환했다.
- configured 환경에서는 Google login이 더 이상 앱의 기본 UX에서 `/auth/callback` redirect hop을 전면에 드러내지 않는다.
- GIS button은 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`가 있을 때만 렌더를 시도하고, 값이 없거나 GIS script load가 실패하면 기존 redirect 기반 Google login으로 fallback 한다.

## Rendered Proof

- local env에 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`가 없는 상태에서 `/auth/login`을 직접 렌더해 `Google로 계속하기` 버튼과 이메일/비밀번호 로그인 입력이 함께 계속 보이는 것을 확인했다.
- 이 상태는 GIS button 대신 기존 redirect 기반 Google login fallback을 제공하는 rendered proof다.

## Runtime-Proven

- `runtime:seed-auth` 후 `verify:route-guards`를 재실행해 anonymous/allowed/wrong-role/profile patch smoke가 기존 계약대로 유지되는 것을 확인했다.
- observed outcomes:
  - anonymous `/admin` -> rendered gate
  - anonymous `/api/admin/matrix` -> `401 AUTH_REQUIRED`
  - signed-in `STUDENT` `/api/admin/matrix` -> `403 ADMIN_REQUIRED`
  - allowed `OWNER` / `ADMIN` / `STUDENT` page access -> success
  - self profile patch/restore -> success

## Not Attempted

- configured GIS success path는 이번 로컬 패키지에서 runtime-proven으로 재현하지 않았다.
- 실제 Google account chooser/One Tap UI가 `supabase.co` 문구 없이 보이는지는 deployed env 또는 client id가 들어간 local env에서 별도 확인이 필요하다.

## Remaining Risk

- 배포 환경에는 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`가 추가돼야 configured GIS path가 열린다.
- Google Cloud `Authorized JavaScript origins`와 Supabase Google provider 설정이 drift 나면 `signInWithIdToken` success path도 실패할 수 있다.

Confidence:
- configured GIS path: `source-backed`
- no-client-id fallback path: `rendered proof`
- auth/role regression smoke: `runtime-proven`
