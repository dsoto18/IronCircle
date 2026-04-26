# Plan builder V1: Create nested plan nodes from a dedicated builder screen

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Add a first-pass plan creation flow to the app so an author can create a plan shell and then progressively add weeks, days, blocks, and items beneath it using the existing backend `POST` routes. Success is observable in the Expo app when the published-plan browse tab stays focused on discovery, while a dedicated builder screen exposes the nested draft-building UI with stacked sections, parent-first creation rules, inline loading/error states, and read-only submitted nodes after each successful create request.

## Progress

- [x] (2026-04-10 02:03Z) Reviewed the current tab layout, `Plans` route, shared service pattern, existing `Collapsible` primitive, and the latest `Plan` type to choose a minimal builder entry point.
- [x] (2026-04-10 02:03Z) Captured the user-provided DynamoDB hierarchy and create-route DTOs for plan shell, week, day, block, and item creation.
- [x] (2026-04-10 03:05Z) Aligned plan image naming from `coverImageUrl` to `imageUrl` across the frontend plan domain type and existing mock usage.
- [x] (2026-04-10 03:05Z) Added the first create-route service helper in `blueprnt/src/services/plans.ts` for shell creation with `POST /:userId/plans`.
- [ ] Introduce frontend-only builder draft types that model nested editable state separately from API record types.
- [x] (2026-04-10 03:05Z) Extended `blueprnt/src/app/plans.tsx` with an inline builder entry point and the first create-only shell UI for plan metadata submission.
- [x] (2026-04-10 03:13Z) Extracted the shell builder UI and local create logic into `blueprnt/src/components/plan-builder-shell.tsx` so `blueprnt/src/app/plans.tsx` stays focused on screen-level browse orchestration.
- [x] (2026-04-10 13:32Z) Added `PlanWeek` typing, a typed `createWeek` service helper, and the first child-node builder flow so saved plan shells can now create and render read-only week summaries.
- [x] (2026-04-10 15:03Z) Added `PlanDay` typing, a typed `createDay` service helper, and nested per-week day creation so each week now owns its own inline day form and saved day cards.
- [x] (2026-04-26 17:45Z) Moved tab routes into a `(tabs)` route group, added a dedicated `plan-builder` screen, and replaced the inline builder on the browse page with a launch card linking to the separate builder flow.
- [x] (2026-04-26 18:10Z) Added a `My Plans` mode to the dedicated builder page with a typed `getUserPlans` helper and a simple user-specific list of plan titles and statuses.
- [x] (2026-04-10 03:05Z) Ran `npx tsc --noEmit` from `blueprnt/`; it completed successfully after the shell-builder slice.

## Surprises & Discoveries

- Observation: The current navigation layout is just tabs, with no existing stack/modal route structure around `Plans`.
  Evidence: `blueprnt/src/app/_layout.tsx` renders `AppTabs` directly, and the tab components currently expose only the main tab routes.
- Observation: The repository already has a simple `Collapsible` UI primitive that can be adapted or reused for a stacked node-builder experience.
  Evidence: `blueprnt/src/components/ui/collapsible.tsx` provides a minimal expand/collapse wrapper with themed styling.
- Observation: The frontend still uses `coverImageUrl` in the plan domain type and mocks, but the backend contract uses `imageUrl`.
  Evidence: `blueprnt/src/types/plan.ts` and `blueprnt/src/mocks/plans.ts` still reference `coverImageUrl`.
- Observation: The existing `Plans` screen is already the home of plan browsing and is the least disruptive place to stage a V1 builder behind a local toggle.
  Evidence: `blueprnt/src/app/plans.tsx` owns the fetch/filter state for plans and already presents the plan library UI.

## Decision Log

- Decision: Ship the builder inline on `blueprnt/src/app/plans.tsx` rather than introducing a dedicated route in V1.
  Rationale: This avoids routing/layout churn, keeps the first version small, and allows the new create flow to live next to the browse surface where plans already exist.
  Date/Author: 2026-04-10 / Codex
- Decision: Make V1 strictly create-only and treat successfully submitted nodes as read-only snapshots.
  Rationale: The backend currently supports `POST` creation but not update flows, so the UI should reflect that limitation instead of implying editable saved records.
  Date/Author: 2026-04-10 / User + Codex
- Decision: Use frontend-only nested builder draft types rather than editing directly against raw API item shapes.
  Rationale: The UI needs nested state, expand/collapse state, and unsaved form values, while the API persists separate flat node records.
  Date/Author: 2026-04-10 / User + Codex
- Decision: Require parent creation before child creation is unlocked.
  Rationale: This mirrors the backend hierarchy, avoids temporary fake IDs, and reduces state complexity in a first-pass builder.
  Date/Author: 2026-04-10 / User + Codex
- Decision: Standardize the frontend plan image field to `imageUrl`.
  Rationale: Matching the API/database contract directly is simpler and reduces drift between service DTOs, record types, and UI types.
  Date/Author: 2026-04-10 / User + Codex
- Decision: Move the builder off the browse `Plans` tab and into its own screen before adding deeper nodes.
  Rationale: The nested builder now has enough weeks/days complexity that keeping it inline would crowd the discovery experience and make the browse route harder to maintain.
  Date/Author: 2026-04-26 / User + Codex

## Outcomes & Retrospective

- The builder now lives on a dedicated screen, while the browse `Plans` tab stays focused on published-plan discovery and simply links into the draft creation flow.
- The first create helper now exists in `blueprnt/src/services/plans.ts`, giving the route a typed path to `POST /:userId/plans`.
- The first child-node pattern is now established with weeks, which gives the builder a concrete model to repeat for days, blocks, and items.
- Days now hang off their specific saved week cards instead of being flattened at the plan level, which matches the underlying hierarchy more clearly.
- The dedicated builder page now also has a lightweight user dashboard mode, which gives the app a place to surface draft and published plans before edit/resume flows are added.
- The frontend plan contract now uses `imageUrl`, matching the backend naming more directly.
- The shell-builder UI is now extracted into its own component, which gives the next incremental slices a cleaner place to add week/day/block/item behavior.
- The remaining builder work is still open for blocks and items, plus dedicated nested draft types as the tree grows.

## Context and Orientation

- `blueprnt/src/app/(tabs)/plans.tsx` currently loads plans from `GET /plans`, owns local filter/search state, and renders the browse list through `PlanCard`.
- `blueprnt/src/app/plan-builder.tsx` is the dedicated builder screen that hosts the nested draft-building UI.
- `blueprnt/src/app/plan-builder.tsx` now also hosts a `My Plans` dashboard mode for the current user.
- `blueprnt/src/app/(tabs)/_layout.tsx` now owns the tab navigator, while `blueprnt/src/app/_layout.tsx` provides a small stack that can show both the tab group and non-tab screens like the builder.
- `blueprnt/src/services/plans.ts` currently contains only `getPlans()` and is the right place to add plan-builder creation helpers.
- `blueprnt/src/services/client.ts` is the generic HTTP wrapper and should remain generic.
- `blueprnt/src/types/plan.ts` currently represents a fetched plan shell but does not yet define frontend builder draft types for nested creation.
- `blueprnt/src/components/ui/collapsible.tsx` is an available primitive for the stacked expand/collapse pattern, though the route may still need route-local wrappers or companion components for cleaner builder markup.
- The backend data model stores all plan-related nodes in one DynamoDB partition:
  - plan shell/meta
  - week
  - day
  - block
  - item
- The backend currently supports create routes for each node type:
  - `POST /:userId/plans`
  - `POST /plans/:planId/weeks`
  - `POST /plans/:planId/weeks/:weekNumber/days`
  - `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks`
  - `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks/:blockNumber/items`
- The backend also supports `GET /:userId/plans` for a user-specific list of created plans, now expected to include at least `title` and `status`.

## Plan of Work

Start by aligning the plan-shell field naming to the backend contract by replacing `coverImageUrl` with `imageUrl` in the frontend plan domain surfaces that still use the old name. Expand `blueprnt/src/services/plans.ts` with typed helpers for all five create routes, keeping the request/response mapping close to the service layer. Add frontend-only builder draft types that represent the nested plan tree and track local unsaved form state plus minimal UI state such as whether a node is expanded, submitting, created, or showing an inline form for its next child. Keep `blueprnt/src/app/(tabs)/plans.tsx` focused on published-plan browsing, and host the nested builder UI from `blueprnt/src/components/plan-builder-shell.tsx` on the dedicated `blueprnt/src/app/plan-builder.tsx` route. The builder should render stacked collapsible cards for the plan shell and each nested child level, enforce parent-first creation, submit through the service helpers, freeze saved nodes into read-only summaries, and expose `+ Add Week`, `+ Add Day`, `+ Add Block`, and `+ Add Item` actions only when their parent is already created. Keep the visual system intentionally simple: themed cards, compact inputs, explicit create buttons, disabled/loading states, and inline error messaging.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, create and maintain this ExecPlan as implementation proceeds.

Expect:

```text
The repository contains plans/build-v1-plan-builder.execplan.md with updated progress and decisions.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully after the builder types, plans service helpers, and Plans screen builder UI are added.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npm run start
```

Expect:

```text
Expo launches and the Plans tab links to a dedicated builder screen where an author can create a plan shell, then create nested weeks, days, blocks, and items with inline loading/error states.
```

## Validation and Acceptance

- Run `npx tsc --noEmit` from `blueprnt/`.
- If environment and backend availability allow, launch Expo and open the `Plans` tab.
- Confirm the existing browse list still renders and filters correctly.
- Confirm the `Plans` tab shows a launch card or CTA that opens the dedicated builder screen without breaking the browse UI.
- Confirm the dedicated builder screen renders the existing nested shell/week/day flow and allows navigating back to `Plans`.
- Confirm the dedicated builder screen can switch between `Builder` and `My Plans`.
- Confirm `My Plans` calls `GET /:userId/plans` and renders a simple list of the current user’s plan titles and statuses.
- Confirm the plan shell form requires the expected fields before allowing creation.
- Confirm `Create Plan` sends `POST /:userId/plans` using the temporary test user id and freezes the submitted shell into a read-only state.
- Confirm `+ Add Week` appears only after plan creation succeeds and that `Create Week` sends `POST /plans/:planId/weeks`.
- Confirm each subsequent child level unlocks only when its parent has been created:
  - day under week
  - block under day
  - item under block
- Confirm each node shows an inline submitting state and does not allow duplicate submission while the request is in flight.
- Confirm request failures show readable inline errors at the relevant node level rather than breaking the whole screen.
- Confirm the plan image field is consistently named `imageUrl` on the frontend after the contract-alignment change.

## Idempotence and Recovery

- Re-running `npx tsc --noEmit` is safe and should remain the default verification step.
- Re-running Expo with `npm run start` is safe; if Metro gets stuck, restart it and clear cache with `npm run start -- --clear` if needed.
- Retrying a failed create request from the UI is safe as long as duplicate-node creation semantics are acceptable on the backend; the UI should keep duplicate-submit prevention during in-flight requests.
- If the inline builder grows too complex during implementation, extract route-local builder sections into focused components under `blueprnt/src/components/` without changing the feature scope.
- If manual validation shows the dedicated builder still needs more room, the next recovery step is to split deeper node levels into focused route-local subcomponents rather than reintroducing builder logic to the browse route.

## Artifacts and Notes

- Likely files to update:
  - `blueprnt/src/app/(tabs)/plans.tsx`
  - `blueprnt/src/app/plan-builder.tsx`
  - `blueprnt/src/app/(tabs)/_layout.tsx`
  - `blueprnt/src/app/_layout.tsx`
  - `blueprnt/src/services/plans.ts`
  - `blueprnt/src/types/plan.ts`
  - `blueprnt/src/mocks/plans.ts`
- Possible new route-local or reusable builder files if needed:
  - `blueprnt/src/components/plan-builder-*.tsx`
  - or additional builder draft types colocated under `blueprnt/src/types/`
- Temporary user context for creation:
  - reuse `TEST_USER_ID` currently defined in the route files until auth/session wiring exists
- Expected V1 behavior:
  - create-only
  - read-only after submit
  - no patch/edit flow
  - no delete flow
  - no drag/drop or reorder UI

## Interfaces and Dependencies

- Route file:
  - `blueprnt/src/app/(tabs)/plans.tsx`
  - `blueprnt/src/app/plan-builder.tsx`
  - `blueprnt/src/app/(tabs)/_layout.tsx`
  - `blueprnt/src/app/_layout.tsx`
- Reusable UI:
  - `blueprnt/src/components/plan-card.tsx`
  - `blueprnt/src/components/screen-header.tsx`
  - `blueprnt/src/components/search-bar.tsx`
  - `blueprnt/src/components/filter-chip.tsx`
  - `blueprnt/src/components/ui/collapsible.tsx`
- Services:
  - `blueprnt/src/services/client.ts`
  - `blueprnt/src/services/plans.ts`
- Types:
  - `blueprnt/src/types/plan.ts`
  - `blueprnt/src/types/index.ts`
- Mock/development data:
  - `blueprnt/src/mocks/plans.ts`
- Runtime dependency:
  - `EXPO_PUBLIC_API_BASE_URL`
- Backend endpoints:
  - `POST /:userId/plans`
  - `GET /:userId/plans`
  - `POST /plans/:planId/weeks`
  - `POST /plans/:planId/weeks/:weekNumber/days`
  - `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks`
  - `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks/:blockNumber/items`
