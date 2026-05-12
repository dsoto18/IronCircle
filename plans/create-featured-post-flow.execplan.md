# Featured Post Creation: Add Verified Creator Publishing Flow

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Verified users will be able to create featured posts from the Explore tab. The Explore Featured mode will show a create button only when `getMe()` returns a user with `isVerified: true`. Pressing it opens a dedicated featured-post creation screen that submits to authenticated `POST /featured`, then returns to Explore. Featured mode will refresh on focus so the newly created post appears after returning.

Success can be observed in the Expo app by signing in as a verified user, opening Explore, tapping the Featured create button, submitting a valid featured post, returning to Explore, and seeing the new post in the Featured list.

## Progress

- [x] (2026-05-12 17:20Z) Reviewed existing `create-post` form patterns, route stack registration, home feed focus refresh behavior, and Featured service code.
- [x] (2026-05-12 17:20Z) Created this ExecPlan for the verified featured publishing flow.
- [x] (2026-05-12 17:21Z) Added `createFeaturedPost()` to `blueprnt/src/services/featured.ts`.
- [x] (2026-05-12 17:22Z) Added `blueprnt/src/app/create-featured-post.tsx`.
- [x] (2026-05-12 17:22Z) Registered the create featured post route in `blueprnt/src/app/_layout.tsx`.
- [x] (2026-05-12 17:23Z) Updated Explore to check `getMe().user?.isVerified`, show the create button in Featured mode, and refresh featured posts on focus.
- [x] (2026-05-12 17:23Z) Ran `npx tsc --noEmit` from `blueprnt/`; it passed after adding the missing Explore `pressed` style.
- [x] (2026-05-12 17:23Z) Ran `npm run lint` from `blueprnt/`; it exited successfully with one unrelated warning in `blueprnt/src/services/plans.ts`.
- [x] (2026-05-12 17:23Z) Ran `git diff --check` from the repository root; it passed.
- [x] (2026-05-12 17:24Z) Confirmed `ExploreItem.entity` and mock explore data match the backend `ExplorePost` value, then reran TypeScript, lint, and whitespace checks successfully.

## Surprises & Discoveries

- Observation: The home feed already uses `useFocusEffect` from `expo-router` to refresh after returning from create flows.
  Evidence: `blueprnt/src/app/(tabs)/index.tsx` uses `useFocusEffect(useCallback(...))` to call `getFeed()`.
- Observation: The existing `create-post` screen has local form input styling that can be reused for a dedicated featured creation screen.
  Evidence: `blueprnt/src/app/create-post.tsx` defines `FormInput` and submit/cancel patterns using existing theme components.

## Decision Log

- Decision: Add a separate `/create-featured-post` route instead of reusing `/create-post`.
  Rationale: Featured posts have a different backend route, data shape, and publishing permission model from follower-feed posts.
  Date/Author: 2026-05-12 / Codex

- Decision: Do not expose `metadataLabel` in the first create form.
  Rationale: The backend accepts it, but it is optional and currently lacks a clear product role; hiding it keeps the first form focused.
  Date/Author: 2026-05-12 / Codex

- Decision: Refresh Featured mode with `useFocusEffect`.
  Rationale: Returning from a successful create should show the new post without forcing a manual reload or app restart.
  Date/Author: 2026-05-12 / Codex

## Outcomes & Retrospective

Implemented the verified featured post creation flow. Explore now checks the current user, shows a Create button in Featured mode only for verified users, routes to a dedicated featured post form, posts to authenticated `POST /featured`, and refreshes Featured posts on focus after returning.

Validation completed with TypeScript, lint, and whitespace checks. Live create-and-refresh behavior remains for manual confirmation in the user's already-running authenticated Expo environment.

## Context and Orientation

The app lives under `blueprnt/`. The Explore route is `blueprnt/src/app/(tabs)/explore.tsx`. Featured posts are loaded through `blueprnt/src/services/featured.ts` from `GET /featured`. User identity is available through `getMe()` in `blueprnt/src/services/user.ts`.

The new backend route for this task is:

- `POST /featured`
- requires auth
- backend enforces that the authenticated user is verified
- accepts `contentType: 'post' | 'announcement' | 'challenge'`, `title`, `summary`, optional `tags`, and optional `metadataLabel`

## Plan of Work

1. Extend `blueprnt/src/services/featured.ts` with create payload/response types and `createFeaturedPost(input)`.
2. Create `blueprnt/src/app/create-featured-post.tsx` as a dedicated form with content type chips, title, summary, and comma-separated tags.
3. Register the route in the root stack.
4. Update Explore to load the current user, track whether they are verified, show a Featured create button only for verified users, and navigate to `/create-featured-post`.
5. Change Featured loading from mount-only `useEffect` to `useFocusEffect` so the list reloads after returning from the create screen.
6. Validate with TypeScript and lint.

## Concrete Steps

From the repository root:

```sh
cd /Users/diegosoto/Documents/towson/IronCircle
```

Edit:

- `blueprnt/src/services/featured.ts`
- `blueprnt/src/app/create-featured-post.tsx`
- `blueprnt/src/app/_layout.tsx`
- `blueprnt/src/app/(tabs)/explore.tsx`
- `plans/create-featured-post-flow.execplan.md`

Validate from `blueprnt/`:

```sh
npx tsc --noEmit
npm run lint
```

Manual app checks:

- Sign in as a verified user.
- Open Explore and confirm the create featured post button appears in Featured mode.
- Switch to People mode and confirm the button is hidden.
- Submit a featured post with title, summary, content type, and optional comma-separated tags.
- Confirm the app returns to Explore and the new post appears after focus refresh.
- Sign in as a non-verified user, or use a non-verified account, and confirm the button is not shown.

## Validation and Acceptance

The change is accepted when:

- TypeScript validation passes.
- Lint exits without new errors.
- `POST /featured` is called with the expected payload and auth header.
- The create button is gated by `getMe().user?.isVerified`.
- A successful create returns to Explore and the Featured list reloads.
- Existing People search remains unchanged.

If live Expo testing is handled by the user in their running dev environment, record local command validation and leave API interaction confirmation to manual testing.

## Idempotence and Recovery

The service and route edits are safe to reapply manually. Re-running TypeScript and lint validation is safe. If a successful post does not appear immediately, first confirm the user returned to Explore and the focus refresh ran; then verify that `GET /featured` returns the created post.

Do not start or stop the user's existing Expo server on port `8082`.

## Artifacts and Notes

- No follow controls are added.
- `metadataLabel` remains accepted by the service type but is not exposed in the create form.
- Backend verified-user enforcement remains the authoritative permission check.

## Interfaces and Dependencies

Affected frontend surfaces:

- `blueprnt/src/services/featured.ts`
- `blueprnt/src/app/create-featured-post.tsx`
- `blueprnt/src/app/_layout.tsx`
- `blueprnt/src/app/(tabs)/explore.tsx`

Backend dependency:

- `POST /featured` requiring an access token and accepting the featured post payload.
