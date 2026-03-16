# VERIFY.md

## Purpose

This document defines the practical validation checklist for the current project.
It is not a changelog or a dated QA diary.
Date-specific QA results belong in `docs/reports/*`.

## Validation Baseline

Run the smallest relevant baseline when code changed:
- lint
- typecheck
- build when the change can affect compilation or release confidence

Default commands:
- `npm run typecheck`
- `npm run verify:baseline`
- `npm run verify:full`
- `npm run harness:report`

Practical note:
- if `npm run typecheck` fails only because `tsconfig.json` includes `.next/types/**/*.ts` and those files are missing, run `npm run build` once and rerun `npm run typecheck`
- when this rerun passes, record the first failure as a build-artifact/setup issue, not as a product regression

If one check is unavailable or intentionally skipped, say so explicitly.
If the package is docs-only, commands are optional; say which source docs or reports were consulted instead.

## Focused Checks

### Admin / Matrix read paths
- page renders
- critical table data loads
- filters / search still behave as expected
- touched area has no obvious broken interaction
- access-sensitive GET contract stays explicit:
  - anonymous -> `401 AUTH_REQUIRED`
  - signed-in non-admin -> `403 ADMIN_REQUIRED`
  - `OWNER` / `ADMIN` -> success

### Payment / Attendance mutations
- allowed role can trigger the mutation
- success is reflected in the UI
- denied or invalid cases are visible
- no silent success on failure
- when the contract changed, keep outcomes distinguishable:
  - anonymous -> auth-required
  - signed-in non-admin -> admin-required
  - allowed role + missing target -> not-found

### Student read flow / weekly content consume UI
- selected class -> week -> content order is still understandable
- touched cards, tabs, and panels do not disagree on `loading` / `syncing` / `empty` / `selection-needed` / `all-clear` meaning
- current selection label matches the actual selected class and week, or clearly says that nothing is selected
- CTA labels match the real action:
  - tab move
  - class or week selection
  - read-state refetch
  - logout
- wrong-role, recovery, and refetch meaning stays unchanged unless the package explicitly targeted those flows

### Admin mutation confidence UI
- separate the claim before sign-off:
  - source-backed UI confidence:
    - running / saved / error / retry labels match reachable code paths
    - raw keys or internal ids are not exposed as operator-facing copy
    - denied / invalid / retry states stay distinguishable in the touched UI
  - runtime-proven mutation confidence:
    - an actual allowed admin session executed at least one success case
    - and at least one failure or retry-recovery case when that path was claimed
    - the observed UI matched the claimed running / saved / error feedback
- if no interactive mutation was executed, keep the result `source-backed` only and do not report it as runtime-proven

### Route-local copy / state alignment
- touched labels, helper text, status chips, and empty/error copy must match the real reachable state in the touched block
- when the same state is shown on mobile and desktop surfaces, label and tone should keep the same meaning unless the package explicitly changed that rule
- internal contract words such as `row`, `scope`, `class_log`, `media_id`, `upload_method`, or `storage contract` should not leak into operator-facing or student-facing copy unless the product text intentionally requires them
- if the interaction contract itself did not change, a file-scoped source-backed review is enough; say explicitly that runtime proof was not attempted

### Route-local local-mock / prototype truth
- copy explicitly says `local mock`, `prototype`, or equivalent when no real contract exists
- copy does not imply cross-route, cross-role, persisted, uploaded, published, or permission-backed truth unless implementation actually proves it
- if the current mock scope is narrower than product intent, say the current scope explicitly:
  - selected week only
  - `class + week`
  - local state in this tab only
- helper lines, success messages, and status chips must stay inside the actual mock scope and must not overclaim student-visible or admin-visible truth

### Auth / Access behavior
- login entry works
- logout still works
- protected page access still behaves correctly
- unauthorized users do not see misleading success states
- when fallback UX changed, check the active routes directly:
  - `/`
  - `/student`
  - `/admin/matrix`

### CSV / Export
- export action is visible only where intended
- export still works for the allowed role
- denied roles do not get misleading export behavior

### Mobile / Preview / Callback changes
- page still opens
- key action is reachable
- auth guidance is still accurate
- preview/prod redirect assumptions are not mixed
- no obvious redirect loop appears

## High-Risk Triggers

Do not stop at lint or typecheck when touching:
- role / access rules
- auth flow
- redirect / callback behavior
- payment mutation logic
- attendance mutation logic
- export permission behavior
- RLS / RPC / DB schema
- mobile / in-app browser sensitive flows

## DB / Auth Consistency

When DB or auth behavior is involved, verify against:
- `docs/db/SCHEMA.sql`
- `docs/db/RLS.sql`
- `docs/db/RPC.sql`

Check that:
- UI assumptions match schema / RPC intent
- permission assumptions are still valid
- denied actions are not exposed as if they should succeed

If code and docs disagree, report it explicitly.
Do not paper over DB / auth truth mismatches in UI code alone.

## Documentation Check

When behavior changed, confirm the right docs were updated:
- `docs/SPEC.md` for user-visible scope changes
- `docs/WORKSTREAMS.md` for overall workstream status or major task-unit changes
- `docs/PLAN.md` for priority changes
- `PROGRESS.md` for meaningful completed work and handoff
- `docs/db/*` for schema / RLS / RPC truth changes

## Parallel / Merge Check

Run this when two or more lanes changed code or docs in the same work cycle:
1. each lane completes its own focused validation
2. after merge, run one combined smoke pass on the merged result
3. if auth / role / mutation / export changed across lanes, re-check denied and fallback paths after merge
4. if any lane touched DB / auth truth, re-read `docs/db/*` before sign-off
5. state unresolved overlap or merge risk explicitly

## Confidence Levels

### Source-backed
Use when the task is a narrow branch / contract check or runtime tooling is unavailable.
Say clearly that the result is source-backed, not rendered proof.

### Rendered proof
Prefer when fallback UX clarity, route protection, or release confidence is in question.
Say which routes and states were actually observed.

### Runtime-proven
Use when an interactive route or mutation was actually executed end-to-end.
Say the exact route, role, action, and observed outcome.
For mutation confidence, prefer this level before claiming operator trust.

## Handoff Evidence Minimum

### Builder
- changed files
- minimal validation actually run, or docs-only reason why no command was needed
- claimed confidence level:
  - source-backed
  - rendered proof
  - runtime-proven
- if local mock or prototype UI was touched, the current truth scope and unopened contracts

### Reviewer
- findings or `No findings` with touched scope
- confidence level used for the review
- explicit statement when runtime proof was not attempted
- whether copy, helper text, or status labels overclaim contract, scope, or visibility

### QA
- route, role, state, and action actually observed
- what was runtime-proven versus still source-backed
- remaining gap and what must happen before the package can be treated as higher confidence

## Reporting Rule

Keep validation reporting concise and honest:
- what was checked
- what passed
- what failed
- what was not checked
- remaining risk

Separate runtime-proven results from inference.
Do not let a stronger confidence label appear in the report than the evidence actually supports.

## What This File Is Not

This file is not:
- a changelog
- a one-time QA diary
- a design philosophy note

Use:
- `PROGRESS.md` for current state and history
- `docs/reports/*` for dated QA results
- `AGENTS.md` for operating rules
