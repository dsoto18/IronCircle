# Authenticated Home Feed

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Refactor the home feed away from temporary hardcoded user IDs and toward Cognito-authenticated API calls. The home feed route should ask the feed service for the current user's feed without passing `TEST_USER_ID`, while service modules attach the Cognito access token through the shared REST client options.

## Progress

- [x] (2026-05-09T23:44:40Z) Reviewed the home feed route, feed service, likes service, and current user auth header logic.
- [x] (2026-05-09T23:45:20Z) Added a reusable auth-session header helper under `blueprnt/src/services/`.
- [x] (2026-05-09T23:45:20Z) Updated `blueprnt/src/services/user.ts` to use the shared auth-session helper.
- [x] (2026-05-09T23:45:20Z) Updated `blueprnt/src/services/feed.ts` to attach an access-token `Authorization` header and remove the required user ID argument.
- [x] (2026-05-09T23:45:20Z) Updated `blueprnt/src/services/likes.ts` to attach an access-token `Authorization` header and stop requiring `userId` in the like payload.
- [x] (2026-05-09T23:45:20Z) Removed `TEST_USER_ID` from `blueprnt/src/app/(tabs)/index.tsx`.
- [x] (2026-05-09T23:45:47Z) Ran TypeScript and lint validation.

## Surprises & Discoveries

- Observation: Other screens still have temporary `TEST_USER_ID` values, but this task only targets the home feed route.
  Evidence: `rg "TEST_USER_ID" blueprnt/src` shows references in `create-post.tsx`, `plan-builder.tsx`, and the home feed route.
- Observation: Removing the duplicate React Native import in the home feed route cleared the previous lint warning.
  Evidence: `npm run lint` exited with no output after the refactor.

## Decision Log

- Decision: Do not manually store Cognito tokens in app state, AsyncStorage, or module-level variables.
  Rationale: Amplify manages session persistence and token refresh; services can request the current session immediately before authenticated API calls.
  Date/Author: 2026-05-09 / Codex

- Decision: Add `blueprnt/src/services/authSession.ts` for auth header creation instead of duplicating `fetchAuthSession()` in every domain service.
  Rationale: It keeps token selection centralized while preserving the existing `client.ts` as a generic HTTP layer.
  Date/Author: 2026-05-09 / Codex

- Decision: Use the Cognito access token for feed and like API requests.
  Rationale: These are API authorization calls and do not need ID-token profile claims.
  Date/Author: 2026-05-09 / Codex

## Outcomes & Retrospective

Completed. The home feed route no longer defines or passes a hardcoded user ID. Feed, like, and unlike service calls now attach a Cognito access-token `Authorization` header through `blueprnt/src/services/authSession.ts`. `blueprnt/src/services/user.ts` also uses the shared auth-header helper. TypeScript and lint both passed.

## Context and Orientation

`blueprnt/src/app/(tabs)/index.tsx` is the home feed screen. It currently defines `TEST_USER_ID`, passes it to `getFeed(TEST_USER_ID)`, and includes it in the like/unlike payload. `blueprnt/src/services/feed.ts` currently calls `/feed/${userId}` with no auth header. `blueprnt/src/services/likes.ts` currently sends `userId` in the request body and does not attach an auth header. `blueprnt/src/services/user.ts` already has private auth header logic for `/users/me` and onboarding.

## Plan of Work

Create `blueprnt/src/services/authSession.ts` with a `getAuthHeaders` helper that calls Amplify `fetchAuthSession()` and returns `Authorization: Bearer <token>`. Keep support for both access and ID tokens because onboarding currently needs the ID token email claim, but use access tokens for feed and likes.

Update `blueprnt/src/services/user.ts` to import this helper. Update `blueprnt/src/services/feed.ts` so `getFeed()` takes no user ID and calls the authenticated feed endpoint. Update `blueprnt/src/services/likes.ts` so `likePost` and `unlikePost` attach the access token and no longer require `userId` in their payload. Update `blueprnt/src/app/(tabs)/index.tsx` to remove `TEST_USER_ID`, call `getFeed()`, and build like payloads without user IDs.

## Concrete Steps

From the repository root, inspect remaining hardcoded home IDs:

```sh
rg "TEST_USER_ID|getFeed\\(|LikePostPayload|fetchAuthSession|getAuthHeaders" blueprnt/src
```

Expect:

```text
The home feed route no longer uses TEST_USER_ID after the refactor.
```

From `blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
The TypeScript check exits successfully.
```

From `blueprnt/`, run:

```sh
npm run lint
```

Expect:

```text
Lint exits successfully. Any unrelated warnings are recorded.
```

## Validation and Acceptance

The refactor is accepted when the home feed no longer references `TEST_USER_ID`, `getFeed()` attaches the access token, like/unlike attach the access token, and TypeScript passes. Manual validation with a live backend should confirm the home feed loads for the authenticated user and like/unlike still mutate the correct post.

Local validation completed: `npx tsc --noEmit` passed from `blueprnt/`. `npm run lint` passed from `blueprnt/`.

## Idempotence and Recovery

The validation and search commands are safe to repeat. If the backend still exposes `/feed/:userId` instead of an auth-derived `/feed`, adjust only `blueprnt/src/services/feed.ts` to match the backend route while preserving the auth header. If like/unlike still require `userId`, temporarily restore the payload field from a backend-provided current-user value rather than reintroducing a hardcoded ID.

## Artifacts and Notes

Validation artifact: `npx tsc --noEmit` passed on 2026-05-09T23:45:47Z. `npm run lint` passed on 2026-05-09T23:45:47Z.

## Interfaces and Dependencies

Affected files and interfaces:

- `blueprnt/src/app/(tabs)/index.tsx`
- `blueprnt/src/services/authSession.ts`
- `blueprnt/src/services/feed.ts`
- `blueprnt/src/services/likes.ts`
- `blueprnt/src/services/user.ts`
- `blueprnt/src/services/client.ts`
- Cognito session state through `aws-amplify/auth`
- Backend feed and like endpoints that authorize requests from the Cognito bearer token
