# 2026-03-16 Payment Fallback And Admin Default Selection

## Scope

- `/api/admin/payment`의 connected Supabase RPC missing을 compatibility fallback으로 보완
- `/admin` 첫 진입 기본 선택을 `현재 월 + 해당 월 첫 수업`으로 정렬

## Commands

- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass
- `POST /api/dev/runtime-login { preset: "ADMIN" }`: pass
- `POST /api/admin/payment { enrollmentId, paymentStatus: "paid" }`: pass
- Playwright local smoke:
  - `/admin` first load -> month input `2026-03`
  - `/admin` first load -> `Beginner A / 2026.03` visible

## Runtime-Proven

- role: `ADMIN`
- route: `/api/admin/payment`
  - observed: previously `500 PAYMENT_UPDATE_FAILED`
  - now: `200`, `payment_status: true`
- route: `/admin`
  - observed: current month와 첫 수업이 기본 선택 상태로 렌더

Confidence: `runtime-proven`

## Notes

- connected Supabase의 `update_enrollment_payment_status` helper는 현재 schema cache에 없어 compatibility fallback을 유지한다.
- canonical truth는 계속 [RPC.sql](/home/ydhcjswo/projects/SPM_SAMPLE/docs/db/RPC.sql)이다.

## Remaining Risk

- remote Supabase에 payment helper를 실제 반영하면 fallback 제거 여부를 다시 판단해야 한다.
