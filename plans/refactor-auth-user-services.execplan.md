# Refactor Auth User Services

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Move app-database user API calls into the existing `blueprnt/src/services/` pattern so authenticated user reads and onboarding user creation share the same base URL handling as the rest of the app. Keep Cognito SDK calls in an auth service wrapper because they do not use the REST API client. After this change, login, confirmation, onboarding, and route gating continue to behave the same from the user perspective, but hardcoded app API URLs are removed from the auth flow.

## Progress

- [x] (2026-05-09T22:09:25Z) Reviewed existing auth files, service patterns, and `PLANS.md`.
- [x] (2026-05-09T22:10:20Z) Added app-user service functions under `blueprnt/src/services/user.ts`.
- [x] (2026-05-09T22:10:20Z) Routed Cognito resend confirmation through `blueprnt/src/auth/authService.ts`.
- [x] (2026-05-09T22:10:20Z) Updated auth screens and `AuthGate` imports to use the refactored service layout.
- [x] (2026-05-09T22:11:02Z) Ran `npx tsc --noEmit` from `blueprnt/`; it passed.
- [x] (2026-05-09T22:11:55Z) Ran `npm run lint` from `blueprnt/`; it exited with warnings only for duplicate React Native imports in `blueprnt/src/app/(tabs)/index.tsx`.

## Surprises & Discoveries

- Observation: `blueprnt/src/auth/userService.ts` uses the Cognito access token for `GET /users/me`, while `blueprnt/src/app/onboarding.tsx` uses the ID token for `POST /users`.
  Evidence: Token reads in those two files use `session.tokens?.accessToken` and `session.tokens?.idToken`, respectively.
- Observation: TypeScript passed before the refactor.
  Evidence: `npx tsc --noEmit` exited successfully from `blueprnt/`.

## Decision Log

- Decision: Keep Cognito SDK wrappers in `blueprnt/src/auth/authService.ts` for this pass instead of moving them to `blueprnt/src/services/auth.ts`.
  Rationale: The requested refactor focuses on app-database user calls and avoids a larger import churn while preserving the current `@/auth/authService` contract.
  Date/Author: 2026-05-09 / Codex

- Decision: Move app-database user calls to `blueprnt/src/services/user.ts`, singular, to match the user's requested `src/services/user.ts` setup.
  Rationale: This aligns authenticated user API calls with existing domain service modules that call `client.ts`.
  Date/Author: 2026-05-09 / Codex

- Decision: Centralize Cognito token extraction in the new user service but preserve the current endpoint token choices for now.
  Rationale: The backend may currently depend on the ID token's email claim for onboarding, while `GET /users/me` already works with the access token. Centralizing the choice makes a future backend-driven switch smaller.
  Date/Author: 2026-05-09 / Codex

## Outcomes & Retrospective

Completed. App-database user calls now live in `blueprnt/src/services/user.ts` and use `blueprnt/src/services/client.ts`, removing hardcoded auth-flow API base URLs. `blueprnt/src/auth/userService.ts` was removed. Cognito resend-code calls now go through `blueprnt/src/auth/authService.ts`. TypeScript validation passed. Lint exited successfully with two unrelated warnings in the home tab file. Manual validation against a live Cognito/backend environment remains recommended.

## Context and Orientation

The Expo Router routes involved are `blueprnt/src/app/auth/login.tsx`, `blueprnt/src/app/auth/register.tsx`, `blueprnt/src/app/auth/confirm.tsx`, and `blueprnt/src/app/onboarding.tsx`. `blueprnt/src/auth/AuthGate.tsx` wraps the app tree in `blueprnt/src/app/_layout.tsx` and currently checks both Cognito session state and whether the app database user exists. Existing REST domain services live under `blueprnt/src/services/` and call `blueprnt/src/services/client.ts`, which reads `EXPO_PUBLIC_API_BASE_URL` or falls back to local development URLs.

Today, `blueprnt/src/auth/userService.ts` manually calls `fetch` against a hardcoded `http://localhost:3000` base URL for `GET /users/me`. `blueprnt/src/app/onboarding.tsx` manually does the same for `POST /users`. `blueprnt/src/app/auth/confirm.tsx` imports `resendSignUpCode` directly from `aws-amplify/auth`, while other Cognito calls are wrapped in `blueprnt/src/auth/authService.ts`.

## Plan of Work

Add `blueprnt/src/services/user.ts` with explicit response and payload types. This module will import `fetchAuthSession` from `aws-amplify/auth` to build an `Authorization: Bearer ...` header, then call `client.get` and `client.post` for `/users/me` and `/users`.

Update `blueprnt/src/app/onboarding.tsx` to call `createCurrentUser` from the new service instead of manually fetching. Update `blueprnt/src/app/auth/login.tsx`, `blueprnt/src/app/auth/confirm.tsx`, and `blueprnt/src/auth/AuthGate.tsx` to import `getMe` from `@/services/user`. Add `resendRegistrationCode` to `blueprnt/src/auth/authService.ts` and update `confirm.tsx` to use it instead of importing Amplify directly.

Remove `blueprnt/src/auth/userService.ts` once no imports remain. Do not change the known `AuthGate` failure behavior yet; that will be handled in a later cleanup.

## Concrete Steps

From the repository root, inspect references:

```sh
rg "userService|getMe|resendSignUpCode|API_BASE_URL" blueprnt/src
```

Expect:

```text
Only the auth/onboarding files reference these symbols before the refactor.
```

From `blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
The TypeScript check exits successfully.
```

## Validation and Acceptance

The refactor is accepted when `npx tsc --noEmit` passes and no `blueprnt/src/auth/userService.ts`, direct route-level `resendSignUpCode` import, or hardcoded `API_BASE_URL` remains in auth/onboarding route code. Manual app validation, when a backend and Cognito test user are available, should confirm: login routes users to onboarding or tabs based on `GET /users/me`; confirmation can resend a code; onboarding creates the app database user and routes to tabs.

## Idempotence and Recovery

The search and TypeScript commands are safe to repeat. If the refactor partially applies, re-run `rg "userService|getMe|resendSignUpCode|API_BASE_URL" blueprnt/src` to find stale imports or hardcoded calls. If the backend rejects the token used by either user endpoint, update the token type in the new user service helper rather than reintroducing per-screen token fetching.

## Artifacts and Notes

Access token versus ID token note: for API authorization, access tokens are usually the preferred bearer token. ID tokens primarily prove identity to the client and commonly include profile claims such as email. This repository currently uses both, likely because onboarding expects email from the token. The refactor preserves that behavior while making the choice explicit in one service file.

Validation artifact: `npx tsc --noEmit` passed from `blueprnt/` on 2026-05-09T22:11:55Z. `npm run lint` exited successfully from `blueprnt/` on 2026-05-09T22:11:55Z with two duplicate-import warnings in `blueprnt/src/app/(tabs)/index.tsx`.

## Interfaces and Dependencies

Affected files and interfaces:

- `blueprnt/src/services/client.ts` provides `client.get` and `client.post`.
- `blueprnt/src/services/user.ts` will provide `getMe` and `createCurrentUser`.
- `blueprnt/src/auth/authService.ts` wraps Cognito SDK calls.
- `blueprnt/src/auth/AuthGate.tsx` reads app-user onboarding state.
- `blueprnt/src/app/auth/login.tsx` reads app-user onboarding state after sign-in.
- `blueprnt/src/app/auth/confirm.tsx` confirms and resends Cognito verification codes.
- `blueprnt/src/app/onboarding.tsx` creates the app database user.
- Environment variable `EXPO_PUBLIC_API_BASE_URL` remains the preferred API base URL configuration through `client.ts`.
- Backend endpoints used are `GET /users/me` and `POST /users`.
