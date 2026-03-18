# 2026-03-18 Usability Copy Structure Cleanup

## Scope

- `/auth/login` 이메일 로그인 form의 Enter submit, input 기본 속성, 중복 카피 정리
- `/student`, `/student/profile`의 상태 표현과 shortcut 구조 간소화
- `/admin`, `/admin/students`, `components/admin-matrix.tsx`의 helper copy와 touch/accessibility 정리
- mobile viewport zoom 차단 제거

## Commands

- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass

## Source-backed Review

- [app/layout.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/layout.tsx)에서 mobile viewport zoom 차단 설정을 제거했다.
- [components/auth-login-form.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/auth-login-form.tsx)에서 이메일 로그인 영역을 실제 `<form>`으로 정리하고, `name`/`autocomplete`/Enter submit 흐름을 복구했다.
- [components/student-nav.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-nav.tsx), [app/student/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/page.tsx), [components/student-class-detail-view.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/student-class-detail-view.tsx)에서 학생 헤더/상황판/주차 상세의 중복 상태 설명을 줄이고 더 짧은 표현으로 통일했다.
- [app/student/profile/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/student/profile/page.tsx)에서 초기 로딩과 오류를 분리하고, 다음 수업 반복 요약 대신 `수업 바로 가기` shortcut으로 정리했다.
- [components/admin-matrix.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/components/admin-matrix.tsx), [app/admin/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/admin/page.tsx), [app/admin/students/page.tsx](/home/ydhcjswo/projects/SPM_SAMPLE/app/admin/students/page.tsx)에서 운영 메인/helper copy를 더 짧게 줄이고 출석 변경 trigger의 accessibility label과 mobile touch target을 보강했다.

Confidence: `source-backed`

## Not Attempted

- 실제 모바일 브라우저에서 학생 헤더 select 폭, 로그인 Enter 제출감, admin matrix touch target을 수동으로 확인하지는 않았다.
- configured Google GIS success path와 connected Supabase helper RPC remote sync는 이번 패키지 범위에 포함하지 않았다.

## Remaining Risk

- 학생 헤더 control이 더 이상 숨겨진 가로 스크롤에 크게 의존하지 않도록 정리했지만, 작은 폭 기기에서 실제 노출과 조작 감각은 브라우저 확인이 남아 있다.
- admin matrix compact button은 source상 크기를 키웠지만, 실제 thumb reach와 오작동 빈도는 manual QA가 필요하다.
