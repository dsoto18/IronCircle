# Plans screen: Build initial reusable browse experience

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Replace the placeholder `Plans` tab with a first-pass browse experience that matches the product direction in `Documents/Iron Circle Core Functionalities.md`. The screen should render a reusable header, a reusable search bar, lightweight reusable filter chips, and a list of plan cards backed by local mock data. Success is observable in the Expo app when the `Plans` tab shows searchable/filterable cards instead of placeholder text and the shared UI pieces are ready to reuse in `Explore`.

## Progress

- [x] (2026-04-02 15:30Z) Reviewed `blueprnt/src/app/index.tsx`, `blueprnt/src/app/explore.tsx`, `blueprnt/src/app/plans.tsx`, `blueprnt/src/components/post-card.tsx`, and `blueprnt/src/types/plan.ts` to understand the current route structure and reusable UI patterns.
- [x] (2026-04-02 15:34Z) Added reusable `ScreenHeader`, `SearchBar`, and `FilterChip` components under `blueprnt/src/components/`.
- [x] (2026-04-02 15:34Z) Added typed mock plan data in `blueprnt/src/mocks/plans.ts` and a reusable `PlanCard` component for vertical plan browsing.
- [x] (2026-04-02 15:34Z) Replaced `blueprnt/src/app/plans.tsx` placeholder content with a searchable, type-filtered card list and empty state.
- [x] (2026-04-02 15:35Z) Ran `npx tsc --noEmit` and `npm run lint` from `blueprnt/`; both completed successfully after a small cleanup in `blueprnt/src/components/app-tabs.tsx`.
- [x] (2026-04-02 18:26Z) Added a shared `accent` color in `blueprnt/src/constants/theme.ts`, wired it into the native bottom tabs, and reused it for the `Blueprnt` eyebrow text based on user-directed styling choices.
- [x] (2026-04-02 18:26Z) Extended `FilterChip` with a reusable accent variant so plan-card tags can stay blue without changing the behavior of the interactive search filter chips.
- [x] (2026-04-02 18:26Z) Re-ran `npx tsc --noEmit` and `npm run lint` from `blueprnt/` after the accent-color follow-up and confirmed both pass.

## Surprises & Discoveries

- Observation: `blueprnt/src/app/explore.tsx` still contains Expo starter content, so reusable primitives introduced for `Plans` can be designed to serve as the baseline for that route next.
  Evidence: Route file currently renders `Collapsible`, Expo docs links, and tutorial images rather than project-specific UI.
- Observation: `blueprnt/src/types/plan.ts` already defines strong plan domain types, which makes a typed mock-data-first implementation straightforward.
  Evidence: The file includes `PlanGoal`, `PlanDifficulty`, `PlanType`, and `Plan` definitions.

## Decision Log

- Decision: Start with `Plans` rather than `Explore`.
  Rationale: `Plans` has lower interaction complexity, already has a domain type defined, and gives us a safer place to establish shared browsing UI before building the more editorial influencer feed.
  Date/Author: 2026-04-02 / User + Codex
- Decision: Keep search and filter state owned by `blueprnt/src/app/plans.tsx` for now.
  Rationale: The browse behavior is local to one route today, so extracting a hook would add indirection before reuse is proven.
  Date/Author: 2026-04-02 / Codex
- Decision: Use local mock data for the initial `Plans` experience rather than introducing a service module in this pass.
  Rationale: The user asked for small incremental progress and reusable UI. A mock-first screen lets us validate layout and interaction without expanding backend dependencies yet.
  Date/Author: 2026-04-02 / Codex
- Decision: Extend the local `Plan` type with UI-needed metadata (`creatorName`, `rating`, `enrollmentCount`) instead of introducing a separate view model type.
  Rationale: This keeps the mock-first implementation simple and the card contract explicit while the backend shape is still evolving.
  Date/Author: 2026-04-02 / Codex
- Decision: Promote the native tab selected blue into a shared theme `accent` color and reuse it for eyebrow/header text.
  Rationale: The user explicitly wanted to preserve the selected bottom-tab blue and reuse that exact color elsewhere, so making it an explicit theme token keeps the color consistent across tabs, headers, and future UI.
  Date/Author: 2026-04-02 / User + Codex
- Decision: Keep `FilterChip` shared, but add an `accent` visual variant for non-interactive plan tags.
  Rationale: The user wanted plan-card tags to also use the shared blue without breaking or complicating the search filter chips. A small variant prop keeps one reusable component while allowing the two visual roles to differ cleanly.
  Date/Author: 2026-04-02 / User + Codex

## Outcomes & Retrospective

- The `Plans` tab now renders a real browse experience instead of placeholder text.
- Shared browse primitives now exist for future reuse in `Explore`: `ScreenHeader`, `SearchBar`, and `FilterChip`.
- `PlanCard` and local plan mocks establish a concrete visual/content pattern for the non-social library-style tab.
- The native bottom-tab selected blue is now an explicit shared accent token, which can be reused intentionally instead of relying on platform defaults.
- `FilterChip` now supports both interactive filter styling and blue accent tag styling through one shared component.
- TypeScript and lint both pass locally. Expo app/manual device validation still remains for a follow-up session.

## Context and Orientation

- `blueprnt/src/app/index.tsx` is the current primary friends/home feed and shows the project’s route-level pattern: local state ownership, screen header, and `FlatList` rendering.
- `blueprnt/src/app/plans.tsx` is currently a placeholder and is the main route targeted by this work.
- `blueprnt/src/app/explore.tsx` still contains template content; this task should produce reusable components that can be dropped into that route later.
- `blueprnt/src/components/themed-text.tsx` and `blueprnt/src/components/themed-view.tsx` provide the current theme-aware typography and container primitives.
- `blueprnt/src/components/post-card.tsx` shows the current card styling language: rounded containers, spaced sections, and themed metadata rows.
- `blueprnt/src/constants/theme.ts` defines `Spacing`, `BottomTabInset`, `MaxContentWidth`, and the active theme colors that new components should use.
- `blueprnt/src/types/plan.ts` defines plan-domain types that should drive mock data and UI labels.
- `Documents/Iron Circle Core Functionalities.md` states that the Plans tab should feel like a vertical library/marketplace with cards, ratings/metadata, and filters.

## Plan of Work

Create a small set of reusable browsing primitives under `blueprnt/src/components/`: a `ScreenHeader` for tab titles/subtitles, a `SearchBar` for keyword filtering, and a `FilterChip`/`FilterChipRow` for simple local toggles. Add `blueprnt/src/mocks/plans.ts` with typed sample data that covers multiple goals, difficulties, and plan types. Build `blueprnt/src/components/plan-card.tsx` as a presentational card that renders plan title, summary, goal, duration, difficulty, and type in a way that fits the current design language. Then replace `blueprnt/src/app/plans.tsx` with a `FlatList`-based screen that owns search/filter state, derives a filtered list from the mock data, and renders lightweight empty-state messaging when no plans match.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, create the task plan file and keep it current during implementation.

Expect:

```text
The repository contains plans/build-initial-plans-screen.execplan.md with updated progress and decisions.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully after the new components, mock data, and Plans screen are added.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npm run start
```

Expect:

```text
Expo launches and the Plans tab renders the new browse experience with searchable/filterable cards.
```

## Validation and Acceptance

- Run `npx tsc --noEmit` from `blueprnt/`.
- If time and environment allow, start Expo and open the `Plans` tab on simulator/device/web.
- Confirm the route no longer shows placeholder text.
- Confirm the shared header and search field render without runtime errors.
- Confirm tapping a filter chip changes the visible results.
- Confirm entering text narrows the visible plans by title/summary/tags.
- Confirm an empty-state message appears when search and filters produce no matching plans.
- Manual follow-up, if Expo is not launched in this session: verify spacing and touch targets on both phone-sized and web layouts.

## Idempotence and Recovery

- Re-running `npx tsc --noEmit` is safe and should remain the default verification step after edits.
- Re-running Expo with `npm run start` is safe; if Metro gets stuck, restart it and, if needed, clear cache with `npm run start -- --clear`.
- The Plans screen in this pass depends only on local mock data, so failures should be isolated to rendering or typing rather than network setup.
- If a partial edit causes runtime issues, compare `blueprnt/src/app/plans.tsx` and the new shared components against this plan and restore only the in-progress feature files rather than touching unrelated routes.

## Artifacts and Notes

- New reusable surfaces:
  - `blueprnt/src/components/screen-header.tsx`
  - `blueprnt/src/components/search-bar.tsx`
  - `blueprnt/src/components/filter-chip.tsx`
  - `blueprnt/src/components/plan-card.tsx`
- Data source added:
  - `blueprnt/src/mocks/plans.ts`
- Initial filters shipped as `All`, `Workout`, `Meal`, and `Hybrid`.
- Shared accent color added in `blueprnt/src/constants/theme.ts` and applied to `blueprnt/src/components/app-tabs.tsx`, `blueprnt/src/components/screen-header.tsx`, and `blueprnt/src/app/index.tsx`.
- `FilterChip` now supports `variant="accent"` and `PlanCard` uses that variant for plan tags.
- `npm run lint` configured Expo ESLint automatically on first run in this repository and then completed without warnings after a small import cleanup.

## Interfaces and Dependencies

- Route files:
  - `blueprnt/src/app/plans.tsx`
  - future reuse target: `blueprnt/src/app/explore.tsx`
- Reusable components:
  - `blueprnt/src/components/themed-text.tsx`
  - `blueprnt/src/components/themed-view.tsx`
  - new shared browse components under `blueprnt/src/components/`
- Types:
  - `blueprnt/src/types/plan.ts`
- Mock data:
  - new `blueprnt/src/mocks/plans.ts`
- Theme/constants:
  - `blueprnt/src/constants/theme.ts`
- External/runtime dependencies:
  - React, React Native, Expo Router, `@expo/vector-icons`
