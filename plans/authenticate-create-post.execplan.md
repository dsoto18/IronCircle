# Authenticate Create Post

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Make the create-post flow use the logged-in Cognito user's access token instead of passing a temporary hardcoded user ID. After this change, `blueprnt/src/app/create-post.tsx` submits post content only, and `blueprnt/src/services/posts.ts` attaches the bearer token through the shared auth-session helper.

## Progress

- [x] (2026-05-10T00:00:44Z) Reviewed `blueprnt/src/app/create-post.tsx`, `blueprnt/src/services/posts.ts`, and existing authenticated service helpers.
- [x] (2026-05-10T00:01:10Z) Updated `blueprnt/src/services/posts.ts` to attach access-token auth headers.
- [x] (2026-05-10T00:01:10Z) Removed `TEST_USER_ID` and `userId` from `blueprnt/src/app/create-post.tsx`.
- [x] (2026-05-10T00:01:35Z) Ran TypeScript and lint validation.

## Surprises & Discoveries

- Observation: `blueprnt/src/services/posts.ts` already posts to `/posts`, not `/:userId/posts`.
  Evidence: `createPost` calls `client.post<CreatePostResponse>('/posts', body)`.

## Decision Log

- Decision: Use the shared `getAuthHeaders('accessToken')` helper for `createPost`.
  Rationale: Creating a post is an authenticated API action and does not require ID-token profile claims.
  Date/Author: 2026-05-10 / Codex

- Decision: Remove `userId` from `CreatePostInput`.
  Rationale: The backend can derive the posting user from the access token, and the service already targets `/posts`.
  Date/Author: 2026-05-10 / Codex

## Outcomes & Retrospective

Completed. `blueprnt/src/app/create-post.tsx` no longer sends a hardcoded user ID. `blueprnt/src/services/posts.ts` now posts to `/posts` with a Cognito access-token `Authorization` header from `getAuthHeaders('accessToken')`. TypeScript and lint both passed.

## Context and Orientation

`blueprnt/src/app/create-post.tsx` renders the post creation form and currently passes `TEST_USER_ID` to `createPost`. `blueprnt/src/services/posts.ts` owns the API payload normalization and calls the REST API through `blueprnt/src/services/client.ts`. `blueprnt/src/services/authSession.ts` provides the reusable Cognito auth header helper used by other authenticated services.

## Plan of Work

Import `getAuthHeaders` in `blueprnt/src/services/posts.ts`, remove `userId` from the `CreatePostInput` type and function destructuring, and pass access-token headers to `client.post('/posts', body, options)`. Then remove the `TEST_USER_ID` constant and `userId` field from `blueprnt/src/app/create-post.tsx`.

## Concrete Steps

From the repository root, inspect references:

```sh
rg "TEST_USER_ID|CreatePostInput|createPost\\(|getAuthHeaders" blueprnt/src/app/create-post.tsx blueprnt/src/services/posts.ts blueprnt/src/services/authSession.ts
```

Expect:

```text
The create-post route no longer references TEST_USER_ID and posts service uses getAuthHeaders.
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
Lint exits successfully.
```

## Validation and Acceptance

The change is accepted when `create-post.tsx` no longer has a hardcoded user ID, `createPost` attaches an access-token `Authorization` header, TypeScript passes, and lint passes. Manual validation with a live backend should confirm creating a post succeeds for the authenticated user.

Local validation completed: `npx tsc --noEmit` passed from `blueprnt/`. `npm run lint` passed from `blueprnt/`.

## Idempotence and Recovery

The search and validation commands are safe to repeat. If the backend rejects `POST /posts`, check that the backend route uses auth-derived user identity and that it accepts access tokens. If it still requires a user ID temporarily, restore the minimum compatible route shape in `posts.ts` without reintroducing a hardcoded user ID in the route screen.

## Artifacts and Notes

Validation artifact: `npx tsc --noEmit` passed on 2026-05-10T00:01:35Z. `npm run lint` passed on 2026-05-10T00:01:35Z.

## Interfaces and Dependencies

Affected files and interfaces:

- `blueprnt/src/app/create-post.tsx`
- `blueprnt/src/services/posts.ts`
- `blueprnt/src/services/authSession.ts`
- `blueprnt/src/services/client.ts`
- Backend `POST /posts` endpoint that authenticates with the Cognito bearer token
