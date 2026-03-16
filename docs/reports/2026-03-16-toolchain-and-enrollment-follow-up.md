# 2026-03-16 Toolchain And Enrollment Follow-up

## Scope

- lint baseline 복구
- legacy `/api/upload` route 비활성화
- `/admin/students` enrollment mutation을 server route로 정렬

## Commands

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- `curl -X POST http://127.0.0.1:3006/api/upload`: `410 LEGACY_UPLOAD_ROUTE_DISABLED`

## Source-backed Review

- touched scope: `eslint.config.mjs`, `package.json`, `app/admin/content/page.tsx`, `app/student/class/[classId]/page.tsx`, `components/ui/sidebar.tsx`, `app/api/upload/route.ts`, `app/api/admin/enrollments/route.ts`, `app/admin/students/page.tsx`
- No findings
- lint는 Next 16 flat config 기준으로 복구했고, React purity/set-state-in-effect 오류는 파생 상태 정리로 해소했다.
- legacy upload route는 active weekly image contract와 충돌하지 않도록 명시적으로 닫았다.
- student enrollment 추가/상태변경/삭제는 이제 `/api/admin/enrollments` route를 경유하고, role별 denied case를 명시적으로 드러낸다.

Confidence: `source-backed`

## Runtime-Proven

- route: `POST /api/upload`
  - role: anonymous
  - observed: `410`
  - body: `{"error":"LEGACY_UPLOAD_ROUTE_DISABLED","detail":"주차 이미지 업로드는 /api/admin/weekly-media/image 경로만 사용합니다."}`

Confidence: `runtime-proven`

## Not Attempted

- allowed admin session에서 `/api/admin/enrollments` create / status update success
- allowed owner session에서 `/api/admin/enrollments` delete success
- denied role 기준 `/api/admin/enrollments -> 403` runtime proof

## Remaining Risk

- enrollment mutation route 정렬은 완료됐지만 이번 패키지에서는 runtime-proven까지 찍지 않았다.
