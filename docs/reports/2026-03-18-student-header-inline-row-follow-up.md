# 2026-03-18 Student Header Inline Row Follow-Up

## Scope

- 학생 헤더에서 `수업 선택`, `월 선택`을 `SPM`과 같은 줄에 오도록 재배치
- 헤더 안 선택기의 폭을 더 압축해 한 줄 밀도를 높임
- 학생 메인 상황판의 기존 `수강중 / 2026.03 / 클래스명` 묶음 제거 상태 유지

## Commands

- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass

## Source-backed Review

- [components/student-nav.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-nav.tsx)에서 `Student Home` 라벨 아래 줄에 `SPM + 수업 선택 + 월 선택`이 같은 가로 라인에 오도록 재정렬했다.
- 헤더 안 select는 `min-w`를 줄이고 가로 스크롤 가능한 inline row로 바꿔, 좁은 폭에서도 줄바꿈 대신 같은 줄 정렬을 우선하게 했다.

Confidence: `source-backed`

## Not Attempted

- 실제 모바일 브라우저에서 같은 줄 정렬이 시각적으로 충분히 안정적인지 수동 확인은 하지 않았다.

## Remaining Risk

- 구현상 한 줄 정렬은 유지되지만, 좁은 폭에서 select 가로 스크롤 감각이 자연스러운지는 브라우저 확인이 남아 있다.
