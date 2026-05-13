# Plan builder V1: Create nested plan nodes from a dedicated builder screen

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Add a first-pass plan creation flow to the app so an author can create a plan shell and then progressively add weeks, days, blocks, and items beneath it using the existing backend `POST` routes. Success is observable in the Expo app when the published-plan browse tab stays focused on discovery, while a dedicated builder screen exposes the nested draft-building UI with stacked sections, parent-first creation rules, inline loading/error states, and read-only submitted nodes after each successful create request.

## Progress

- [x] (2026-04-10 02:03Z) Reviewed the current tab layout, `Plans` route, shared service pattern, existing `Collapsible` primitive, and the latest `Plan` type to choose a minimal builder entry point.
- [x] (2026-04-10 02:03Z) Captured the user-provided DynamoDB hierarchy and create-route DTOs for plan shell, week, day, block, and item creation.
- [x] (2026-04-10 03:05Z) Aligned plan image naming from `coverImageUrl` to `imageUrl` across the frontend plan domain type and existing mock usage.
- [x] (2026-04-10 03:05Z) Added the first create-route service helper in `blueprnt/src/services/plans.ts` for shell creation; the route has since moved to authenticated `POST /plans`.
- [ ] Introduce frontend-only builder draft types that model nested editable state separately from API record types.
- [x] (2026-04-10 03:05Z) Extended `blueprnt/src/app/plans.tsx` with an inline builder entry point and the first create-only shell UI for plan metadata submission.
- [x] (2026-04-10 03:13Z) Extracted the shell builder UI and local create logic into `blueprnt/src/components/plan-builder-shell.tsx` so `blueprnt/src/app/plans.tsx` stays focused on screen-level browse orchestration.
- [x] (2026-04-10 13:32Z) Added `PlanWeek` typing, a typed `createWeek` service helper, and the first child-node builder flow so saved plan shells can now create and render read-only week summaries.
- [x] (2026-04-10 15:03Z) Added `PlanDay` typing, a typed `createDay` service helper, and nested per-week day creation so each week now owns its own inline day form and saved day cards.
- [x] (2026-04-26 17:45Z) Moved tab routes into a `(tabs)` route group, added a dedicated `plan-builder` screen, and replaced the inline builder on the browse page with a launch card linking to the separate builder flow.
- [x] (2026-04-26 18:10Z) Added a `My Plans` mode to the dedicated builder page with a typed `getUserPlans` helper and a simple user-specific list of plan titles and statuses.
- [x] (2026-04-26 18:35Z) Added draft resume support from `My Plans` using `GET /plan/:planId/full`, hydrating saved shell/week/day data back into the builder.
- [x] (2026-04-26 18:40Z) Preserved the follow-up publish-route contract change so publish requests now include `createdAt` with `planId`; user identity is auth-derived.
- [x] (2026-04-10 03:05Z) Ran `npx tsc --noEmit` from `blueprnt/`; it completed successfully after the shell-builder slice.
- [x] (2026-05-12 21:25Z) Reviewed this ExecPlan, `blueprnt/src/types/plan.ts`, `blueprnt/src/services/plans.ts`, `blueprnt/src/app/plan-builder.tsx`, and `blueprnt/src/components/plan-builder-shell.tsx` to scope the remaining Block and Item builder work.
- [x] (2026-05-12 23:55Z) Captured the tested Block and Item API contracts: both routes require auth, block numbers and item order are backend-generated, block create returns raw `PlanBlock`, and item create returns raw `PlanItem`.
- [x] (2026-05-13 00:00Z) Added `PlanBlock`, `PlanItem`, and `PlanItemType` API record types in `blueprnt/src/types/plan.ts`, extended `HydratedPlanDraft`, and included both records in `FullPlanItem`.
- [x] (2026-05-13 00:00Z) Added authenticated typed `createBlock` and `createItem` service helpers in `blueprnt/src/services/plans.ts`.
- [x] (2026-05-13 00:00Z) Extended `GET /plan/:planId/full` hydration in `blueprnt/src/app/plan-builder.tsx` so resumed drafts include sorted blocks grouped by day and sorted items grouped by block.
- [x] (2026-05-13 00:00Z) Preserved the current Plan -> Week -> Day overview, then added focused Day and Block builder surfaces for blocks and items instead of nesting more cards inside day cards.
- [x] (2026-05-13 00:00Z) Ran `npx tsc --noEmit` from `blueprnt/`; it completed successfully after the block/item builder slice.
- [x] (2026-05-13 00:01Z) Ran `npm run lint` from `blueprnt/`; it exited successfully with two pre-existing warnings in `blueprnt/src/app/(tabs)/explore.tsx`.
- [ ] Manually validate fresh creation plus draft resume for Plan -> Week -> Day -> Block -> Item against a live authenticated backend.

## Surprises & Discoveries

- Observation: The current navigation layout is just tabs, with no existing stack/modal route structure around `Plans`.
  Evidence: `blueprnt/src/app/_layout.tsx` renders `AppTabs` directly, and the tab components currently expose only the main tab routes.
- Observation: The repository already has a simple `Collapsible` UI primitive that can be adapted or reused for a stacked node-builder experience.
  Evidence: `blueprnt/src/components/ui/collapsible.tsx` provides a minimal expand/collapse wrapper with themed styling.
- Observation: The frontend still uses `coverImageUrl` in the plan domain type and mocks, but the backend contract uses `imageUrl`.
  Evidence: `blueprnt/src/types/plan.ts` and `blueprnt/src/mocks/plans.ts` still reference `coverImageUrl`.
- Observation: The existing `Plans` screen is already the home of plan browsing and is the least disruptive place to stage a V1 builder behind a local toggle.
  Evidence: `blueprnt/src/app/plans.tsx` owns the fetch/filter state for plans and already presents the plan library UI.
- Observation: Publishing a plan now needs the shell `createdAt` timestamp in addition to `planId`.
  Evidence: The backend uses `createdAt` to update the user-reference record whose key embeds the creation timestamp, and the frontend publish helper now passes that value through while user identity is derived from auth.
- Observation: Before the block/item slice, the frontend type union for full-plan hydration stopped at days.
  Evidence: `blueprnt/src/types/plan.ts` defined `FullPlanItem` as plan shell, `PlanWeek`, or `PlanDay`; this slice extended it with `PlanBlock` and `PlanItem`.
- Observation: The current builder already has a parent-keyed state pattern that can be repeated for blocks and items.
  Evidence: `blueprnt/src/components/plan-builder-shell.tsx` keeps `openWeekDayForms`, `createDayDrafts`, `createdDaysByWeek`, `createDayLoadingWeekKey`, and `createDayErrors` keyed by a week key.
- Observation: The current authenticated frontend plan-create helper uses `POST /plans`.
  Evidence: `blueprnt/src/services/plans.ts` calls `createPlan()` through `client.post('/plans', body, { headers: ... })`; `getUserPlans()` still uses `GET /:userId/plans`.
- Observation: Block creation accepts required `title` and `summary` strings plus optional `notes`, derives hierarchy coordinates from URL params, and returns the raw created block.
  Evidence: User-tested `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks` returned an object with `entity: "PlanBlock"`, `blockNumber`, `planId`, `userId`, `weekNumber`, `dayNumber`, timestamps, `title`, and `summary`.
- Observation: Item creation accepts required `itemType` and `title`, supports workout/meal/note optional fields, derives hierarchy coordinates from URL params, and returns the raw created item.
  Evidence: User-tested `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks/:blockNumber/items` returned an object with `entity: "PlanItem"`, `order`, hierarchy coordinates, `itemType`, `title`, and optional item detail fields.

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
- Decision: Preserve the publish request shape that includes `createdAt`.
  Rationale: The backend publish flow now depends on the shell creation timestamp to locate and update the user-plan reference document correctly, so the frontend must continue sending it.
  Date/Author: 2026-04-26 / User + Codex
- Decision: Implement blocks and items as the final create-only hierarchy slice before adding edit, delete, reorder, or rich workout/meal-specific item editors.
  Rationale: The existing builder is intentionally parent-first and create-only, and finishing the generic DynamoDB hierarchy gives the app a complete path without expanding the feature surface prematurely.
  Date/Author: 2026-05-12 / Codex
- Decision: Group resumed draft data with stable composite frontend keys derived from the persisted hierarchy coordinates.
  Rationale: The backend stores all nodes under the same plan partition, while the UI needs quick parent-child lookup maps such as day-to-blocks and block-to-items.
  Date/Author: 2026-05-12 / Codex
- Decision: Keep V1 block and item forms generic and aligned to the backend record contract.
  Rationale: Blocks represent a timespan or section of a day and items may eventually diverge for workout versus meal plans, but a minimal generic create flow is the safest next step until richer per-type editors are designed.
  Date/Author: 2026-05-12 / Codex
- Decision: Use a hybrid builder UI for the final two hierarchy levels.
  Rationale: The current nested overview works well through days, but nesting blocks and items inside the same card stack would become cramped on mobile; opening a focused day/block builder preserves the hierarchy while giving deeper forms enough room.
  Date/Author: 2026-05-12 / User + Codex

## Outcomes & Retrospective

- The builder now lives on a dedicated screen, while the browse `Plans` tab stays focused on published-plan discovery and simply links into the draft creation flow.
- The first create helper now exists in `blueprnt/src/services/plans.ts`, giving the builder a typed authenticated path to create plan shells.
- The first child-node pattern is now established with weeks, which gives the builder a concrete model to repeat for days, blocks, and items.
- Days now hang off their specific saved week cards instead of being flattened at the plan level, which matches the underlying hierarchy more clearly.
- The dedicated builder page now also has a lightweight user dashboard mode, which gives the app a place to surface draft and published plans before edit/resume flows are added.
- Draft plans can now be reopened from `My Plans`, with saved shell/week/day data hydrated back into the current builder.
- The publish flow now intentionally includes `createdAt` as part of the request contract and should be preserved in future edits.
- The frontend plan contract now uses `imageUrl`, matching the backend naming more directly.
- The shell-builder UI is now extracted into its own component, which gives the next incremental slices a cleaner place to add week/day/block/item behavior.
- Blocks and items are now wired into the frontend type system, authenticated service layer, full-draft hydration, and builder UI.
- The builder now uses a hybrid interaction model: the overview remains Plan -> Week -> Day, and tapping into a saved day or block opens a focused child-builder surface.
- Remaining validation is live app/backend testing for fresh create and resume across all five hierarchy levels.

## Context and Orientation

- `blueprnt/src/app/(tabs)/plans.tsx` currently loads plans from `GET /plans`, owns local filter/search state, and renders the browse list through `PlanCard`.
- `blueprnt/src/app/plan-builder.tsx` is the dedicated builder screen that hosts the nested draft-building UI.
- `blueprnt/src/app/plan-builder.tsx` now also hosts a `My Plans` dashboard mode for the current user.
- `blueprnt/src/app/(tabs)/_layout.tsx` now owns the tab navigator, while `blueprnt/src/app/_layout.tsx` provides a small stack that can show both the tab group and non-tab screens like the builder.
- `blueprnt/src/services/plans.ts` currently contains `getPlans()`, `getUserPlans()`, `getFullPlan()`, `createPlan()`, `createWeek()`, `createDay()`, `createBlock()`, `createItem()`, and `publishPlan()`.
- `blueprnt/src/services/client.ts` is the generic HTTP wrapper and should remain generic.
- `blueprnt/src/types/plan.ts` currently represents a fetched plan shell, saved weeks, saved days, saved blocks, saved items, user plan references, hydrated draft data, and the `FullPlanItem` union.
- `blueprnt/src/components/ui/collapsible.tsx` is an available primitive for the stacked expand/collapse pattern, though the route may still need route-local wrappers or companion components for cleaner builder markup.
- The backend data model stores all plan-related nodes in one DynamoDB partition:
  - plan shell/meta
  - week
  - day
  - block
  - item
- The backend currently supports create routes for each node type:
  - authenticated `POST /plans` in the current frontend service
  - `POST /plans/:planId/weeks`
  - `POST /plans/:planId/weeks/:weekNumber/days`
  - `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks`
  - `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks/:blockNumber/items`
- The backend also supports `GET /:userId/plans` for a user-specific list of created plans, now expected to include at least `title` and `status`.
- The backend also supports `GET /plan/:planId/full` for reconstructing a saved draft from its flat partition items.

## Plan of Work

Start the remaining slice by expanding the plan API record types to include `PlanBlock`, `PlanItem`, and a `PlanItemType` union of `'exercise' | 'meal' | 'note'`. Mirror the tested backend fields directly. `PlanBlock` has `PK`, `SK`, `entity: 'PlanBlock'`, `blockNumber`, `createdAt`, `updatedAt`, `planId`, `userId`, `weekNumber`, `dayNumber`, required `title`, required `summary`, and optional `notes`. `PlanItem` has `PK`, `SK`, `order`, `entity: 'PlanItem'`, timestamps, hierarchy coordinates, required `itemType`, required `title`, and optional detail fields: `description`, `sets`, `reps`, `durationMin`, `distance`, `restSeconds`, `intensity`, `tempo`, `videoUrl`, `calories`, `proteinGrams`, `carbsGrams`, `fatGrams`, `ingredients`, and `recipeUrl`.

Extend `HydratedPlanDraft` with `blocksByDay: Record<string, PlanBlock[]>` and `itemsByBlock: Record<string, PlanItem[]>`, and extend `FullPlanItem` to include `PlanBlock` and `PlanItem`. In `blueprnt/src/app/plan-builder.tsx`, update `buildHydratedDraft()` to filter `PlanBlock` and `PlanItem`, sort them by their hierarchy numbers, and group them under stable frontend keys. The key helpers should stay consistent across hydration and builder rendering:

- week key: `${planId}-${weekNumber}`
- day key: `${planId}-${weekNumber}-${dayNumber}`
- block key: `${planId}-${weekNumber}-${dayNumber}-${blockNumber}`

Add `createBlock()` and `createItem()` to `blueprnt/src/services/plans.ts`, following the existing `createWeek()` and `createDay()` response-unwrapping style. `createBlock()` should call `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks`; `createItem()` should call `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks/:blockNumber/items`. Both calls should include authenticated headers and keep request body types close to the service.

In `blueprnt/src/components/plan-builder-shell.tsx`, preserve the existing Plan -> Week -> Day overview instead of adding more visible indentation inside the day cards. Make saved day cards actionable: tapping a day opens a focused day-builder surface for that one day. This can be route-local state in the same screen at first, or a small extracted component if the file gets too large. The focused day-builder should show a compact breadcrumb/header, the selected day summary, a Blocks section with `+ Add Block`, keyed block draft/loading/error state, and read-only saved block cards. Tapping a saved block in that focused day-builder should open a focused block/item surface for that block with an Items section, `+ Add Item`, keyed item draft/loading/error state, and read-only saved item cards. On fresh plan creation and publish reset, clear all block/item maps and any active selected day/block. On initial draft hydration, seed the block and item maps from `initialDraft`, initialize closed forms for each existing day and block, and leave saved records read-only. Keep the publish behavior unchanged unless the backend rejects incomplete plans; this slice is about completing creation and resume for the hierarchy, not changing publication policy.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, keep this ExecPlan current as implementation proceeds.

Expect:

```text
The repository contains plans/build-v1-plan-builder.execplan.md with updated progress and decisions.
```

In `blueprnt/src/types/plan.ts`, add `PlanBlock` and `PlanItem` saved-record types and update `HydratedPlanDraft` and `FullPlanItem`.

Expect:

```text
Full-plan responses can be represented as Plan, PlanWeek, PlanDay, PlanBlock, or PlanItem records.
```

In `blueprnt/src/services/plans.ts`, add typed `CreateBlockInput` and `CreateItemInput` request types plus `createBlock()` and `createItem()` exports.

Expect:

```text
The builder has typed helpers for both remaining create routes and no route file calls client.ts directly.
```

In `blueprnt/src/app/plan-builder.tsx`, update `buildHydratedDraft()` to hydrate all five node levels.

Expect:

```text
Opening a draft from My Plans reconstructs weeks, days, blocks, and items from GET /plan/:planId/full.
```

In `blueprnt/src/components/plan-builder-shell.tsx`, make saved day cards open a focused block-builder surface, and make saved block cards open a focused item-builder surface.

Expect:

```text
The overview stays readable through weeks and days; blocks and items are created from focused child-builder views with inline loading and error states.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully after the block/item types, service helpers, hydration logic, and builder UI are added.
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
- Confirm tapping a draft in `My Plans` fetches `GET /plan/:planId/full` and reopens the saved shell/week/day data in the builder view.
- Confirm the plan shell form requires the expected fields before allowing creation.
- Confirm `Create Plan` sends authenticated `POST /plans` without a hardcoded user ID and freezes the submitted shell into a read-only state.
- Confirm `+ Add Week` appears only after plan creation succeeds and that `Create Week` sends `POST /plans/:planId/weeks`.
- Confirm saved day cards remain readable in the overview and can be tapped to open the focused day-builder surface.
- Confirm each subsequent child level unlocks only when its parent has been created:
  - day under week
  - block under day
  - item under block
- Confirm `Create Block` sends `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks` and appends the saved block under only the intended day.
- Confirm `Create Item` sends `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks/:blockNumber/items` and appends the saved item under only the intended block.
- Confirm each node shows an inline submitting state and does not allow duplicate submission while the request is in flight.
- Confirm request failures show readable inline errors at the relevant node level rather than breaking the whole screen.
- Confirm reopening a draft from `My Plans` shows previously saved blocks and items in the correct nested locations.
- Confirm the plan image field is consistently named `imageUrl` on the frontend after the contract-alignment change.

## Idempotence and Recovery

- Re-running `npx tsc --noEmit` is safe and should remain the default verification step.
- Re-running Expo with `npm run start` is safe; if Metro gets stuck, restart it and clear cache with `npm run start -- --clear` if needed.
- Retrying a failed create request from the UI is safe as long as duplicate-node creation semantics are acceptable on the backend; the UI should keep duplicate-submit prevention during in-flight requests.
- If the inline builder grows too complex during implementation, extract route-local builder sections into focused components under `blueprnt/src/components/` without changing the feature scope.
- If manual validation shows the dedicated builder still needs more room, the next recovery step is to split deeper node levels into focused route-local subcomponents rather than reintroducing builder logic to the browse route.
- If backend block/item field names differ from the preliminary frontend draft field names, update the service request types and saved-record types to match the backend instead of adding frontend translation in the component.
- If full-plan hydration returns block or item entities with unexpected `entity` labels, update the discriminated union and hydration filters before changing UI state; the UI should render only typed, recognized records.

## Artifacts and Notes

- Validation artifact:
  - `npx tsc --noEmit` passed from `blueprnt/` on 2026-05-13 00:00Z.
  - `npm run lint` exited successfully from `blueprnt/` on 2026-05-13 00:01Z, with existing warnings in `blueprnt/src/app/(tabs)/explore.tsx`.
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
- User context for creation:
  - plan services derive the current user from `blueprnt/src/services/authSession.ts`; the builder should not reintroduce `TEST_USER_ID`
- Expected V1 behavior:
  - create-only
  - read-only after submit
  - no patch/edit flow
  - no delete flow
  - no drag/drop or reorder UI
- Suggested V1 block fields:
  - required title or label, depending on the backend contract
  - optional summary/notes
  - optional time-window fields only if already supported by the backend
- Suggested V1 item fields:
  - required title or name, depending on the backend contract
  - optional summary/notes
  - no workout-specific sets/reps or meal-specific nutrition editor until the generic hierarchy is working

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
  - authenticated `POST /plans`
  - `GET /:userId/plans`
  - `GET /plan/:planId/full`
  - `POST /plans/:planId/weeks`
  - `POST /plans/:planId/weeks/:weekNumber/days`
  - `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks`
  - `POST /plans/:planId/weeks/:weekNumber/days/:dayNumber/blocks/:blockNumber/items`
