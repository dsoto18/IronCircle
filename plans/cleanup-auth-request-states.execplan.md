# Cleanup Auth Request States

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Improve the authentication flow by preventing duplicate requests from auth/onboarding screens and by making `AuthGate` treat app-user API failures differently from missing Cognito sessions. After this change, users cannot double-submit login, register, confirm, resend-code, or onboarding requests, and a signed-in user is not automatically sent to login just because `/users/me` has a network/server failure.

## Progress

- [x] (2026-05-09T22:55:36Z) Reviewed current auth screens and `AuthGate` behavior.
- [x] (2026-05-09T22:57:00Z) Added in-flight submit state to `blueprnt/src/app/auth/login.tsx`.
- [x] (2026-05-09T22:57:00Z) Added in-flight submit state to `blueprnt/src/app/auth/register.tsx`.
- [x] (2026-05-09T22:57:00Z) Added separate confirm and resend state to `blueprnt/src/app/auth/confirm.tsx`.
- [x] (2026-05-09T22:57:00Z) Added in-flight submit state to `blueprnt/src/app/onboarding.tsx`.
- [x] (2026-05-09T22:57:30Z) Refactored `blueprnt/src/auth/AuthGate.tsx` to separate signed-out, onboarding, and API-error states.
- [x] (2026-05-09T22:57:55Z) Ran TypeScript and lint validation.
- [x] (2026-05-09T23:00:46Z) Verified and re-applied the confirm/resend in-flight state in `blueprnt/src/app/auth/confirm.tsx`; reran TypeScript and lint validation.

## Surprises & Discoveries

- Observation: `npm run lint` still reports duplicate React Native imports in `blueprnt/src/app/(tabs)/index.tsx`.
  Evidence: Lint exited with 0 errors and 2 warnings for `import/no-duplicates` in that unrelated file.

## Decision Log

- Decision: Keep the route-local request state in each screen instead of introducing a shared hook.
  Rationale: The forms are small, and the current repository guidance prefers route-local state until reuse is real.
  Date/Author: 2026-05-09 / Codex

- Decision: Show a simple retry state from `AuthGate` when Cognito is signed in but the app-user API check fails.
  Rationale: This avoids redirecting valid Cognito sessions to login during backend/network failures while keeping the first pass straightforward.
  Date/Author: 2026-05-09 / Codex

## Outcomes & Retrospective

Completed. Auth and onboarding screens now disable their request buttons while the matching operation is in flight. `AuthGate` now shows a retry state when Cognito has a signed-in user but `getMe()` fails, instead of treating that failure as logout. TypeScript passed. Lint exited successfully with only the existing duplicate-import warnings in the home tab file.

## Context and Orientation

`blueprnt/src/auth/AuthGate.tsx` wraps the Expo Router stack in `blueprnt/src/app/_layout.tsx`. It currently calls Cognito `getCurrentUser()` and the app-user `getMe()` service, then redirects between auth screens, onboarding, and the tab stack. The auth screens live in `blueprnt/src/app/auth/login.tsx`, `blueprnt/src/app/auth/register.tsx`, and `blueprnt/src/app/auth/confirm.tsx`. The app-user creation screen lives in `blueprnt/src/app/onboarding.tsx`.

## Plan of Work

Add `isSubmitting` state to login, register, and onboarding. Add `isConfirming` and `isResending` to confirmation because those buttons trigger different requests. Each handler should return early when its request is already in flight, set its flag before the async work, and clear the flag in `finally`. Buttons should pass `disabled` and use temporary progress titles such as `Logging in...` or `Creating account...`.

Refactor `AuthGate` to classify the session check. If `getCurrentUser()` fails, treat the user as signed out. If Cognito succeeds but `getMe()` fails for a non-onboarding reason, keep the user in an auth-check error state and show a retry button rather than redirecting to login. Preserve existing redirects for signed-out users, users needing onboarding, and users who already completed onboarding.

## Concrete Steps

From the repository root, inspect auth references:

```sh
rg "Button title|AuthGate|getMe|isSubmitting|isConfirming|isResending" blueprnt/src/app blueprnt/src/auth
```

Expect:

```text
Auth screens and AuthGate are the only files needing edits.
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

The change is accepted when TypeScript passes, lint has no new auth-flow warnings, auth/onboarding buttons disable during their matching requests, and `AuthGate` does not redirect a signed-in user to login solely because `getMe()` fails. Manual validation with a Cognito/backend setup should confirm the login, register, confirm, resend, onboarding, and retry flows.

Local validation completed: `npx tsc --noEmit` passed from `blueprnt/`. `npm run lint` exited successfully from `blueprnt/` with two unrelated duplicate-import warnings in `blueprnt/src/app/(tabs)/index.tsx`.

## Idempotence and Recovery

The validation commands are safe to repeat. If a screen gets stuck in a submitting state after a failed request, check that the handler clears state in `finally`. If the app gets stuck in the `AuthGate` retry view, verify whether Cognito has a current session and whether `GET /users/me` is reachable.

## Artifacts and Notes

Validation artifact: `npx tsc --noEmit` passed on 2026-05-09T23:00:46Z. `npm run lint` exited with 0 errors and 2 unrelated warnings on 2026-05-09T23:00:46Z.

## Interfaces and Dependencies

Affected files and interfaces:

- `blueprnt/src/auth/AuthGate.tsx`
- `blueprnt/src/app/auth/login.tsx`
- `blueprnt/src/app/auth/register.tsx`
- `blueprnt/src/app/auth/confirm.tsx`
- `blueprnt/src/app/onboarding.tsx`
- `blueprnt/src/services/user.ts` through `getMe()` and `createCurrentUser()`
- Cognito session state through `aws-amplify/auth`
