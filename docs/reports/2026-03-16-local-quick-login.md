# 2026-03-16 Local Quick Login

## Scope

- localhost 전용 auth login 화면에 원클릭 QA 로그인 추가
- `/api/dev/runtime-login`이 preset 입력만으로 `OWNER / ADMIN / STUDENT` 세션을 만들 수 있게 정렬

## Commands

- `npm run runtime:seed-auth`: pass
- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass
- `curl -c /tmp/spm-admin.cookies -b /tmp/spm-admin.cookies -X POST http://127.0.0.1:3011/api/dev/runtime-login --data '{"preset":"ADMIN"}'`: pass
- `curl -c /tmp/spm-student.cookies -b /tmp/spm-student.cookies -X POST http://127.0.0.1:3011/api/dev/runtime-login --data '{"preset":"STUDENT"}'`: pass
- `curl -b /tmp/spm-admin.cookies http://127.0.0.1:3011/api/dev/runtime-session`: pass
- `curl -b /tmp/spm-student.cookies http://127.0.0.1:3011/api/dev/runtime-session`: pass

## Runtime-Proven

- route: `POST /api/dev/runtime-login`
  - role: local preset `ADMIN`
  - observed: `a@spm.local`, `ADMIN`, redirectTo `/admin`
- route: `POST /api/dev/runtime-login`
  - role: local preset `STUDENT`
  - observed: `s1@spm.local`, `STUDENT`, redirectTo `/student`
- route: `GET /api/dev/runtime-session`
  - observed: preset login 이후 서버 access context에서 authenticated session 확인

Confidence: `runtime-proven`

## Notes

- 이 표면은 `127.0.0.1` 또는 `localhost`에서만 노출된다.
- 제품 기능이 아니라 로컬 QA 가속용이다.

## Remaining Risk

- 없음. 로컬 테스트 진입은 기존 이메일/비밀번호보다 더 빠르게 재현 가능해졌다.
