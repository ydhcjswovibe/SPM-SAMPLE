# 2026-03-26 Admin Desktop Shell Cohesion Pass

## Scope

- 모바일은 유지하고 운영 desktop shell만 `좌상단 brand block + 우측 toolbar + 그 아래 left rail` 연속 프레임으로 다시 묶는다.
- `/admin`, `/admin/students`, `/admin/content`, `/admin/settings`가 같은 desktop shell language를 공유하게 맞춘다.
- desktop shell truth와 검증 기준을 active docs에 sync 한다.

## Commands

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run start -- --hostname 127.0.0.1 --port 3934`
- `node` Playwright ad hoc shell check (`/admin`, `/admin/settings`, `1440x1024`, `390x844`)

## Source-backed Review

- [components/admin-shell-header.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/admin-shell-header.tsx)는 desktop `desktopLead` slot과 tighter top spacing을 추가해 top toolbar를 sidebar brand block과 같은 shell surface로 맞췄다.
- [components/desktop-sidebar.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/components/desktop-sidebar.tsx)는 full-height 한 장 rail 대신 `brand block + nav panel` 2단 구조로 바꿔 rail이 brand block 아래에서 시작하도록 정리했다.
- [app/admin/settings/page.tsx](/home/ydhcjswo/projects/SPM-SAMPLE/app/admin/settings/page.tsx)는 mobile header는 유지하고, desktop에서는 공통 admin shell header를 사용하도록 맞췄다.
- [docs/SPEC.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/SPEC.md), [docs/VERIFY.md](/home/ydhcjswo/projects/SPM-SAMPLE/docs/VERIFY.md)는 `brand block + toolbar + below-rail` desktop truth를 반영했다.

Confidence: `source-backed`

## Rendered Proof

- route: `/admin`
  - role: `OWNER`
  - action: desktop viewport `1440x1024`에서 shell 렌더 확인
  - observed:
    - brand block top `20px`
    - toolbar top `20px`
    - nav panel top `104.97px`
    - brand bottom `94.97px`
    - sidebar fixed rail width `272px`
- route: `/admin/settings`
  - role: `OWNER`
  - action: desktop viewport `1440x1024`에서 same shell language 확인
  - observed:
    - top toolbar와 좌측 brand block top이 동일
    - settings도 별도 plain sticky header 대신 공통 shell toolbar를 사용
- route: `/admin`
  - role: `OWNER`
  - action: mobile viewport `390x844`에서 fallback shell 확인
  - observed:
    - desktop `aside` hidden
    - mobile nav visible
    - mobile header top `0`

Confidence: `rendered proof`

## Validation Notes

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run build`: pass

## Remaining Risk

- local browser 기준으로는 상단과 좌측 rail의 파편감이 줄었지만, 실제 운영 체감에서 toolbar 높이를 더 줄일지는 사용자 피드백 여지가 있다.
