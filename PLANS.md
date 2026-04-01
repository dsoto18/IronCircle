# Execution Plans for `IronCircle`

This document defines how to write and maintain an execution plan ("ExecPlan") for work in this repository. An ExecPlan is a living implementation document that a coding agent can follow from repository research through validation.

Every ExecPlan in this repository must follow this file and the standing repository guidance in `AGENTS.md`.

## Purpose

`IronCircle` is the frontend application for the `Blueprnt` project. It is built with Expo, React Native, Expo Router, and TypeScript. It consumes a backend REST API and implements the app's screens, reusable UI, client-side state, and request flows.

The goal of an ExecPlan is to make multi-step work safe, reviewable, and restartable. A contributor should be able to read only the ExecPlan and the current repository working tree, then complete the task and show that it works.

## Relationship to `AGENTS.md`

- `AGENTS.md` defines standing repository rules and architecture conventions.
- `PLANS.md` defines how task-specific ExecPlans should be written and maintained.
- ExecPlans should not repeat all of `AGENTS.md`; they should apply it to the task at hand.

## When an ExecPlan is required

Create and maintain an ExecPlan for any work that is not obviously a small, isolated change.

In this repository, an ExecPlan is required when work includes any of the following:

- behavior changes spanning multiple files or layers
- a new feature or a meaningful change to an existing feature
- a change affecting screens, components, types, and API calls together
- changes to service files, data flow, state ownership, or shared error handling
- changes to navigation structure, route layout, or reusable UI patterns
- changes to auth/session handling or environment configuration
- work likely to take more than one focused implementation session
- any task where a reviewer would benefit from a written plan before broader edits begin

Small, isolated changes may skip an ExecPlan, but when in doubt, create one.

## Where ExecPlans live

Create story-specific ExecPlans under `plans/`.

File naming convention:

- `plans/<short-kebab-description>.execplan.md`

Examples:

- `plans/add-like-post-flow.execplan.md`
- `plans/refactor-home-feed-data-loading.execplan.md`
- `plans/create-plan-details-screen.execplan.md`

## Required characteristics

Every ExecPlan must be:

- self-contained
- understandable by a newcomer to this repository
- specific about repository paths, file names, functions, components, hooks, services, and validation steps
- explicit about how to observe success in the app
- kept current as work proceeds

An ExecPlan is not only a design note. It must describe the actual implementation path and the exact validation steps required to prove the change works.

## Repository orientation for plan authors

Assume the reader does not know the codebase.

Describe the relevant repository layout directly in the plan.

Explain how the affected route, component, service, type, or config works today before describing the change.

When relevant, mention these common repository areas:

- `blueprnt/src/app/` for Expo Router route files and layouts
- `blueprnt/src/components/` for reusable UI
- `blueprnt/src/services/` for API/service wrappers
- `blueprnt/src/hooks/` for reusable client-side logic
- `blueprnt/src/types/` for domain types
- `blueprnt/src/mocks/` for fallback or development data
- `blueprnt/src/constants/` for design constants and theme values

## Architectural expectations to reflect in plans

Plans should preserve and work with the architecture described in `AGENTS.md`.

In particular, plans should usually reflect these expectations:

- generic HTTP behavior stays in `blueprnt/src/services/client.ts`
- domain API calls live in small service files under `blueprnt/src/services/`
- presentational components should not own API orchestration unless there is a strong reason
- route files may own fetch and mutation state until reuse clearly justifies a hook
- types should reflect the backend contract as closely as practical

## Required sections in every ExecPlan

Every ExecPlan must contain these sections unless a section is truly not applicable:

- `# <Title>`
- `## Purpose / Big Picture`
- `## Progress`
- `## Surprises & Discoveries`
- `## Decision Log`
- `## Outcomes & Retrospective`
- `## Context and Orientation`
- `## Plan of Work`
- `## Concrete Steps`
- `## Validation and Acceptance`
- `## Idempotence and Recovery`
- `## Artifacts and Notes`
- `## Interfaces and Dependencies`

If a section does not apply, say so explicitly instead of silently omitting it.

## Progress requirements

The `Progress` section must use checkboxes and timestamps once work has started.

Example:

- [x] (2026-03-31 15:20Z) Reviewed `blueprnt/src/app/index.tsx` and `blueprnt/src/components/post-card.tsx` to trace the home feed data flow.
- [x] (2026-03-31 15:45Z) Added `blueprnt/src/services/likes.ts` and connected the home screen to the like/unlike API.
- [ ] Validate the disabled-like-button behavior on simulator and device.

Every meaningful stopping point should be reflected in `Progress`. If work is partial, say what is complete and what remains.

## Decision log requirements

Every meaningful decision must be recorded in this format:

- Decision: Keep like/unlike mutation state in `blueprnt/src/app/index.tsx` instead of creating a hook yet.
  Rationale: The behavior is currently local to one route, so a hook would add indirection without reuse benefits.
  Date/Author: 2026-03-31 / Codex

Decisions should capture tradeoffs, not only outcomes.

## Commands and validation style

Concrete steps must include exact commands and working directories when command-line verification is relevant. Prefer commands that can be repeated without cleanup surprises.

When relevant, include commands for:

- TypeScript validation
- linting
- starting the Expo dev server
- running the app on iOS, Android, or web
- clearing Metro cache when that is part of recovery

Typical examples:

From `blueprnt/`, run:

```sh
npx tsc --noEmit
```

From `blueprnt/`, run:

```sh
npm run start
```

Expected outcomes should be written in human-verifiable terms such as:

- the TypeScript check exits successfully
- the affected screen renders without runtime errors
- tapping the intended control triggers the expected request flow
- loading, success, and error states behave as described
- a screen renders correctly on simulator, device, or web when applicable

Validation should not default to backend-style API proofs unless the frontend change truly depends on them.

## Frontend-oriented validation expectations

Because this repository is an Expo/React Native app, plans should usually describe validation in terms of app behavior, not only code changes.

When relevant, describe:

- which route or screen should be opened
- what user interaction should be performed
- what loading, success, and error states should appear
- whether validation should be checked on iOS, Android, web, or all three
- whether mock data or a live backend is expected during validation

If a task cannot be fully validated in the current environment, say what was validated locally and what remains for manual verification.

## Change management requirements

ExecPlans are living documents. When implementation changes direction:

- update `Plan of Work`
- update `Progress`
- add a `Decision Log` entry
- update `Validation and Acceptance` if the proof changes
- add a short note summarizing what changed and why if the direction changed materially

Do not leave outdated instructions in the plan after implementation changes.

## Idempotence and recovery expectations

Each ExecPlan must explain which steps are safe to repeat and how to recover from common partial-failure states.

Examples:

- restarting the Expo dev server
- clearing Metro cache
- re-running `npx tsc --noEmit`
- confirming environment variables or API base URL configuration before retrying
- reverting only the in-progress feature changes if recovery requires backing out work

## Interfaces and dependencies guidance

The `Interfaces and Dependencies` section should name the concrete surfaces affected by the task, such as:

- route files under `blueprnt/src/app/`
- reusable components under `blueprnt/src/components/`
- service modules under `blueprnt/src/services/`
- hooks under `blueprnt/src/hooks/`
- types under `blueprnt/src/types/`
- theme/constants files
- environment variables such as `EXPO_PUBLIC_API_BASE_URL`
- backend API endpoints the frontend depends on

Avoid backend-specific terms that do not apply here unless the task truly touches them.

Examples of terms that usually do not belong in plans for this repo unless explicitly relevant:

- middleware
- DTO classes
- Mongoose models
- container startup
- database migrations

## ExecPlan skeleton for this repository

Use this skeleton when creating a new plan.

```md
# <feature name>: <Short action-oriented title>

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Explain what user-visible behavior, data flow, or UI structure will exist after this change. State how someone can observe the change working in the Expo app.

## Progress

- [ ] Example step with timestamp once started.

## Surprises & Discoveries

- Observation: None yet.
  Evidence: N/A.

## Decision Log

- Decision: Initial placeholder.
  Rationale: Initial placeholder.
  Date/Author: YYYY-MM-DD / <author>

## Outcomes & Retrospective

Summarize what was achieved, what remains, and what was learned.

## Context and Orientation

Describe the relevant route files, components, services, hooks, types, config, and validation surfaces by full repository-relative path.

## Plan of Work

Describe, in prose, the exact edits required. Name files, components, functions, and state ownership precisely.

## Concrete Steps

From `blueprnt/`, run:

```sh
<command>
```

Expect:

```text
<short expected outcome>
```

## Validation and Acceptance

Describe the exact TypeScript checks, lint steps if available, and manual in-app behavior that prove success.

## Idempotence and Recovery

Explain which steps are safe to repeat and how to recover from partial changes or failed app/setup states.

## Artifacts and Notes

Include concise snippets, observations, screenshot references, or notes that help prove success.

## Interfaces and Dependencies

Name the route files, components, service functions, hooks, types, environment variables, and backend endpoints affected by this work.
```
