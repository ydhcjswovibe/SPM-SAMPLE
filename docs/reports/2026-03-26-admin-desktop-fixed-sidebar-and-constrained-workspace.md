# 2026-03-26 Admin Desktop Fixed Sidebar And Constrained Workspace

## Scope

- 모바일은 유지하고 운영 desktop shell만 고정 left sidebar rail + 더 좁은 main workspace로 재정렬한다.
- `/admin`, `/admin/students`, `/admin/content`, `/admin/settings`가 같은 desktop shell 폭 규칙을 공유하게 맞춘다.
- desktop shell truth와 검증 기준을 active docs에 sync 한다.

## Commands

- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm run runtime:seed-auth`
- `npm run start -- --hostname 127.0.0.1 --port 3930`
- `node` Playwright ad hoc desktop/mobile shell check (`/admin`, `/admin/students`, `/admin/content`, `/admin/settings`, `1440x1024`, `390x844`)

## Source-backed Review

- [app/admin/layout.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/layout.tsx)에서 desktop `md+` shell을 `fixed left sidebar rail + constrained workspace` 구조로 재정렬했다.
- [components/desktop-sidebar.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/desktop-sidebar.tsx)는 `md+`에서 `position: fixed` rail로 바꾸고, mobile에는 영향을 주지 않도록 유지했다.
- [docs/SPEC.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/SPEC.md)는 desktop shell truth를 `fixed rail + constrained workspace` 기준으로 갱신했다.
- [docs/VERIFY.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/VERIFY.md)는 desktop fixed sidebar, narrower workspace, mobile unchanged 확인 기준을 추가했다.

Confidence: `source-backed`

## Rendered Proof

- route: `/admin`, `/admin/students`, `/admin/content`, `/admin/settings`
  - role: `OWNER`
  - action: desktop viewport `1440x1024`에서 shell 렌더 확인
  - observed:
    - sidebar `position: fixed`
    - sidebar left `0`, width `272`
    - main workspace left `272`, width `1120`
    - 4개 route 모두 같은 desktop shell 수치 유지
- route: `/admin`
  - role: `OWNER`
  - action: mobile viewport `390x844`에서 shell 렌더 확인
  - observed:
    - desktop `aside` hidden
    - mobile nav visible
    - mobile selector 위치는 기존 구조 그대로 유지

Confidence: `rendered proof`

## Validation Notes

- `npm run typecheck`: pass
- `npm run build`: pass
- `npm run lint`: pass
- `npm run runtime:seed-auth`: pass

## Remaining Risk

- desktop shell은 local browser 기준으로는 닫혔지만, 실제 운영 체감에서 본문을 더 강하게 좁힐지 여부는 추가 피드백 여지가 있다.
- dense matrix나 긴 편집 화면이 더 좁은 workspace에서 충분히 편한지는 실제 사용 중 다시 볼 수 있다.
