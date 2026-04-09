# Explore screen: Build initial skeleton and align shared headers

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Replace the Expo starter content in the `Explore` tab with an initial product-specific skeleton that reuses the shared `ScreenHeader` and `SearchBar` components, while also refactoring the `Home` route to use `ScreenHeader` instead of a custom header layout. Success is observable in the Expo app when the `Explore` tab shows a lightweight branded header, a search field, and placeholder section content, and the `Home` tab still shows the same title information using the shared header component.

## Progress

- [x] (2026-04-02 18:57Z) Reviewed `blueprnt/src/app/explore.tsx`, `blueprnt/src/app/index.tsx`, `blueprnt/src/components/screen-header.tsx`, and `blueprnt/src/components/search-bar.tsx` to scope the incremental Explore pass and preserve recent user edits.
- [x] (2026-04-02 19:00Z) Replaced the Expo starter content in `blueprnt/src/app/explore.tsx` with a small shared-component skeleton using `ScreenHeader`, `SearchBar`, and a themed placeholder card.
- [x] (2026-04-02 19:00Z) Refactored `blueprnt/src/app/index.tsx` to use `ScreenHeader` for the current home eyebrow, title, and post-count display.
- [x] (2026-04-02 19:00Z) Ran `npx tsc --noEmit` and `npm run lint` from `blueprnt/`; both completed successfully after the Explore/Home route updates.
- [x] (2026-04-02 19:13Z) Added a visual Explore filter-chip row under the shared search bar with `All`, `Influencers`, `Clubs`, and `Brands`, keeping it scaffold-only for now.
- [x] (2026-04-02 19:13Z) Re-ran `npx tsc --noEmit` and `npm run lint` from `blueprnt/` after the Explore chip-row update; both passed.
- [x] (2026-04-02 21:33Z) Added `ExploreItem` types with string `PK`/`SK`, local mock Explore data, and a first reusable `ExploreCard` component for posts, announcements, challenges, and ads.
- [x] (2026-04-02 21:33Z) Replaced the Explore placeholder block with a simple vertical list render that uses the existing search and filter scaffold against mock data.
- [x] (2026-04-02 21:33Z) Re-ran `npx tsc --noEmit` and `npm run lint` from `blueprnt/` after the Explore data/card pass; both passed.

## Surprises & Discoveries

- Observation: `blueprnt/src/app/explore.tsx` is still entirely template content, so the initial Explore pass can be cleanly introduced without preserving any product logic.
  Evidence: The route still renders Expo docs links, `Collapsible` sections, and tutorial images.
- Observation: `blueprnt/src/app/index.tsx` contains a recent user edit for the home title copy and accent-colored `Blueprnt` eyebrow, but the post-count text currently sits outside the header row.
  Evidence: The `feedPosts.length` text is rendered after the header `View` closes.
- Observation: The Explore feed benefits from a separate card model instead of reusing `PostCard`, because its source types and content types are more editorial/promotional than peer activity.
  Evidence: Explore items now need to represent influencers, clubs, and brands, plus posts, announcements, challenges, and ads.

## Decision Log

- Decision: Limit this pass to shared-header reuse and a minimal Explore skeleton instead of building cards or feed sections yet.
  Rationale: The user explicitly asked to work incrementally and stop after the first structural reuse pass.
  Date/Author: 2026-04-02 / User + Codex
- Decision: Add the Explore filter chips visually now, but do not connect them to search or filtering behavior yet.
  Rationale: The user wanted the chip row present in the UI immediately, while still keeping the feature rollout incremental and low-risk.
  Date/Author: 2026-04-02 / User + Codex
- Decision: Introduce a dedicated `ExploreItem` type and `ExploreCard` instead of extending the existing home-feed `PostCard`.
  Rationale: The user clarified that Explore will contain verified influencer, club, and brand content such as posts, announcements, challenges, and ads. That content contract differs enough from friend workout activity that a separate Explore-focused card keeps the UI clearer and the code easier to evolve.
  Date/Author: 2026-04-02 / User + Codex
- Decision: Include `PK` and `SK` string attributes directly on `ExploreItem`.
  Rationale: The user explicitly requested those attributes, and aligning the new Explore mock type with the repository’s existing item-shape conventions keeps data modeling more consistent.
  Date/Author: 2026-04-02 / User + Codex

## Outcomes & Retrospective

- `Explore` now shows a product-specific skeleton instead of Expo template content.
- `Home` now uses the same `ScreenHeader` primitive as `Plans` and `Explore`, which gives the top-level tabs a more consistent header structure.
- `Explore` now also visually matches the Plans scaffold more closely by including the same chip-row pattern under the shared search bar.
- `Explore` now has a first real data model, mock content set, and reusable card component tailored to verified creator/club/brand content.
- The shared search bar and source filter chips now drive local filtering against Explore mock data.
- This pass still stops short of richer detail screens, hero images, or more advanced sectioning so the next iteration can stay focused.

## Context and Orientation

- `blueprnt/src/app/explore.tsx` is the Explore route targeted by this work and currently contains Expo starter/template content.
- `blueprnt/src/app/index.tsx` is the Home/Friends route and already contains product-specific content that should keep its current wording while switching to shared header rendering.
- `blueprnt/src/components/screen-header.tsx` is the shared header primitive introduced during the Plans work and should become the common tab-title pattern.
- `blueprnt/src/components/search-bar.tsx` is the reusable search input component that should be reused in Explore without adding new search logic yet.
- `blueprnt/src/components/explore-card.tsx` is now the Explore-specific presentational card for verified source content.
- `blueprnt/src/mocks/explore-items.ts` now provides the local Explore feed data used for the first list render.
- `blueprnt/src/types/explore.ts` defines `ExploreItem`, including string `PK` and `SK` attributes and the Explore-specific source/content type unions.
- `blueprnt/src/constants/theme.ts` provides spacing, max-width, bottom-tab inset, and the shared `accent` token that should continue to drive branded eyebrow text.

## Plan of Work

Replace `blueprnt/src/app/explore.tsx` with a simple `SafeAreaView` and vertical layout matching the current Home/Plans screen structure. Reuse `ScreenHeader` for the Explore title and eyebrow, render `SearchBar` beneath it, and add a small themed placeholder block that communicates the future direction of curated creator and brand content without introducing data, services, or more reusable UI yet. Then update `blueprnt/src/app/index.tsx` so its current title, accent eyebrow, and post-count trailing text all render through `ScreenHeader`, removing the now-redundant custom header layout.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, create and maintain:

```text
plans/build-explore-skeleton.execplan.md
```

Expect:

```text
The repository contains a new Explore-specific ExecPlan documenting the incremental header-reuse pass.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully after the Explore and Home route refactors.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npm run lint
```

Expect:

```text
Lint completes successfully after the route changes.
```

## Validation and Acceptance

- Run `npx tsc --noEmit` from `blueprnt/`.
- Run `npm run lint` from `blueprnt/`.
- Manual app validation, if launched later:
  - open the `Explore` tab and confirm the template content is gone
  - confirm `Explore` shows a shared header and search bar
  - confirm the `Home` tab still shows the same title copy and post count, now via `ScreenHeader`
  - confirm no spacing regression appears at the top of either screen

## Idempotence and Recovery

- Re-running `npx tsc --noEmit` and `npm run lint` is safe after each small route edit.
- If Metro shows stale content after replacing the Explore template screen, restart Expo and clear cache with `npm run start -- --clear` if needed.
- These changes are route-local and component-reuse-only, so recovery should only require comparing `blueprnt/src/app/explore.tsx` and `blueprnt/src/app/index.tsx` against this plan and adjusting those files.

## Artifacts and Notes

- This pass now includes:
  - `blueprnt/src/types/explore.ts`
  - `blueprnt/src/mocks/explore-items.ts`
  - `blueprnt/src/components/explore-card.tsx`
- The recent accent-color and chip-variant work remains documented in `plans/build-initial-plans-screen.execplan.md`.
- Explore skeleton added in `blueprnt/src/app/explore.tsx`.
- Home header reuse landed in `blueprnt/src/app/index.tsx`.

## Interfaces and Dependencies

- Route files:
  - `blueprnt/src/app/explore.tsx`
  - `blueprnt/src/app/index.tsx`
- Shared components:
  - `blueprnt/src/components/explore-card.tsx`
  - `blueprnt/src/components/screen-header.tsx`
  - `blueprnt/src/components/search-bar.tsx`
  - `blueprnt/src/components/filter-chip.tsx`
  - `blueprnt/src/components/themed-text.tsx`
  - `blueprnt/src/components/themed-view.tsx`
- Mock data:
  - `blueprnt/src/mocks/explore-items.ts`
- Types:
  - `blueprnt/src/types/explore.ts`
- Theme/constants:
  - `blueprnt/src/constants/theme.ts`
- Runtime dependencies:
  - React
  - React Native
  - Expo Router
