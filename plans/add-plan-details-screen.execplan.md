# Plan Details: Add a read-only full-plan viewer

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Add a Plan Details screen so a user browsing plans can tap a plan card and inspect the full plan structure returned by `GET /plan/:planId/full`. The first increment should show plan meta plus a readable Week -> Day overview, then use the same hybrid interaction model as the builder for deeper levels: tapping a day opens focused block details, and tapping a block opens focused item details. The details experience is read-only and should not reuse mutation/form-heavy builder components directly.

## Progress

- [x] (2026-05-13 03:36Z) Reviewed the current `PlanCard`, Plans tab route, root stack layout, plan types, and plan service helpers to scope the first details-screen increment.
- [x] (2026-05-13 03:42Z) Added `blueprnt/src/services/planHydration.ts` with shared key helpers and full-plan grouping, then updated `blueprnt/src/app/plan-builder.tsx` to use it.
- [x] (2026-05-13 03:42Z) Added `blueprnt/src/app/plan/[planId].tsx` as a read-only details route with loading, error, overview, focused day, and focused block states.
- [x] (2026-05-13 03:42Z) Made `PlanCard` accept an optional `onPress` and wired the Plans tab to navigate to `/plan/[planId]`.
- [x] (2026-05-13 03:42Z) Rendered plan meta, week/day overview, focused day block view, and focused block item view with no create/edit controls.
- [x] (2026-05-13 03:42Z) Ran `npx tsc --noEmit` from `blueprnt/`; it completed successfully.
- [x] (2026-05-13 03:42Z) Ran `npm run lint` from `blueprnt/`; it exited successfully with two pre-existing warnings in `blueprnt/src/app/(tabs)/explore.tsx`.
- [ ] Manually validate the details route in Expo against a live authenticated backend.

## Surprises & Discoveries

- Observation: The root layout already supports non-tab screens.
  Evidence: `blueprnt/src/app/_layout.tsx` defines a `Stack` with non-tab routes such as `plan-builder`.
- Observation: The browse route currently renders `PlanCard` without a navigation callback.
  Evidence: `blueprnt/src/app/(tabs)/plans.tsx` calls `<PlanCard plan={item} />`, and `PlanCard` wraps content in a `Pressable` with no `onPress`.
- Observation: Full-plan hydration logic currently lives inside the builder route.
  Evidence: `blueprnt/src/app/plan-builder.tsx` contains local key helpers and `buildHydratedDraft()`.

## Decision Log

- Decision: Build a read-only details viewer instead of reusing `PlanBuilderShell` directly.
  Rationale: The builder owns draft state, forms, mutation loading, and publish controls, while details should be a browsing/consumption surface with no authoring affordances.
  Date/Author: 2026-05-13 / Codex
- Decision: Use the same hybrid hierarchy pattern as the builder.
  Rationale: Week and day summaries are readable in the overview, but blocks and items need focused screens/surfaces to avoid cramped nested cards on mobile.
  Date/Author: 2026-05-13 / User + Codex

## Outcomes & Retrospective

The first increment is implemented. The Plans tab can now open a read-only Plan Details route. The details route hydrates the full plan response, renders plan metadata and Week -> Day structure, and uses focused Day and Block views for deeper Block and Item content.

## Context and Orientation

- `blueprnt/src/app/(tabs)/plans.tsx` loads browse plans through `getPlans()` and renders each result with `PlanCard`.
- `blueprnt/src/components/plan-card.tsx` renders a plan summary card and is the right place to accept an optional `onPress` callback.
- `blueprnt/src/services/plans.ts` already exports `getFullPlan(planId)`, which returns flat plan-partition items.
- `blueprnt/src/app/plan-builder.tsx` currently groups full-plan items into plan meta, weeks, days, blocks, and items for draft resume.
- `blueprnt/src/types/plan.ts` defines `HydratedPlanDraft`, `PlanWeek`, `PlanDay`, `PlanBlock`, `PlanItem`, and `FullPlanItem`.

## Plan of Work

First extract the full-plan grouping logic from the builder route into a small shared service/domain helper. Keep the output shape compatible with `HydratedPlanDraft` so the builder can keep using it and the details screen can render the same grouped plan tree. Add stable key helpers for week, day, and block lookup.

Next add a details route such as `blueprnt/src/app/plan/[planId].tsx` and register it in the root stack if needed. The route should read `planId` from Expo Router params, fetch `getFullPlan(planId)`, hydrate the flat result, and handle loading/error/missing-plan states.

Then make `PlanCard` accept `onPress?: () => void` and wire the Plans tab to navigate to `/plan/${plan.planId}` when a card is tapped. The details route should render plan meta at the top, followed by weeks and day cards. Tapping a day should swap the local details view into that day’s blocks. Tapping a block should swap into that block’s items. Back actions should move from block -> day -> plan overview.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, keep this ExecPlan current.

In `blueprnt/src/services/planHydration.ts`, add shared key helpers and `buildHydratedPlanDraft(items: FullPlanItem[])`.

Expect:

```text
Both builder resume and plan details can hydrate full-plan API responses without duplicating grouping logic.
```

In `blueprnt/src/app/plan-builder.tsx`, replace the local hydration helpers with the shared helper.

Expect:

```text
Draft resume behavior remains unchanged.
```

In `blueprnt/src/app/plan/[planId].tsx`, add the read-only details route.

Expect:

```text
Opening /plan/<planId> fetches the full plan, shows plan meta and week/day structure, and supports focused day/block navigation.
```

In `blueprnt/src/components/plan-card.tsx` and `blueprnt/src/app/(tabs)/plans.tsx`, wire card taps into the details route.

Expect:

```text
Tapping a plan card from the Plans tab opens the Plan Details screen for that plan.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully.
```

## Validation and Acceptance

- Run `npx tsc --noEmit` from `blueprnt/`.
- If practical, run `npm run lint` from `blueprnt/`.
- Open the Plans tab and confirm existing browse/search/filter UI still renders.
- Tap a plan card and confirm the app opens the details route.
- Confirm the details route shows loading, error, and missing-plan states appropriately.
- Confirm a full plan with weeks and days renders as a readable overview.
- Confirm tapping a day opens a focused block view.
- Confirm tapping a block opens a focused item view.
- Confirm back actions move from block detail to day detail to plan overview, then back to Plans.

## Idempotence and Recovery

- Re-running `npx tsc --noEmit` and `npm run lint` is safe.
- Re-opening the details route is safe; it only reads plan data.
- If `GET /plan/:planId/full` returns unexpected entity labels, update the shared hydration helper before changing UI rendering.
- If the first details component grows too large, extract read-only subcomponents under `blueprnt/src/components/plan-details-*.tsx` without changing the route contract.

## Artifacts and Notes

- Validation artifact:
  - `npx tsc --noEmit` passed from `blueprnt/` on 2026-05-13 03:42Z.
  - `npm run lint` exited successfully from `blueprnt/` on 2026-05-13 03:42Z, with existing warnings in `blueprnt/src/app/(tabs)/explore.tsx`.
- Likely files to update:
  - `blueprnt/src/app/(tabs)/plans.tsx`
  - `blueprnt/src/app/_layout.tsx`
  - `blueprnt/src/app/plan/[planId].tsx`
  - `blueprnt/src/app/plan-builder.tsx`
  - `blueprnt/src/components/plan-card.tsx`
  - `blueprnt/src/services/planHydration.ts`
- Expected V1 details behavior:
  - read-only
  - no enroll/start action yet
  - no edit/delete/publish controls
  - no deeply nested block/item cards in the overview

## Interfaces and Dependencies

- Route files:
  - `blueprnt/src/app/(tabs)/plans.tsx`
  - `blueprnt/src/app/plan/[planId].tsx`
  - `blueprnt/src/app/_layout.tsx`
- Components:
  - `blueprnt/src/components/plan-card.tsx`
  - possible read-only details components under `blueprnt/src/components/`
- Services:
  - `blueprnt/src/services/plans.ts`
  - `blueprnt/src/services/planHydration.ts`
- Types:
  - `blueprnt/src/types/plan.ts`
- Backend endpoint:
  - `GET /plan/:planId/full`
