# Explore People Search: Add Mode-Based User Discovery

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

The Explore tab will remain a discovery surface for featured posts from verified sources while adding a People mode where users can search for other users by name or username. The current Featured/Posts behavior will continue to use client-side filtering over explore items. People mode will use the backend `GET /users?text=<query>` route, render lightweight user results, and navigate to the existing profile route when a result is pressed.

Success can be observed in the Expo app by opening the Explore tab, switching between Featured and People modes, confirming that Featured still filters explore cards locally, and confirming that People searches only after at least three characters and shows user results from the API.

## Progress

- [x] (2026-05-12 02:42Z) Reviewed `blueprnt/src/app/(tabs)/explore.tsx`, `blueprnt/src/services/user.ts`, `blueprnt/src/components/explore-card.tsx`, and related theme/search components.
- [x] (2026-05-12 02:42Z) Created this ExecPlan for the multi-file Explore people search change.
- [x] (2026-05-12 02:43Z) Added the typed `searchUsers` wrapper for `GET /users?text=<query>` in `blueprnt/src/services/user.ts`.
- [x] (2026-05-12 02:43Z) Added `blueprnt/src/components/user-search-card.tsx` for presentational people results without follow controls.
- [x] (2026-05-12 02:44Z) Updated `blueprnt/src/app/(tabs)/explore.tsx` with Featured and People modes, contextual search placeholders, and debounced user search state.
- [x] (2026-05-12 02:44Z) Ran `npx tsc --noEmit` from `blueprnt/`; it passed.
- [x] (2026-05-12 02:45Z) Ran `npm run lint` from `blueprnt/`; it exited successfully with one warning in unrelated `blueprnt/src/services/plans.ts`.
- [x] (2026-05-12 02:45Z) Ran `git diff --check` from the repository root; it passed.
- [x] (2026-05-12 02:46Z) Attempted to start Expo on port `8082`; Expo opened an unresponsive listener without a reachable local response, so the process was stopped.

## Surprises & Discoveries

- Observation: `blueprnt/src/services/user.ts` already owns current-user, create-user, profile read, and profile update calls, so user search belongs there rather than in a new service.
  Evidence: Existing exports include `getMe`, `createCurrentUser`, `getUserProfile`, and `updateUserProfile`.
- Observation: The profile route already accepts a user identifier and owns detailed profile loading and follow state.
  Evidence: `blueprnt/src/app/profile/[userId].tsx` calls `getUserProfile(userId)` and renders `ProfileScreen`.

## Decision Log

- Decision: Keep Featured search and People search as separate query states in the Explore route.
  Rationale: Switching modes should not accidentally send a post-filter query to the users API, and each mode should remember its own search text.
  Date/Author: 2026-05-12 / Codex

- Decision: Put the user search API wrapper in `blueprnt/src/services/user.ts`.
  Rationale: The route is user-domain behavior and the repository convention keeps domain-specific API wrappers in service modules.
  Date/Author: 2026-05-12 / Codex

- Decision: Do not include follow/unfollow controls in user search results.
  Rationale: The requested first version is discovery and profile navigation; follow state already belongs to the profile screen.
  Date/Author: 2026-05-12 / Codex

## Outcomes & Retrospective

Implemented the first version of People mode on the Explore tab. Featured mode keeps the existing mock explore-card filtering and source filters. People mode has its own search text, waits for a three-character query, debounces calls to `searchUsers`, renders loading/error/helper/empty states, and navigates results to the existing profile route by `userId`.

Validation completed with TypeScript, lint, and whitespace checks. An Expo dev server attempt did not produce a reachable local response in this environment, so manual Expo/backend validation remains recommended to confirm the live `GET /users?text=<query>` response and profile navigation in the running app.

## Context and Orientation

The main app is under `blueprnt/`. The Explore route is `blueprnt/src/app/(tabs)/explore.tsx`, currently rendering mock `ExploreItem` data from `blueprnt/src/mocks/explore-items.ts` through `ExploreCard`. It uses `SearchBar` and `FilterChip`, matching the style used on the plans browsing page.

HTTP behavior is centralized in `blueprnt/src/services/client.ts`. User-domain calls are in `blueprnt/src/services/user.ts`. Reusable presentational UI belongs under `blueprnt/src/components/`.

The backend search contract for this task is:

- `GET /users?text=<query>`
- no auth headers
- backend enforces a minimum text length of three characters
- backend enforces a limit of five results
- response contains `Items` and `Count`, where `Items` includes `profilePictureUrl`, `firstName`, `lastName`, `userId`, and `username`

## Plan of Work

1. Add a typed `UserSearchResult` and `searchUsers(text)` function in `blueprnt/src/services/user.ts`. The function will trim the query and return an empty array for fewer than three characters.
2. Add `blueprnt/src/components/user-search-card.tsx` as a presentational row/card for a user result. It will display initials or an avatar placeholder, name, and username. Press behavior will be passed in by the route.
3. Update `blueprnt/src/app/(tabs)/explore.tsx` to support `featured` and `people` modes with mode chips near the top of the screen.
4. Keep the current Featured filtering behavior intact and scoped to Featured mode.
5. Add People mode state for query, results, loading, and error. Debounce API calls and avoid calls for fewer than three characters.
6. Render People loading, empty, helper, and error states inside the same visual system as the existing Explore screen.
7. Navigate user results to `/profile/[userId]` through Expo Router.

## Concrete Steps

From the repository root:

```sh
cd /Users/diegosoto/Documents/towson/IronCircle
```

Edit:

- `blueprnt/src/services/user.ts`
- `blueprnt/src/components/user-search-card.tsx`
- `blueprnt/src/app/(tabs)/explore.tsx`
- `plans/add-explore-people-search.execplan.md`

Validate from `blueprnt/`:

```sh
npx tsc --noEmit
```

Manual app checks:

- Open the Explore tab.
- Confirm Featured mode shows the same explore cards and source filters as before.
- Search in Featured mode and confirm the existing client-side filtering still works.
- Switch to People mode.
- Confirm the search placeholder changes to user-oriented copy.
- Type one or two characters and confirm no API loading/result state is triggered.
- Type three or more characters and confirm the app requests `GET /users?text=<query>`.
- Press a user result and confirm the app navigates to the profile screen.

## Validation and Acceptance

The change is accepted when:

- TypeScript validation passes with `npx tsc --noEmit`.
- Featured mode preserves current filtering behavior and empty state.
- People mode calls `searchUsers` only when the trimmed query is at least three characters.
- People mode renders helper, loading, empty, error, and result states without adding follow buttons.
- User result presses route to the existing profile page using `userId`.

If live backend validation is unavailable, local TypeScript validation and visual/manual checks in the Expo app should be recorded, and backend-dependent behavior should remain for manual verification.

## Idempotence and Recovery

The service addition and route/component edits are safe to reapply manually if a partial edit fails. Re-running `npx tsc --noEmit` is safe. If Metro caches stale route/component code during manual testing, restart the Expo dev server or run the usual Expo start command with a cleared cache from `blueprnt/`.

If the backend route returns a shape that differs from `Items`, adjust only the response normalization in `searchUsers` and keep the Explore route/component contract stable.

## Artifacts and Notes

- No backend files are changed by this plan.
- No follow/unfollow buttons are part of search results in this first version.
- The current mock Explore data remains in place for Featured mode.

## Interfaces and Dependencies

Affected frontend surfaces:

- `blueprnt/src/app/(tabs)/explore.tsx`
- `blueprnt/src/components/user-search-card.tsx`
- `blueprnt/src/services/user.ts`
- Existing shared UI: `SearchBar`, `FilterChip`, `ThemedText`, `ThemedView`
- Existing navigation: `/profile/[userId]`

Backend dependency:

- `GET /users?text=<query>` with no auth requirement, a minimum three-character query, and a five-result backend limit.
