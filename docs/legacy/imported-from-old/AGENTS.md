# AGENTS.md

## Language Rule

All agents should respond in Korean for explanations, analysis, QA results, and slice proposals.
Code snippets may remain in English.

## Purpose

This repository uses Codex CLI with a docs-driven workflow.
`AGENTS.md` is the stable operating contract, not a prompt library.
Role docs in `docs/roles/*` are quick checklists that supplement this file and never override it.

## Read / Source Of Truth

Read only what is necessary, in this order:
1. `AGENTS.md`
2. `docs/roles/<ROLE>.md` when a specific role is active
3. `docs/WORKSTREAMS.md` when overall project status or major task units matter
4. `docs/PLAN.md`
5. `PROGRESS.md`
6. `docs/VERIFY.md` before validation / QA / deploy tasks
7. `docs/SPEC.md` only when product scope or feature intent matters
8. `docs/db/SCHEMA.sql`, `docs/db/RLS.sql`, `docs/db/RPC.sql` when DB / auth / RLS / RPC is involved

- Product intent: `docs/SPEC.md`
- Overall workstream status: `docs/WORKSTREAMS.md`
- Current execution priority: `docs/PLAN.md`
- Latest confirmed reality and handoff: `PROGRESS.md`
- Validation standard: `docs/VERIFY.md`
- DB / auth truth: `docs/db/*`

If docs conflict, verify current implementation / state first, then sync docs.
Do not invent schema, policy, or RPC behavior from UI assumptions.

## Core Contract

- Prefer small, reviewable work packages.
- Keep scope, implementation, and docs synchronized.
- Do not widen scope without explicit reason.
- Preserve working behavior unless the task requires change.
- Document uncertainty and remaining risk clearly.
- Every package must declare `Kind` and `Code Change Allowed` before role assignment.
- Keep stable rules here, summary / handoff in `PROGRESS.md`, and detailed completion reports in `docs/reports/*`.

## Execution Boundaries

- Default team shape: `Owner + Builder 1 + Builder 2 + Reviewer`; activate only the roles actually needed.
- Owner plans only: classify risk, choose execution mode, assign lanes, define merge order, and issue Builder-ready requests.
- Any active role may update `PROGRESS.md`; the role that finished the meaningful package writes its own summary / handoff entry there instead of delegating write-back.
- `AGENTS.md` defines the default parallelizable boundary: route-local only, with `Builder 1` for `/student` and `Builder 2` for `/admin`.
- `PROGRESS.md` records the live lane claim summary for the current package: lane / role / kind / code-change-allowed / scope / merge dependency; include owner or worktree / branch only when coordination actually needs it.
- If a package is `proof-then-code`, split it into `QA -> Builder` instead of mixing both roles in one lane.
- Use `single-lane` for auth / redirect / role / route protection / shared session-view-state / shared home surfaces / payment / attendance / schema / RLS / RPC work.
- Use `limited-parallel` only for clearly separated route-local work, with separate worktrees or dedicated branches.
- If Builder code changed, run Reviewer before calling the package complete.
- Add QA only when auth / mutation / export / DB-sensitive paths need merged verification.

## Approval and Command Rules

- Routine local non-destructive read / search / git-inspect / lint / typecheck / build / test commands do not need user approval; run them without asking.
- Do not create extra approval pauses for ordinary local developer commands inside an approved package.
- Destructive commands, network / install / download work, sandbox escalation, DB-truth changes, and hard-to-reverse actions require explicit confirmation.
- Once the user approves one bounded work package, the assigned Builder may complete investigation, implementation, minimum validation, and obvious docs sync without re-asking unless a new high-risk boundary appears.
- Stop and escalate if schema / RLS / RPC intent is unclear, docs conflict materially, the safest fix is unclear, or a change crosses multiple high-risk boundaries at once.

## Reporting

Keep outputs concise.
Separate verified facts from inference.
State remaining risk clearly.
Use the role-specific format in `docs/roles/<ROLE>.md`.
Meaningful role-completion reports belong in `docs/reports/*`; keep `PROGRESS.md` focused on cumulative status and history.
Use report filenames in the form `YYYY-MM-DD-work-id-role.md`.

## Docs Sync Rules

- Update `docs/SPEC.md` when product scope or user-visible capability changed.
- Update `docs/roles/*` when stable role-specific workflow changed.
- Update `docs/WORKSTREAMS.md` when overall workstream status or major task-unit boundaries changed.
- Update `docs/PLAN.md` when current / next priorities changed.
- Update `PROGRESS.md` after meaningful completed work with current status, blockers, and handoff context; keep it summary-level and put detailed role-completion reports in `docs/reports/*`.
- Update `docs/VERIFY.md` when validation standards changed.
- Update `docs/db/*` when schema / RLS / RPC truth changed.
- Do not leave docs knowingly inconsistent.

## Practical Guardrails

- Do not reintroduce removed features without explicit planning.
- For auth / mobile / in-app-browser issues, be conservative and document what was actually verified.
- For DB / auth work, verify against `docs/db/*` before coding.
