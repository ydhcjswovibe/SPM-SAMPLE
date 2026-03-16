# Reports Guide

## Purpose

`docs/reports/*`는 날짜가 붙은 검증 기록과 handoff evidence를 남기는 곳이다.
active 제품 truth를 다시 정의하지 않는다.

## Naming

- 형식: `YYYY-MM-DD-short-scope.md`
- 예시: `2026-03-16-profile-copy-and-guard-follow-up.md`

## Recommended Sections

상황에 맞는 최소 섹션만 쓴다.

- `Scope`
- `Commands`
- `Source-backed Review`
- `Rendered Proof`
- `Runtime-Proven`
- `Not Attempted`
- `Remaining Risk`

## Confidence Rule

- `source-backed`: 코드와 active docs를 읽고 확인했지만 interactive route 실행은 안 한 경우
- `rendered proof`: 실제 route HTML/화면 fallback을 열어 확인했지만 mutation success까지 실행하지 않은 경우
- `runtime-proven`: 실제 role/session/action을 끝까지 실행한 경우

더 강한 confidence를 evidence 없이 쓰지 않는다.

## Checklist

- touched scope를 첫 섹션에서 좁게 적는다
- 실행한 명령만 적는다
- 성공과 실패를 같이 적는다
- 안 한 검증은 `Not Attempted`에 남긴다
- 남은 risk가 있으면 마지막에 한 줄이라도 명시한다

## Template

새 report는 [TEMPLATE.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/reports/TEMPLATE.md)를 복사해 시작한다.
