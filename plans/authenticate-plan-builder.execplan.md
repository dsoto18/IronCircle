# Authenticate Plan Builder

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Refactor the plan builder away from a hardcoded user ID and toward Cognito-authenticated plan API calls. The route and builder shell should not pass `userId` through request bodies anymore. Protected plan service calls should attach the logged-in user's access token, and any route path that still needs a user ID should derive it from the current Cognito session.

## Progress

- [x] (2026-05-10T00:21:47Z) Reviewed `blueprnt/src/app/plan-builder.tsx`, `blueprnt/src/components/plan-builder-shell.tsx`, and `blueprnt/src/services/plans.ts`.
- [x] (2026-05-10T00:22:20Z) Added current-user ID extraction to `blueprnt/src/services/authSession.ts`.
- [x] (2026-05-10T00:22:45Z) Updated `blueprnt/src/services/plans.ts` to attach access-token auth headers and remove `userId` request-body fields.
- [x] (2026-05-10T00:23:05Z) Removed hardcoded `TEST_USER_ID` and `userId` props from the plan builder UI.
- [x] (2026-05-10T00:23:27Z) Ran TypeScript and lint validation.

## Surprises & Discoveries

- Observation: `getUserPlans` and `createPlan` currently include `userId` in the URL path, while nested plan mutations include it in request bodies.
  Evidence: `blueprnt/src/services/plans.ts` calls `/${userId}/plans`, `/plans/${planId}/weeks`, `/plan/${planId}/publish`, and `/plans/${planId}/weeks/${weekNumber}/days`.

## Decision Log

- Decision: Keep user ID in URL paths where the existing service route requires it, but derive that value from the current Cognito session.
  Rationale: The request specifically removes hardcoded/body `userId`; preserving current path shapes avoids guessing backend route renames.
  Date/Author: 2026-05-10 / Codex

- Decision: Remove `userId` from `PlanBuilderShell` props and plan mutation input types.
  Rationale: The UI should not own authenticated user identity for request bodies now that the backend can authorize from the bearer token.
  Date/Author: 2026-05-10 / Codex

- Decision: Use Cognito access tokens for protected plan calls.
  Rationale: Plan reads/mutations are API authorization calls and do not need ID-token profile claims.
  Date/Author: 2026-05-10 / Codex

## Outcomes & Retrospective

Completed. The plan builder route no longer has `TEST_USER_ID`; `PlanBuilderShell` no longer accepts or passes `userId`; protected plan service calls now attach the Cognito access-token header; and plan mutation request bodies no longer include `userId`. Existing user-id URL paths are still supported by deriving the ID from the current Cognito access token payload.

## Context and Orientation

`blueprnt/src/app/plan-builder.tsx` currently defines `TEST_USER_ID`, passes it to `getUserPlans(TEST_USER_ID)`, and passes it into `PlanBuilderShell`. `blueprnt/src/components/plan-builder-shell.tsx` accepts `userId` and passes it into `createPlan`, `createWeek`, `publishPlan`, and `createDay`. `blueprnt/src/services/plans.ts` owns plan API wrappers. `blueprnt/src/services/authSession.ts` already builds Cognito auth headers.

## Plan of Work

Add a `getCurrentUserId` helper in `authSession.ts` that reads the Cognito access token payload `sub`. Update `plans.ts` so `getUserPlans` and `createPlan` take no `userId` argument but still build their existing user-id URL paths from `getCurrentUserId()`. Add access-token headers to protected plan service calls. Remove `userId` from `CreatePlanInput`, `CreateWeekInput`, `PublishPlanInput`, and `CreateDayInput`, and ensure request bodies do not include user IDs.

Update `plan-builder.tsx` to call `getUserPlans()` and render `PlanBuilderShell` without a `userId` prop. Update `plan-builder-shell.tsx` to remove the prop and omit `userId` from all plan mutation calls.

## Concrete Steps

From the repository root, inspect references:

```sh
rg "TEST_USER_ID|userId|getUserPlans\\(|createPlan\\(|createWeek\\(|publishPlan\\(|createDay\\(" blueprnt/src/app/plan-builder.tsx blueprnt/src/components/plan-builder-shell.tsx blueprnt/src/services/plans.ts blueprnt/src/services/authSession.ts
```

Expect:

```text
No TEST_USER_ID remains in plan-builder, and userId is not passed into plan mutation request bodies.
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

The change is accepted when the plan builder route no longer has a hardcoded user ID, `PlanBuilderShell` no longer accepts or passes `userId`, protected plan services attach the access-token header, and TypeScript/lint pass. Manual validation with a live backend should confirm loading user plans, opening a draft, creating a plan, adding weeks/days, and publishing still work for the authenticated user.

Local validation completed: `npx tsc --noEmit` passed from `blueprnt/`. `npm run lint` passed from `blueprnt/`.

## Idempotence and Recovery

The search and validation commands are safe to repeat. If backend plan routes have changed to fully auth-derived paths, update only `blueprnt/src/services/plans.ts` route strings while keeping auth headers and keeping `userId` out of request bodies. If token payload extraction fails, verify Cognito access tokens include `sub`; otherwise switch `getCurrentUserId` to Amplify `getCurrentUser()`.

## Artifacts and Notes

Validation artifact: `npx tsc --noEmit` passed on 2026-05-10T00:23:27Z. `npm run lint` passed on 2026-05-10T00:23:27Z.

## Interfaces and Dependencies

Affected files and interfaces:

- `blueprnt/src/app/plan-builder.tsx`
- `blueprnt/src/components/plan-builder-shell.tsx`
- `blueprnt/src/services/plans.ts`
- `blueprnt/src/services/authSession.ts`
- `blueprnt/src/services/client.ts`
- Backend plan endpoints that authenticate with the Cognito bearer token
