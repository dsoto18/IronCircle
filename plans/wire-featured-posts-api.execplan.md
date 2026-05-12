# Featured Posts API: Wire Explore Featured Mode to Backend

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

The Explore tab's Featured mode will read real featured posts from the backend `GET /featured` route instead of relying on local mock data. People mode will remain unchanged. Users should be able to open Explore, see a loading state while featured posts load, filter/search the fetched posts client-side, and keep using People search as before.

Success can be observed in the Expo app by opening the Explore tab while authenticated and seeing featured posts returned from `GET /featured`. The existing source-type filters and search bar should operate against the fetched posts.

## Progress

- [x] (2026-05-12 17:14Z) Reviewed current Explore mode implementation, `ExploreItem` type, mock explore data, and existing service patterns.
- [x] (2026-05-12 17:14Z) Created this ExecPlan for the Featured API wiring.
- [x] (2026-05-12 17:15Z) Added `blueprnt/src/services/featured.ts` with a typed authenticated `getFeaturedPosts()` wrapper for `GET /featured`.
- [x] (2026-05-12 17:15Z) Aligned the frontend Explore item type and mock data with the backend `ExplorePost` entity shape.
- [x] (2026-05-12 17:16Z) Updated `blueprnt/src/app/(tabs)/explore.tsx` to fetch featured posts with auth and render Featured loading/error states.
- [x] (2026-05-12 17:16Z) Ran `npx tsc --noEmit` from `blueprnt/`; it passed.
- [x] (2026-05-12 17:16Z) Ran `npm run lint` from `blueprnt/`; it exited successfully with one unrelated warning in `blueprnt/src/services/plans.ts`.
- [x] (2026-05-12 17:16Z) Ran `git diff --check` from the repository root; it passed.

## Surprises & Discoveries

- Observation: The backend `GET /featured` response returns DynamoDB-style `{ Items, Count, ScannedCount, $metadata }` data.
  Evidence: User-provided response shape includes `Items` containing featured post objects.
- Observation: The current FlatList key uses `item.PK`, but real featured posts share `PK: "EXPLORE#POSTS"`.
  Evidence: User-provided backend response uses the same partition key for all featured posts.

## Decision Log

- Decision: Use a new `blueprnt/src/services/featured.ts` module.
  Rationale: The backend route and domain language are now specifically `featured`, and this keeps the wrapper small and named after the route.
  Date/Author: 2026-05-12 / Codex

- Decision: Fetch featured posts in the Explore route instead of creating a hook.
  Rationale: The data flow is currently local to one route, matching repository guidance to avoid hook extraction before reuse exists.
  Date/Author: 2026-05-12 / Codex

- Decision: Use `PK + SK` for featured item keys.
  Rationale: Backend featured posts share `PK`, so `SK` is needed to make list keys stable and unique.
  Date/Author: 2026-05-12 / Codex

## Outcomes & Retrospective

Implemented the Featured read-side API wiring. Featured mode now loads posts from authenticated `GET /featured`, filters/searches those fetched posts client-side, renders loading and error states, and uses `PK + SK` for stable list keys. People mode remains unchanged.

Validation completed with TypeScript, lint, and whitespace checks. Live API behavior remains for manual confirmation in the user's already-running Expo app.

## Context and Orientation

The app lives under `blueprnt/`. The Explore tab route is `blueprnt/src/app/(tabs)/explore.tsx`. It currently has two modes:

- Featured mode renders explore post cards and supports client-side filtering/search.
- People mode searches users with `searchUsers` and navigates results to profile pages.

Reusable UI is under `blueprnt/src/components/`. API wrappers live in `blueprnt/src/services/`. The current Explore post type is in `blueprnt/src/types/explore.ts`.

The backend route for this task is:

- `GET /featured`
- requires auth
- returns a response with `Items`
- each item includes `PK`, `SK`, `entity: "ExplorePost"`, `sourceId`, `sourceName`, `sourceType`, `isVerified`, `contentType`, `title`, `summary`, `tags`, `createdAt`, and `updatedAt`

## Plan of Work

1. Create `blueprnt/src/services/featured.ts` with a `getFeaturedPosts()` function using `getAuthHeaders('accessToken')`.
2. Update `ExploreItem` so its `entity` matches the backend's `"ExplorePost"` value.
3. Update mock explore items to the same entity value so existing mock files remain type-correct.
4. Update the Explore route to store fetched featured posts, loading state, and an error message.
5. Replace filtering over `mockExploreItems` with filtering over fetched `featuredItems`.
6. Render a Featured loading state while `GET /featured` is in flight, and a Featured error state if it fails.
7. Change Featured list keys to use `PK` and `SK`.

## Concrete Steps

From the repository root:

```sh
cd /Users/diegosoto/Documents/towson/IronCircle
```

Edit:

- `blueprnt/src/services/featured.ts`
- `blueprnt/src/types/explore.ts`
- `blueprnt/src/mocks/explore-items.ts`
- `blueprnt/src/app/(tabs)/explore.tsx`
- `plans/wire-featured-posts-api.execplan.md`

Validate from `blueprnt/`:

```sh
npx tsc --noEmit
npm run lint
```

Manual app checks:

- Open Explore while signed in.
- Confirm Featured mode calls `GET /featured`.
- Confirm loading and error states render cleanly.
- Confirm fetched posts render as Explore cards.
- Confirm Featured search/source filters still work.
- Confirm People mode still searches users and navigates to profiles.

## Validation and Acceptance

The change is accepted when:

- TypeScript validation passes.
- Lint exits without new errors.
- Featured mode reads from `GET /featured` with auth.
- Featured mode keeps client-side source filters and search behavior.
- Empty/loading/error states are clear.
- People mode behavior is unchanged.

If the Expo app cannot be run in the current environment, record command-line validation and leave live API behavior for manual testing in the already-running app.

## Idempotence and Recovery

The service and route edits are safe to reapply manually. Re-running `npx tsc --noEmit` and `npm run lint` is safe. If the backend response differs, adjust the response type or normalization in `blueprnt/src/services/featured.ts` rather than scattering response-shape checks across the Explore route.

If manual testing shows stale bundle behavior, restart the existing Expo server owned by the user rather than starting a new one on port `8082`.

## Artifacts and Notes

- Publishing featured posts is intentionally out of scope for this slice.
- The existing mock data remains as development reference data, but Featured mode will use the backend response.
- Do not start or stop the user's existing Expo server on port `8082`.

## Interfaces and Dependencies

Affected frontend surfaces:

- `blueprnt/src/app/(tabs)/explore.tsx`
- `blueprnt/src/services/featured.ts`
- `blueprnt/src/types/explore.ts`
- `blueprnt/src/mocks/explore-items.ts`

Backend dependency:

- `GET /featured` requiring an access token and returning `Items: ExploreItem[]`.
