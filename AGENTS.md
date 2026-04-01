# AGENTS.md

This file defines standing repository guidance for coding agents working in `IronCircle`.

Use this file for repo-wide architecture, editing, and validation expectations.

Use [`PLANS.md`](/Users/diegosoto/Documents/towson/IronCircle/PLANS.md) for task-specific ExecPlans when work is broad enough to require one.

## Project Scope

- The main app lives in `blueprnt/`.
- This is an Expo, React Native, Expo Router, and TypeScript project.
- Prefer changes that fit the current app structure instead of introducing new layers early.

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

An ExecPlan is usually not required for a very small local change, such as:

- a typo fix
- a narrow one-file refactor with no behavior change
- a tiny presentational tweak confined to one component

When in doubt, create an ExecPlan.

## ExecPlan Expectations

- ExecPlans live under `plans/`.
- File names should use `plans/<short-kebab-description>.execplan.md`.
- ExecPlans must follow the standards in `PLANS.md`.
- Keep the plan current as implementation evolves.

## Architecture Expectations

- Keep low-level HTTP behavior in `blueprnt/src/services/client.ts`.
- Put domain-specific API wrappers in `blueprnt/src/services/*.ts`.
- Service files should be plain `.ts` files, not `.tsx`.
- Screens and route files may own fetch and mutation state until reuse clearly justifies a custom hook.
- Presentational components should focus on rendering and user interaction, not API orchestration.
- Keep types aligned with the backend contract as closely as practical.

## Current API and Data-Flow Pattern

- `client.ts` is the shared HTTP layer and should remain generic.
- Domain calls should wrap `client.ts` in small named service modules such as:
  - `feed.ts`
  - `likes.ts`
  - future examples: `users.ts`, `posts.ts`, `plans.ts`
- Prefer small named exports such as `getFeed`, `likePost`, and `unlikePost`.
- Keep payload/response types near the service that uses them unless they are broadly reused.

## Home Feed Conventions

- The home feed route is currently `blueprnt/src/app/index.tsx`.
- Feed reads should go through `blueprnt/src/services/feed.ts`.
- Like/unlike calls should go through `blueprnt/src/services/likes.ts`.
- `PostCard` should stay mostly presentational and receive callbacks/loading flags through props.
- The feed API is expected to always return `likeCount` on `FeedPost`.

## Temporary Development Assumptions

- `TEST_USER_ID` in `blueprnt/src/app/index.tsx` is a temporary stand-in for the logged-in user.
- Temporary local/prod switching is acceptable during development, but the preferred end state is config or auth/session-driven values.
- `client.ts` may temporarily contain alternate base URLs for manual testing, but environment-driven configuration is preferred.

## UI and Interaction Guidance

- Keep tap targets intentional. If only an icon should trigger an action, do not attach the handler to the whole row.
- Disable controls while related API requests are in flight when that prevents duplicate requests or conflicting state.
- Prefer a simple non-optimistic mutation first when wiring a new action, then add optimistic UI later if needed.
- Preserve established component patterns unless there is a clear reason to extract or redesign.

## File and Reuse Guidance

- Put reusable UI in `blueprnt/src/components/`.
- Put route-local behavior in the relevant file under `blueprnt/src/app/` unless it is reused enough to justify extraction.
- Put reusable domain logic in `blueprnt/src/services/` or `blueprnt/src/hooks/` when reuse is real, not speculative.
- Avoid broad refactors that move many files unless the payoff is clear.

## TypeScript Guidance

- Prefer explicit types for API payloads and responses.
- If the backend guarantees a field is always present, keep the frontend type aligned with that guarantee.
- Avoid unnecessary optionality in app-critical response types.

## Validation Guidance

- Use `npx tsc --noEmit` as the default lightweight verification step after code changes.
- Use linting when available, but do not claim lint passed unless it actually ran in the current environment.
- When relevant, validate behavior in the Expo app on simulator, device, or web and describe what was verified.
- If full validation is not possible in the current environment, state exactly what was checked and what remains manual.

## Change Style

- Prefer small, incremental refactors over broad rewrites.
- Preserve user edits and local testing conveniences unless explicitly asked to remove them.
- Keep docs and plans in sync with meaningful architectural or workflow changes.
