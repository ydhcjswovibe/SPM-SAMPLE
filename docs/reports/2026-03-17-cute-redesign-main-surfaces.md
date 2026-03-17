# 2026-03-17 Cute Redesign Main Surfaces

## Scope

- `/auth/login`, `/student`, `/admin` 3개 메인 화면에 cute redesign 1차를 적용
- `민트 + 블루 + 크림` 팔레트와 `물방울 젤리형` 정적 마스코트 도입
- 공통 토큰과 `Button`, `Card`, `Badge`, `Progress`, `Input`, `DropdownMenu`, mobile/student nav 톤 재정의
- `/admin/students`, `/admin/content`, `/student/class/[classId]`, 아이템 액세서리, 애니메이션은 이번 범위에서 제외

## Commands

- `npm run lint`
- `npm run build`

## Source-backed Review

- [app/globals.css](/home/ydhcjswo/projects/SPM_SAMPLE/app/globals.css)에서 전역 토큰을 `민트 + 블루 + 크림` 기준으로 재정의하고, `spm-display`, `spm-hero-panel`, `spm-soft-panel` 같은 cute redesign 유틸리티를 추가했다.
- [components/spm-mascot.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/spm-mascot.tsx)에 `물방울 젤리형` 기본 마스코트를 `base`, `welcome` 2포즈로 추가했다.
- [components/auth-login-form.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/auth-login-form.tsx)를 히어로 + 로그인 카드 + 로컬 QA 카드 구조로 재배치하고, 기존 이메일/Google/login flow는 유지한 채 CTA hierarchy만 재설계했다.
- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx)는 hero summary, 3개 요약 카드, progress-first 수업 카드 구조로 리디자인했다.
- [app/admin/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/admin/page.tsx)는 sticky header, 운영 hero strip, 요약 카드, matrix wrapper 톤을 바꿨고, dense matrix 본문 semantics는 유지했다.
- [components/student-nav.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-nav.tsx)와 [components/mobile-nav.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/mobile-nav.tsx)는 icon-first pill 탭 톤으로 재정렬했다.
- [components/access-gate-card.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/access-gate-card.tsx)도 같은 세계관으로 맞췄다.

Confidence: `source-backed`

## Rendered Proof

- `npm run build`: pass
- `npm run lint`: pass

Confidence: `rendered proof`

## Not Attempted

- 브라우저에서 `/auth/login`, `/student`, `/admin` 실화면 시각 확인
- 모바일 safe area와 실제 탭 터치 감도 확인
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`가 있는 환경에서 GIS success path 시각 확인
- `/admin/students`, `/admin/content`, `/student/class/[classId]` 톤 확장

## Remaining Risk

- 공통 UI 컴포넌트가 바뀌었기 때문에 1차 범위 밖 화면도 시각적으로 일부 영향받을 수 있다.
- build/lint는 통과했지만 실제 브라우저에서 admin matrix의 가독성이 충분한지는 아직 직접 확인하지 못했다.
