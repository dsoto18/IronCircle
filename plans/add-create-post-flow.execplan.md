# Create post flow: Add feed composer screen

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Add a simple create-post entry point from the Home tab and a dedicated Expo Router screen that submits workout post data to the backend route `POST /:userId/posts`. Success is observable when tapping the Home tab's create button opens the composer, selecting a post type and entering metrics/caption/image data submits through a new `blueprnt/src/services/posts.ts` helper, and the app returns to the Home feed after a successful request.

## Progress

- [x] (2026-05-03 23:38Z) Reviewed `blueprnt/src/app/(tabs)/index.tsx`, `blueprnt/src/app/_layout.tsx`, shared UI components, `blueprnt/src/services/client.ts`, and nearby service patterns.
- [x] (2026-05-03 23:40Z) Added `blueprnt/src/services/posts.ts` with `POST_TYPES`, `CreatePostInput`, and `createPost`.
- [x] (2026-05-03 23:40Z) Built `blueprnt/src/app/create-post.tsx` with a dedicated form, type picker, fixed followers visibility through the service, loading state, and error state.
- [x] (2026-05-03 23:40Z) Added the Home tab create-post button, registered `create-post` in the root stack, and aligned post types for `Cycling` and `followers`.
- [x] (2026-05-03 23:41Z) Ran `npx tsc --noEmit` from `blueprnt/`; it completed successfully.
- [x] (2026-05-03 23:43Z) Attempted to start Expo with `npm run start -- --port 8081`; the process did not open a local listener in this sandbox, so it was stopped.
- [x] (2026-05-03 23:48Z) Replaced the Home `Link asChild` create-post control with a direct `Pressable` plus `router.push('/create-post')` and explicit visible button styling after the tap target appeared invisible in-app.
- [x] (2026-05-03 23:57Z) Updated `createPost` to omit blank or zero `distance` and `calories`, and changed Home feed loading to refresh on screen focus.

## Surprises & Discoveries

- Observation: The working tree already contains user edits to the temporary `TEST_USER_ID` values in `blueprnt/src/app/(tabs)/index.tsx` and `blueprnt/src/app/plan-builder.tsx`.
  Evidence: `git diff -- blueprnt/src/app/(tabs)/index.tsx blueprnt/src/app/plan-builder.tsx` shows only those ID changes before this task's edits.
- Observation: `blueprnt/src/types/post.ts` currently models `PostVisibility` as `private | friends | public`, while this create-post flow must send `followers`.
  Evidence: The user specified a fixed `visibility` request body value of `"followers"` for `POST /:userId/posts`.
- Observation: Expo did not become reachable at `http://localhost:8081` during the local start attempt from this sandboxed shell.
  Evidence: `curl -I http://localhost:8081` failed to connect while `npm run start -- --port 8081` was still running without additional output.
- Observation: The Home create-post tap target could navigate while the visible button content did not appear in the app.
  Evidence: The user reported reaching the create-post page by tapping the whitespace under the Home title.

## Decision Log

- Decision: Keep create-post form state in the route file rather than introducing a custom hook.
  Rationale: The behavior is local to one screen for now, matching the repository convention that route files may own request state until reuse is real.
  Date/Author: 2026-05-03 / Codex
- Decision: Add a dedicated `blueprnt/src/services/posts.ts` module instead of placing create-post calls in the Home route.
  Rationale: Domain-specific API wrappers belong under `blueprnt/src/services/`, while `client.ts` remains the generic HTTP layer.
  Date/Author: 2026-05-03 / Codex
- Decision: Send `visibility: "followers"` from the frontend service/UI path for this first version.
  Rationale: The backend route requires a visibility string, and the user asked to hard-code followers for now instead of exposing it as a UI choice.
  Date/Author: 2026-05-03 / Codex
- Decision: Use `useRouter().push('/create-post')` from a normal `Pressable` on Home instead of `Link asChild`.
  Rationale: The button needs to render as an explicit visible native control, and the previous link wrapper produced a tappable area whose contents were not visible in the user's app.
  Date/Author: 2026-05-03 / Codex
- Decision: Normalize optional metric payload fields in `blueprnt/src/services/posts.ts`.
  Rationale: Keeping blank/zero omission in the service ensures all create-post callers avoid sending unwanted `distance` or `calories` values, rather than relying on a single form screen to remember that rule.
  Date/Author: 2026-05-03 / Codex
- Decision: Refresh the Home feed with `useFocusEffect` instead of manually passing a refresh flag after post creation.
  Rationale: The feed should reload whenever the user returns to Home, including after create-post navigation, without adding route params or shared state.
  Date/Author: 2026-05-03 / Codex

## Outcomes & Retrospective

- The Home tab now includes a `Create Post` button that opens `/create-post`.
- The create-post screen lets the user pick `Run`, `Lift`, `Yoga`, `Swim`, `Cycling`, or `HIIT`, enter caption/metrics/image URL, and submit while disabling duplicate requests.
- `blueprnt/src/services/posts.ts` posts to `POST /:userId/posts` and injects `visibility: "followers"` into the request body.
- Blank or zero `distance` and `calories` values are omitted from the create-post request body.
- The Home feed reloads when the screen regains focus, so returning from a successful create-post flow fetches the latest feed.
- TypeScript validation passes locally. Expo/manual runtime validation against a live backend remains the main follow-up check because the sandboxed `expo start` attempt did not open a reachable local listener.

## Context and Orientation

- `blueprnt/src/app/(tabs)/index.tsx` is the Home tab feed. It currently loads feed data with `getFeed(TEST_USER_ID)`, owns like mutation state, and renders `PostCard` items.
- `blueprnt/src/app/_layout.tsx` defines the root Expo Router `Stack` with hidden headers and currently registers `(tabs)` plus `plan-builder`.
- `blueprnt/src/services/client.ts` is the shared HTTP wrapper. New domain behavior should use `client.post` rather than calling `fetch` directly.
- `blueprnt/src/services/feed.ts`, `blueprnt/src/services/likes.ts`, and `blueprnt/src/services/plans.ts` show the small-service-file pattern.
- `blueprnt/src/types/post.ts` defines `WorkoutType`, `PostVisibility`, `Post`, and feed post types used by the Home feed.
- Shared UI primitives include `ScreenHeader`, `ThemedText`, `ThemedView`, `FilterChip`, and constants from `blueprnt/src/constants/theme.ts`.

## Plan of Work

Create `blueprnt/src/services/posts.ts` with explicit post type constants, a `CreatePostInput` type, and a `createPost` function that sends `POST /${userId}/posts` with the body fields `type`, `distance`, `calories`, `duration`, `imageUrl`, `caption`, and fixed `visibility: "followers"`. Build `blueprnt/src/app/create-post.tsx` as a dedicated form screen using existing themed components and route-local loading/error/success state. Add a Home tab button that navigates to `/create-post`, register the route in `blueprnt/src/app/_layout.tsx`, and update post visibility types so `"followers"` is accepted by the frontend model. Validate with TypeScript and note any manual runtime checks that remain.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, keep this ExecPlan current as implementation proceeds.

Expect:

```text
The repository contains plans/add-create-post-flow.execplan.md with updated progress and decisions.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully after the posts service, create-post route, navigation, and type updates are in place.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npm run start
```

Expect:

```text
Expo launches, the Home tab shows a create-post entry point, tapping it opens the composer, and submitting valid data calls POST /:userId/posts.
```

## Validation and Acceptance

- Run `npx tsc --noEmit` from `blueprnt/`.
- If environment and API connectivity allow, launch Expo and open the Home tab.
- Confirm the Home tab has a visible create-post button.
- Confirm tapping the button opens the create-post screen.
- Confirm the post type UI offers exactly `Run`, `Lift`, `Yoga`, `Swim`, `Cycling`, and `HIIT`.
- Confirm the form submits through `POST /:userId/posts` using the temporary `TEST_USER_ID` and sends `visibility: "followers"`.
- Confirm the submit button is disabled while the request is in flight and a readable error appears if the request fails.
- Confirm successful submission returns the user to the previous screen.

## Idempotence and Recovery

- Re-running `npx tsc --noEmit` is safe and should remain the default verification step.
- Re-running Expo with `npm run start` is safe; if Metro gets stuck, restart it with `npm run start -- --clear`.
- Re-submitting the form is not idempotent because it creates posts, so manual testers should avoid repeated submissions unless duplicate test posts are acceptable.
- If API validation fails, first verify `EXPO_PUBLIC_API_BASE_URL` or the fallback base URL in `blueprnt/src/services/client.ts`.
- If partial edits need to be backed out, revert only the create-post feature files and preserve unrelated user changes such as the temporary test user IDs.

## Artifacts and Notes

- New route file:
  - `blueprnt/src/app/create-post.tsx`
- New service file:
  - `blueprnt/src/services/posts.ts`
- Route/navigation files to update:
  - `blueprnt/src/app/(tabs)/index.tsx`
  - `blueprnt/src/app/_layout.tsx`
- Type file to update:
  - `blueprnt/src/types/post.ts`

## Interfaces and Dependencies

- Frontend stack:
  - Expo Router
  - React Native
  - TypeScript
- Service layer:
  - `blueprnt/src/services/client.ts`
  - `blueprnt/src/services/posts.ts`
- Backend endpoint:
  - `POST /:userId/posts`
- Request URL parameter:
  - `userId`
- Request body fields:
  - `type`
  - `distance`
  - `calories`
  - `duration`
  - `imageUrl`
  - `caption`
  - `visibility`
- Runtime configuration:
  - `EXPO_PUBLIC_API_BASE_URL`
  - temporary `TEST_USER_ID` in the frontend until auth/session values replace it.
