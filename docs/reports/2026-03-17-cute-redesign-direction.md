# 2026-03-17 Cute Redesign Direction

## Scope

- 1차 리디자인 범위를 `/auth/login`, `/student`, `/admin` 3화면으로 고정
- 듀오링고 컴포넌트 레퍼런스 Figma를 형태 언어 기준으로만 채택
- SPM 팔레트는 `민트 + 블루 + 크림`, 기본 캐릭터는 `물방울 젤리형` 정적 마스코트 1종으로 정리
- `/admin/students`, `/admin/content`, `/student/class/[classId]`, 아이템 변주, 인터랙티브 애니메이션은 후속 범위로 보류

## Commands

- `sed -n '1,220p' app/admin/page.tsx`
- `sed -n '1,220p' app/student/page.tsx`
- `sed -n '1,220p' components/auth-login-form.tsx`
- `sed -n '1,240p' components/student-nav.tsx`
- Figma MCP `get_metadata(fileKey=PjTHnLhk5W8jPCOtWsiSaV, nodeId=0:1)`

## Source-backed Review

- 레퍼런스 Figma: [DuoLingo Design System Community](https://www.figma.com/design/PjTHnLhk5W8jPCOtWsiSaV/DuoLingo-Design-System--Community-?node-id=0-1&p=f&t=RQnF7WZqywuz64RG-0)
- 1차에 직접 참고할 컴포넌트 범위는 `Button(8:1085)`, `Progress Bar(8:1124)`, `Bottom Nav(8:2043)`, `Header(10:1046)`, `Icons(8:552)`, `Phone(11:4092)`로 좁혔다.
- [components/auth-login-form.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/auth-login-form.tsx)는 기존 auth flow를 유지한 채 hero, CTA hierarchy, QA card 톤만 리디자인하기 적합하다.
- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx)는 요약 카드 3종, 수업 카드 리스트, progress bar 구조가 이미 있어 듀오형 progress-first 톤을 이식하기 쉽다.
- [app/admin/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/admin/page.tsx)는 header, stats cards, class selector, export/action 진입부까지만 1차 리디자인 대상으로 삼고, dense matrix 본문 semantics는 유지하기로 정리했다.
- [components/student-nav.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-nav.tsx)와 [components/mobile-nav.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/mobile-nav.tsx)는 하단 탭 baseline은 유지하고 icon-first 듀오형 tone으로만 재해석한다.
- 기본 캐릭터는 `물방울 젤리형` 정적 마스코트 1종으로 고정하고, 1차 포즈는 `base`, `welcome` 2종만 허용한다.

Confidence: `source-backed`

## Not Attempted

- 새 Figma 파일 생성 및 프레임 작성
- 실제 UI 구현
- `npm run build`, `npm run lint` 기준 리디자인 검증
- 아이템 액세서리, 애니메이션, 후속 화면 확장

## Remaining Risk

- 현재 결정은 방향 고정 단계라 실제 Figma 시안과 runtime 화면에서 admin 판독성이 유지되는지 아직 검증되지 않았다.
- 듀오 레퍼런스를 강하게 쓰되 SPM 고유 컬러/캐릭터로 충분히 분리되지 않으면 시각적 모방 인상이 남을 수 있다.
