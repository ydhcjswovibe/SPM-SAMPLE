# 2026-03-26 admin mobile session attendance + weekly reply

## Summary

- scope: 운영 mobile 출석부를 `세션 기반 실제 날짜` 구조로 재배치하고, 수업 생성/일정 관리/학생 주차 reply slot을 함께 연결했다.
- confidence: source-backed + local static verification

## What Changed

- admin `/admin`
  - matrix payload를 `session-first + legacy fallback` 구조로 바꾸고, mobile 출석부를 `주차 탭 + 학생 카드 + 실제 날짜별 버튼`으로 재배치했다.
  - create class dialog가 이름 + 반복 일정 rows를 같이 받도록 바뀌었다.
  - `일정 관리` dialog가 추가되어 owner는 반복 규칙, admin/owner는 월별 실제 수업 날짜를 관리할 수 있게 됐다.
- admin `/admin/content`
  - 실제 session이 있는 월에서는 session 기반 기본 주차를 고르고, 학생별 피드백 카드 아래에 학생 reply를 read-only로 노출한다.
- student `/student/lessons`
  - 선택한 주차 안에서 실제 수업 날짜 chip을 보고, 피드백이 있는 주차에 한해 주차별 단일 reply slot을 저장/수정할 수 있게 됐다.
- DB truth docs
  - `class_schedule_rules`, `class_sessions`, `session_attendance`, `student_week_feedback_replies` contract를 추가했다.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Remaining Gap

- connected Supabase에 새 schema/RLS/RPC truth를 아직 apply하지 않았으므로, session attendance / schedule / reply는 runtime-proven이 아니다.
- legacy 월과 새 session 월이 섞인 실제 운영 데이터에서는 rendered QA가 한 번 더 필요하다.
