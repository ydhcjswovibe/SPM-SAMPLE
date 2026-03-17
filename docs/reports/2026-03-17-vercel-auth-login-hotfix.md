# 2026-03-17 Vercel Auth Login Hotfix

## Scope

- 빠져 있던 `Google OAuth callback` route를 복구
- 배포 auth 이슈 분석 중 확인된 Supabase project drift를 기록

## Commands

- `npm run typecheck`
- `npm run build`

## Source-backed Review

- [app/auth/callback/route.ts](/home/ydhcjswo/projects/SPM_SAMPLE/app/auth/callback/route.ts)를 복구해 `exchangeCodeForSession()` 이후 redirect 응답에 Supabase cookie를 다시 복사하도록 정렬했다.
- callback redirect base는 `x-forwarded-host`, `x-forwarded-proto`를 우선 사용해 Vercel 프록시 뒤에서도 origin이 틀어지지 않게 했다.
- 현재 로컬 active env는 `.env.local`의 `https://kpcujcnwmgqsojnljsas.supabase.co`인데, user report 기준 Vercel은 `https://dtqdmnryvamirgloepvg.supabase.co`를 보고 있어 Supabase project drift가 있다.
- 이 drift가 있으면 배포본은 로컬에서 확인한 auth/profile/RLS truth와 다른 프로젝트를 사용하므로 로그인 성공 여부와 후속 role/profile 조회 결과가 달라질 수 있다.

Confidence: `source-backed`

## Not Attempted

- 실제 Vercel 배포 URL에서 Google provider end-to-end callback runtime은 이번 패키지에서 재현하지 않았다.
- remote Supabase의 user/profile/redirect URL/provider 설정 일치 여부는 코드만으로 확정하지 않았다.

## Remaining Risk

- Vercel env가 계속 `dtqdmnry...` project를 가리키면, callback route 복구 후에도 현재 저장소의 auth truth와 다른 데이터/설정 때문에 로그인 실패가 이어질 수 있다.
