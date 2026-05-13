# Profile Picture Upload Support

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Add photo-library image selection to the existing update-profile workflow only. A user editing their own profile should be able to pick a profile picture, preview it in the edit modal, upload it directly to S3 through `POST /media/upload-url`, and save the returned `pictureUrl` as `profilePictureUrl` through the existing user update API. The onboarding/create-user screen must remain unchanged.

## Progress

- [x] (2026-05-13 18:09Z) Reviewed `blueprnt/src/app/profile/index.tsx`, `blueprnt/src/services/user.ts`, `blueprnt/src/services/media.ts`, `blueprnt/src/types/user.ts`, and profile display components.
- [x] (2026-05-13 18:10Z) Generalized the media upload service so post and profile image uploads share content-type inference, blob conversion, and direct S3 upload behavior.
- [x] (2026-05-13 18:10Z) Extended `UpdateUserProfileInput` so `profilePictureUrl` can be sent by `updateUserProfile`.
- [x] (2026-05-13 18:11Z) Added image picking, preview, change/remove controls, and staged upload/save state to `blueprnt/src/app/profile/index.tsx`.
- [x] (2026-05-13 18:12Z) Ran `npx tsc --noEmit` from `blueprnt/`; it completed successfully.
- [x] (2026-05-13 18:12Z) Ran `npm run lint` from `blueprnt/`; it exited successfully with the same unrelated warnings in `src/app/(tabs)/explore.tsx`.

## Surprises & Discoveries

- Observation: The profile update modal lives directly in `blueprnt/src/app/profile/index.tsx`.
  Evidence: The route owns `isEditOpen`, edit form state, and calls `updateUserProfile`.
- Observation: The onboarding create-user service does not accept or send profile images.
  Evidence: `CreateCurrentUserInput` in `blueprnt/src/services/user.ts` only contains `username`, `firstName`, and `lastName`.
- Observation: The app already displays `user.profilePictureUrl` in `ProfileScreen`, search cards, and feed post authors.
  Evidence: `profilePictureUrl` is already part of the `User` and feed author types.
- Observation: `create-post.tsx` had local content-type inference and local URI blob conversion after the first image-upload pass.
  Evidence: The route had `inferPostImageContentType` and `getBlobFromUri` helpers before this change.
- Observation: Lint still reports unrelated existing warnings in the Explore tab.
  Evidence: `npm run lint` reports unused `EXPLORE_FILTERS` and `setSelectedFilter` in `blueprnt/src/app/(tabs)/explore.tsx` and exits with code 0.

## Decision Log

- Decision: Keep the picker/upload state in `blueprnt/src/app/profile/index.tsx`.
  Rationale: Profile image editing is currently local to the current-user profile route, and extracting a hook would add indirection before reuse exists.
  Date/Author: 2026-05-13 / Codex
- Decision: Reuse and generalize `blueprnt/src/services/media.ts` instead of duplicating upload helpers in the profile route.
  Rationale: Create-post and profile-picture uploads need the same supported content types, local URI to blob conversion, and direct S3 upload behavior.
  Date/Author: 2026-05-13 / Codex
- Decision: Use `imageType: 'profile'` for profile-picture presigned URL requests.
  Rationale: This keeps S3 object generation distinct from post images while matching the frontend field name `profilePictureUrl`. If the backend expects a different literal, only the profile upload wrapper in `media.ts` should need changing.
  Date/Author: 2026-05-13 / Codex
- Decision: Do not add profile-picture picking to onboarding.
  Rationale: The user explicitly asked for image picking only in the update-profile workflow.
  Date/Author: 2026-05-13 / Codex

## Outcomes & Retrospective

- `blueprnt/src/services/media.ts` now has shared supported-image content-type inference, local URI blob conversion, generic `createImageUploadUrl`, and separate `createPostImageUploadUrl` / `createProfileImageUploadUrl` wrappers.
- `blueprnt/src/app/create-post.tsx` now uses the shared media helpers instead of route-local upload helper code.
- `blueprnt/src/services/user.ts` now allows `profilePictureUrl` in `UpdateUserProfileInput`.
- `blueprnt/src/app/profile/index.tsx` now adds profile-photo controls only to the edit-profile modal, previews the current or selected photo, lets the user change/remove a pending local selection, and uploads the selected image directly to S3 before saving the user profile.
- TypeScript validation passes. Lint exits successfully with unrelated existing warnings in the Explore tab. Runtime validation remains with the user's already-running app.

## Context and Orientation

- `blueprnt/src/app/profile/index.tsx` is the current-user profile route. It loads the current user, displays `ProfileScreen`, and owns the edit-profile modal.
- `blueprnt/src/services/user.ts` has `updateUserProfile(username, input)` and currently types the update body as optional `firstName`, `lastName`, and `bio`.
- `blueprnt/src/services/media.ts` was introduced for create-post images and already calls the presigned upload route and uploads blobs directly to S3.
- `blueprnt/src/app/onboarding.tsx` uses `createCurrentUser` and must remain unchanged.
- `blueprnt/src/components/profile-screen.tsx` already renders `user.profilePictureUrl`, so saving that URL on the user should update the visible avatar once route state is refreshed.

## Plan of Work

Refactor `blueprnt/src/services/media.ts` to expose shared supported-image helpers and a profile-specific upload URL function. Update `blueprnt/src/app/create-post.tsx` to use the shared media helpers. Extend `UpdateUserProfileInput` in `blueprnt/src/services/user.ts` with optional `profilePictureUrl`. In `blueprnt/src/app/profile/index.tsx`, import `expo-image-picker`, preview either the selected image or current profile picture in the edit modal, support choose/change/remove for the selected local image, and on save upload the selected local image to S3 before calling `updateUserProfile` with `profilePictureUrl`. Disable modal controls during picking, uploading, and saving.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, update this plan as work proceeds.

Update these files:

```text
blueprnt/src/services/media.ts
blueprnt/src/services/user.ts
blueprnt/src/app/create-post.tsx
blueprnt/src/app/profile/index.tsx
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully after the shared media helper and profile update changes.
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npm run lint
```

Expect:

```text
Lint exits successfully. Any unrelated pre-existing warnings should be noted.
```

Do not start another Expo process; the user already has the project running. In the running app, validate:

```text
Opening your own profile, tapping Edit, choosing a photo, previewing it, and saving uploads directly to S3 and updates the user with profilePictureUrl.
```

## Validation and Acceptance

- `npx tsc --noEmit` from `blueprnt/` succeeds.
- `npm run lint` from `blueprnt/` succeeds or only reports unrelated existing warnings.
- Onboarding remains unchanged and has no profile-picture picker.
- The current-user profile edit modal shows profile-picture controls.
- Choosing an image opens the Expo image picker and previews the selected image.
- The selected local image can be changed or removed before save.
- Saving without a selected image preserves the existing update behavior for first name, last name, and bio.
- Saving with a selected image calls `POST /media/upload-url`, uploads the blob directly to S3 with `PUT`, then sends `profilePictureUrl` in the user update request.
- Controls are disabled while picking, uploading, or saving, and errors are shown without clearing the form.

## Idempotence and Recovery

- Re-running `npx tsc --noEmit` and `npm run lint` is safe.
- Re-selecting a profile image before saving replaces only the local pending selection.
- If image upload succeeds but profile update fails, retrying can upload the same local image again and produce another S3 object; cleanup of duplicate test objects would be backend/S3-side.
- If the backend expects an `imageType` literal other than `'profile'`, update `createProfileImageUploadUrl` in `blueprnt/src/services/media.ts` and retry.
- If the picker crashes in a custom native build, rebuild the native app so `expo-image-picker` and the photo usage description are included.

## Artifacts and Notes

- Presigned URL endpoint: `POST /media/upload-url`.
- Profile upload request body: `{ imageType: 'profile', contentType }`.
- Upload response body: `{ uploadUrl, imageKey, pictureUrl }`; profile update uses `pictureUrl` as `profilePictureUrl`.
- The image file must go directly from mobile client to S3; the backend only generates the presigned URL.

## Interfaces and Dependencies

- Dependency:
  - `expo-image-picker`
- Route:
  - `blueprnt/src/app/profile/index.tsx`
- Services:
  - `blueprnt/src/services/media.ts`
  - `blueprnt/src/services/user.ts`
- Existing display components:
  - `blueprnt/src/components/profile-screen.tsx`
  - `blueprnt/src/components/post-card.tsx`
- Backend APIs:
  - `POST /media/upload-url`
  - `PATCH /users/:username`
