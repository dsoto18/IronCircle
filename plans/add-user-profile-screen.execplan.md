# Add User Profile Screen

## Purpose / Big Picture

Add a simple, reusable profile experience for the Blueprnt Expo app. The same profile layout should render the signed-in user's own profile and other users' profiles. Other-user profiles should support follow/unfollow when the backend route exists.

## Progress

- [x] (2026-05-11 15:48Z) Reviewed the current tab routes, home feed data flow, `PostCard`, `User` type, and `user.ts` service.
- [x] (2026-05-11 15:48Z) Confirmed Expo Router dynamic route files such as `src/app/profile/[userId].tsx` are the right fit for viewing other users.
- [x] (2026-05-11 15:48Z) Added user and follow service wrappers for profile reads and follow mutations.
- [x] (2026-05-11 15:48Z) Added a reusable profile rendering component.
- [x] (2026-05-11 15:48Z) Added `/profile` and `/profile/[userId]` route files.
- [x] (2026-05-11 15:48Z) Wired home feed author taps to profile navigation and added a Home header profile button.
- [x] (2026-05-11 15:48Z) Ran TypeScript validation from `blueprnt/`; `npx tsc --noEmit` passed.
- [x] (2026-05-11 15:48Z) Ran `npm run lint`; Expo lint completed with one warning in untouched `blueprnt/src/services/plans.ts`.
- [x] (2026-05-11 17:24Z) Updated the dynamic profile route to treat follower/following reads as follow relationship records, not full `User` objects.
- [x] (2026-05-11 17:24Z) Re-ran `npx tsc --noEmit`; TypeScript validation passed.
- [x] (2026-05-11 17:24Z) Re-ran `npm run lint`; Expo lint still reports only the existing warning in untouched `blueprnt/src/services/plans.ts`.
- [x] (2026-05-12 00:50Z) Added a current-user profile edit flow for `firstName`, `lastName`, and `bio`.
- [x] (2026-05-12 00:50Z) Re-ran `npx tsc --noEmit`; TypeScript validation passed.
- [x] (2026-05-12 00:50Z) Re-ran `npm run lint`; Expo lint still reports only the existing warning in untouched `blueprnt/src/services/plans.ts`.

## Surprises & Discoveries

- The backend public user route is `GET /users/:user`, and `:user` currently resolves username or email. The desired frontend route value is `User.PK`, so the backend should also resolve `PK` at this route or expose a dedicated ID lookup route.
- The feed author type already includes `userId`, `username`, `profilePictureUrl`, and `isVerified`, which is enough to link post authors to a profile route.
- Follow creation exists as `POST /:userId/followers/:followerId`. Unfollow does not exist yet, so the frontend will target the natural matching `DELETE /:userId/followers/:followerId` contract and surface errors if the backend has not implemented it yet.
- Follower/following reads currently return relationship query results with `Items` and `Count`, not full profile objects. A follower relationship uses `sourceUserId`; a following relationship uses `targetUserId`.
- Current-user profile updates should call `PATCH /users/:username` with only non-empty `firstName`, `lastName`, and `bio` fields. `bio` must be limited to 30 characters.

## Decision Log

- Decision: Use `blueprnt/src/app/profile/index.tsx` for the signed-in user's profile and `blueprnt/src/app/profile/[userId].tsx` for other profiles.
  Rationale: This keeps profile outside the three existing tabs while allowing Home and Explore to link into the same reusable profile experience.
  Date/Author: 2026-05-11 / Codex

- Decision: Put reusable profile UI in `blueprnt/src/components/profile-screen.tsx` and keep fetch/mutation state in the route files.
  Rationale: The layout needs reuse, but API orchestration can remain route-local until profile behavior grows.
  Date/Author: 2026-05-11 / Codex

- Decision: Use `User.PK` as the route `userId` and URL-encode route/service path parameters.
  Rationale: The user said `User.PK` is the intended route ID, and PK values can contain characters such as `#` that must be encoded in paths.
  Date/Author: 2026-05-11 / Codex

- Decision: Keep `blueprnt/src/services/follows.ts` loose for now and normalize follow relationship records in `blueprnt/src/app/profile/[userId].tsx`.
  Rationale: The backend follow routes currently return DynamoDB relationship records rather than user profiles, and the user asked to preserve the looser service shape until the API response is tightened later.
  Date/Author: 2026-05-11 / Codex

- Decision: Keep the edit form route-local in `blueprnt/src/app/profile/index.tsx` and add only a small optional edit affordance to `ProfileScreen`.
  Rationale: Editing is currently only needed for the signed-in user's profile, while the reusable profile layout should stay mostly presentational.
  Date/Author: 2026-05-12 / Codex

## Outcomes & Retrospective

The app now has a reusable profile layout, a current-user profile route at `/profile`, and a dynamic other-user route at `/profile/[userId]`. Home exposes a profile button for the signed-in user, and post author/avatar taps navigate to the dynamic profile route. The dynamic route now uses relationship records only for counts and follow state, avoiding assumptions that follower/following routes return full users.

The current-user profile now has an edit modal for `firstName`, `lastName`, and `bio`. Empty fields are omitted from the PATCH body, submitting with all fields empty is blocked client-side, and bio entry is capped at 30 characters with a character counter.

TypeScript validation passes. Expo lint completed successfully but reported one warning in untouched `blueprnt/src/services/plans.ts` for an unused `userId` variable.

## Context and Orientation

The main app lives under `blueprnt/`. Expo Router route files live in `blueprnt/src/app/`, reusable UI components live in `blueprnt/src/components/`, API wrappers live in `blueprnt/src/services/`, and shared domain types live in `blueprnt/src/types/`.

The current tabs are defined by `blueprnt/src/app/(tabs)/_layout.tsx` and `blueprnt/src/components/app-tabs.tsx`, with Home at `blueprnt/src/app/(tabs)/index.tsx`. Home renders `PostCard` from `blueprnt/src/components/post-card.tsx`. User profile data is typed by `blueprnt/src/types/user.ts`, and current-user reads already live in `blueprnt/src/services/user.ts`.

## Plan of Work

1. Extend `blueprnt/src/services/user.ts` with a public profile read helper for `GET /users/:user`.
2. Add `blueprnt/src/services/follows.ts` for follower/following reads and follow/unfollow mutation helpers.
3. Build `blueprnt/src/components/profile-screen.tsx` as a presentational layout for user avatar, name, username, email, bio, and optional follow action.
4. Add `blueprnt/src/app/profile/index.tsx` for the signed-in user's profile using `getMe()`.
5. Add `blueprnt/src/app/profile/[userId].tsx` for other profiles using route params, `getUserProfile`, `getUserFollowers`, `followUser`, and `unfollowUser`.
6. Update `PostCard` to accept an optional `onAuthorPress` callback and update the Home screen to navigate to `/profile/[userId]`.
7. Run `npx tsc --noEmit` from `blueprnt/` and record results.
8. Add `updateUserProfile` to `blueprnt/src/services/user.ts` for `PATCH /users/:username`.
9. Add a current-user edit modal/form in `blueprnt/src/app/profile/index.tsx`, with empty-field omission, no-op submit prevention, and a 30-character bio limit.

## Concrete Steps

From the repository root, edit these files:

- `blueprnt/src/services/user.ts`
- `blueprnt/src/services/follows.ts`
- `blueprnt/src/components/profile-screen.tsx`
- `blueprnt/src/app/profile/index.tsx`
- `blueprnt/src/app/profile/[userId].tsx`
- `blueprnt/src/components/post-card.tsx`
- `blueprnt/src/app/(tabs)/index.tsx`
- `blueprnt/src/app/_layout.tsx` if explicit stack registration is needed
- `blueprnt/src/app/profile/index.tsx` for the current-user edit form

Then validate from `blueprnt/`:

```sh
npx tsc --noEmit
```

Optional lint check from `blueprnt/`:

```sh
npm run lint
```

## Validation and Acceptance

The change is accepted when TypeScript passes and the following app behavior is available:

- Opening `/profile` shows the signed-in user's profile fields and no follow button.
- Opening `/profile` shows an edit button. Submitting an edit with no fields entered does not send a request. Submitting non-empty `firstName`, `lastName`, or `bio` sends only those fields to `PATCH /users/:username`.
- Opening `/profile/:userId` shows another user's profile fields and a follow/unfollow button when the viewed user is not the signed-in user.
- Tapping a post author's avatar/name from Home navigates to that author's profile route.
- Loading and error states render without crashing.

Manual validation against a live backend remains important because `GET /users/:user` must resolve the route identifier and unfollow depends on a backend endpoint that is not implemented yet.

## Idempotence and Recovery

All service reads and TypeScript validation are safe to repeat. If Metro caches stale route state, restart Expo or run `npx expo start --clear` from `blueprnt/`. If backend profile lookups fail for `User.PK`, either update `GET /users/:user` to resolve PKs or temporarily navigate with username until the backend supports ID lookup.

## Artifacts and Notes

No generated assets are expected. The profile image uses `profilePictureUrl` through `expo-image`, matching the current `PostCard` avatar pattern.

## Interfaces and Dependencies

- `GET /users/:user` returns a `User` or `{ user: User }`.
- `GET /users/:userId/followers` returns user profiles or `{ followers: User[] }`.
- `GET /users/:userId/following` returns user profiles or `{ following: User[] }`.
- `POST /:userId/followers/:followerId` adds `followerId` as a follower of `userId`.
- Expected future route: `DELETE /:userId/followers/:followerId` removes `followerId` from `userId` followers.
- `PATCH /users/:username` updates the signed-in user's mutable profile fields and accepts any subset of `firstName`, `lastName`, and `bio`.
- Existing `EXPO_PUBLIC_API_BASE_URL` behavior in `blueprnt/src/services/client.ts` is unchanged.
