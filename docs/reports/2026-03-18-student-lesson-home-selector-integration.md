# 2026-03-18 Student Lesson Home Selector Integration

## Scope

- `/student`를 상단 월별 수업 선택기 + 선택된 수업 상세 구조로 통합
- 홈에서 보이던 선택 수업 상태 요약을 같은 화면 안으로 흡수
- `/student/class/[classId]`를 root 선택 상태로 이어지는 deep-link compatibility redirect로 정리
- 학생 수업 탭 구조 변경에 맞춰 `docs/SPEC.md`, `docs/VERIFY.md`, `PROGRESS.md`를 sync

## Commands

- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass

## Source-backed Review

- [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx)에서 학생 수업 탭을 `상단 수업 선택 -> 선택된 수업 요약 -> 주차 콘텐츠` 흐름으로 재구성했다.
- [components/student-class-detail-view.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-class-detail-view.tsx)를 추가해 선택된 주차의 영상/이미지/피드백 consume UI를 홈 안에서 직접 재사용하도록 정리했다.
- [app/student/class/[classId]/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/class/%5BclassId%5D/page.tsx)는 `/student?classId=...&yearMonth=...`로 redirect하도록 바꿔, 별도 상세 route 개념을 줄이고 deep-link만 유지했다.
- [docs/SPEC.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/SPEC.md), [docs/VERIFY.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/VERIFY.md), [PROGRESS.md](/home/ydhcjswo/projects/SPM_SAMPLE/PROGRESS.md)에 학생 수업 탭 통합과 후속 큐를 반영했다.

Confidence: `source-backed`

## Not Attempted

- 브라우저에서 `/student`의 상단 선택기 조작, 주차 전환, 이미지 확대를 직접 수동 확인하지는 않았다.
- `/auth/login`, `/student`, `/admin` 실화면 safe area / touch target / matrix 가독성 QA는 별도 후속 패키지로 남겼다.
- configured GIS success path와 connected Supabase helper RPC sync는 이번 패키지 범위에 넣지 않았다.

## Remaining Risk

- 학생 수업 선택기는 source-backed로만 확인됐기 때문에, 실제 모바일 브라우저에서 선택 전환과 스크롤 감각이 자연스러운지는 수동 확인이 남아 있다.
- `/student/class/[classId]` redirect는 build 기준으로 닫혔지만, 기존 deep-link 유입이 실제 브라우저에서 기대대로 root 선택 상태로 이어지는지 실화면 확인이 남아 있다.
