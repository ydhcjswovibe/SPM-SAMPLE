# Roles

## 목적

이 문서는 역할 정의가 어디 있는지와 현재 기본 ownership를 짧게 보여 주는 index다.

## Role Map

- `Owner`: 제품 요구, 우선순위, acceptance, scope 결정. details: [owner.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/roles/owner.md)
- `Lead Builder`: package slicing / handoff / merge order / shared contract / high-risk integration. details: [lead-builder.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/roles/lead-builder.md)
- `Feature Builder`: bounded feature slice 구현. 필요하면 A/B 등 여러 슬롯이 같은 계약을 공유한다. details: [feature-builder.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/roles/feature-builder.md)
- `Verifier`: typecheck / build / route-role validation / runtime smoke / findings. details: [verifier.md](/home/ydhcjswo/projects/SPM_SAMPLE/docs/roles/verifier.md)

## Current Ownership

- `Owner`: `user`
- `Lead Builder`: package slicing / handoff / merge order / auth / role / redirect / server gate / shared helpers / admin shell-core / export / integration
- `Feature Builder A`: admin students / enrollment
- `Feature Builder B`: weekly media / student read flow
- `Verifier`: typecheck / build / route-role validation / runtime smoke / findings

## Update Rule

- 역할 정의를 바꾸면 각 역할 문서와 이 index를 함께 맞춘다.
- 현재 패키지 handoff와 시간축 상태는 `PROGRESS.md`에서 이어서 본다.
