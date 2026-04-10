# Plans API wiring: Load browse screen from GET /plans

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Replace the `Plans` tab's mock-data source with the real backend `GET /plans` route so the browse screen renders plans from the database. Success is observable in the Expo app when `blueprnt/src/app/plans.tsx` loads live plan records through a new `blueprnt/src/services/plans.ts` helper, continues to support local search/type filtering, and handles loading or failed requests without crashing.

## Progress

- [x] (2026-04-10 01:54Z) Reviewed `blueprnt/src/app/plans.tsx`, `blueprnt/src/components/plan-card.tsx`, `blueprnt/src/services/client.ts`, and the prior plans-screen ExecPlan to trace the current browse flow.
- [x] (2026-04-10 01:54Z) Reviewed the user-updated `blueprnt/src/types/plan.ts` and `blueprnt/src/mocks/plans.ts` to align this task to the current backend contract.
- [x] (2026-04-10 01:56Z) Added `blueprnt/src/services/plans.ts` and wired `blueprnt/src/app/plans.tsx` to fetch `GET /plans`, unwrap `{ plans: Plan[] }`, and render loading/error states around the existing browse filters.
- [x] (2026-04-10 01:56Z) Updated `blueprnt/src/components/plan-card.tsx` to use the current `Plan` fields and tolerate optional metadata fields from the API.
- [x] (2026-04-10 01:56Z) Ran `npx tsc --noEmit` from `blueprnt/`; it completed successfully.

## Surprises & Discoveries

- Observation: The current `Plan` type has already been reshaped to match the backend response wrapper contents, including renamed creator/id fields and optional engagement metadata.
  Evidence: `blueprnt/src/types/plan.ts` now uses `planId`, `creator`, and optional `rating` / `enrollmentCount`.
- Observation: `PlanCard` still references pre-refactor fields and assumes `rating` is always present, which would break once live API data is used.
  Evidence: `blueprnt/src/components/plan-card.tsx` reads `plan.creatorName` and calls `plan.rating.toFixed(1)`.

## Decision Log

- Decision: Keep plans fetching state inside `blueprnt/src/app/plans.tsx` rather than introducing a new hook.
  Rationale: The browse request is still local to one route, and this follows the current repo pattern of keeping route-owned fetch state close to the screen until reuse is proven.
  Date/Author: 2026-04-10 / Codex
- Decision: Model the new service helper around the backend response wrapper `{ plans: Plan[] }` instead of flattening the HTTP helper itself.
  Rationale: `client.ts` should remain generic, while domain-specific response shapes belong in the plans service module.
  Date/Author: 2026-04-10 / Codex
- Decision: Make `PlanCard` resilient to missing optional fields instead of forcing placeholder data into the service layer.
  Rationale: The type already reflects the backend contract, so the presentational layer should gracefully omit or substitute optional UI elements when data is absent.
  Date/Author: 2026-04-10 / Codex

## Outcomes & Retrospective

- The `Plans` route now reads from the real backend service path instead of local mock data.
- Search and type-filter behavior remain route-local and now operate on fetched results.
- `PlanCard` now renders the updated `Plan` contract and avoids crashing when optional engagement fields are missing.
- TypeScript validation passes locally; Expo/manual runtime verification against a live API remains the main follow-up check.

## Context and Orientation

- `blueprnt/src/app/plans.tsx` currently renders the browse experience, owns local search/type filter state, and still imports `mockPlans` from `blueprnt/src/mocks/plans.ts`.
- `blueprnt/src/components/plan-card.tsx` is the presentational plan tile used by the `Plans` screen.
- `blueprnt/src/services/client.ts` is the shared generic HTTP wrapper and should remain the only low-level fetch layer.
- `blueprnt/src/services/feed.ts` is the current example of the repo's service-wrapper pattern: a small typed function around `client.ts`.
- `blueprnt/src/types/plan.ts` now mirrors the backend plan contract used by `GET /plans`.
- `blueprnt/src/mocks/plans.ts` remains useful as local sample data, but the live plans route should no longer depend on it for the main browse screen.

## Plan of Work

Add a new `blueprnt/src/services/plans.ts` module with a typed `getPlans()` function that calls `client.get` against `/plans` and unwraps the `{ plans: Plan[] }` response. Update `blueprnt/src/app/plans.tsx` to fetch on mount, store the loaded plans locally, and preserve the existing search and type-filter behavior against fetched results. Add simple loading and error states in the route so network dependency does not produce a blank or broken screen. Then update `blueprnt/src/components/plan-card.tsx` so it uses the renamed fields from `Plan` and safely renders when optional metadata like `rating`, `enrollmentCount`, or `coverImageUrl` are absent.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, keep this ExecPlan current as implementation proceeds.

Expect:

```text
The repository contains plans/wire-plans-api.execplan.md with updated progress and decisions.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully after the plans service, route updates, and PlanCard adjustments are in place.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npm run start
```

Expect:

```text
Expo launches and the Plans tab loads backend data from GET /plans while still supporting search and type filtering.
```

## Validation and Acceptance

- Run `npx tsc --noEmit` from `blueprnt/`.
- If environment and API connectivity allow, launch Expo and open the `Plans` tab.
- Confirm the screen requests data through `GET /plans` instead of reading `mockPlans`.
- Confirm the list renders returned plans, and search/type filters still narrow the visible results.
- Confirm a loading state appears before the request resolves.
- Confirm a readable error state appears if the request fails.
- Confirm plans with missing optional fields such as `rating`, `enrollmentCount`, or `coverImageUrl` do not crash the card UI.

## Idempotence and Recovery

- Re-running `npx tsc --noEmit` is safe and should remain the default verification step.
- Re-running Expo with `npm run start` is safe; if Metro gets stuck, restart it and clear cache with `npm run start -- --clear` if needed.
- Re-trying the screen fetch is safe because `GET /plans` is read-only.
- If live API validation fails unexpectedly, verify `EXPO_PUBLIC_API_BASE_URL` or the local base URL in `blueprnt/src/services/client.ts` before changing UI code.
- If partial edits cause regressions, restore only the in-progress plans feature files rather than unrelated route changes elsewhere in the app.

## Artifacts and Notes

- New service file to add:
  - `blueprnt/src/services/plans.ts`
- Main route to update:
  - `blueprnt/src/app/plans.tsx`
- Presentational compatibility update:
  - `blueprnt/src/components/plan-card.tsx`
- Existing mock data file remains in the repo unless explicitly removed later:
  - `blueprnt/src/mocks/plans.ts`

## Interfaces and Dependencies

- Route file:
  - `blueprnt/src/app/plans.tsx`
- Reusable component:
  - `blueprnt/src/components/plan-card.tsx`
- Service modules:
  - `blueprnt/src/services/client.ts`
  - `blueprnt/src/services/plans.ts`
- Types:
  - `blueprnt/src/types/plan.ts`
  - `blueprnt/src/types/index.ts`
- Development data:
  - `blueprnt/src/mocks/plans.ts`
- Environment/runtime dependencies:
  - `EXPO_PUBLIC_API_BASE_URL`
  - backend endpoint `GET /plans` returning `{ plans: Plan[] }`
