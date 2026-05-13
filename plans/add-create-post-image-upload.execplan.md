# Create Post Image Upload Support

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md` and `AGENTS.md`.

## Purpose / Big Picture

Update the existing create-post flow so a signed-in user can choose an image from the device photo library, preview it, remove or change it, upload it directly to S3 through a backend-generated presigned URL, and then create the post with the resulting `imageUrl` and `imageKey`. Success is observable when `/create-post` works with or without a selected image, disables duplicate submission while upload/create work is in flight, and never sends the image file bytes through the application backend.

## Progress

- [x] (2026-05-13 16:18Z) Reviewed `blueprnt/src/app/create-post.tsx`, `blueprnt/src/services/posts.ts`, `blueprnt/src/services/client.ts`, `blueprnt/src/services/authSession.ts`, `blueprnt/src/types/post.ts`, and existing create-post plan notes.
- [x] (2026-05-13 16:20Z) Added `expo-image-picker` to the Expo app dependencies with `npx expo install expo-image-picker`.
- [x] (2026-05-13 16:21Z) Added `blueprnt/src/services/media.ts` for authenticated presigned URL requests and direct S3 blob uploads.
- [x] (2026-05-13 16:21Z) Extended create-post service/types so posts can include `imageKey` along with `imageUrl`.
- [x] (2026-05-13 16:22Z) Updated `/create-post` UI to pick, preview, remove/change, upload, and submit image-backed posts.
- [x] (2026-05-13 16:24Z) Ran `npx tsc --noEmit` from `blueprnt/`; it completed successfully.
- [x] (2026-05-13 16:24Z) Ran `npm run lint` from `blueprnt/`; it exited successfully with two unrelated warnings in `src/app/(tabs)/explore.tsx`.
- [x] (2026-05-13 16:26Z) Attempted to start Expo for a smoke check, but port 8081 was already occupied and the user clarified not to run the project because they already have it running.
- [x] (2026-05-13 16:34Z) Hardened the image picker launch path after a crash report by adding `expo-image-picker` plugin configuration, adding an iOS photo-library usage description locally, and removing the upfront media-library permission request before launching the picker.
- [x] (2026-05-13 16:34Z) Re-ran `npx tsc --noEmit` and `npm run lint` from `blueprnt/`; both completed successfully, with the same unrelated Explore warnings.

## Surprises & Discoveries

- Observation: `expo-image-picker` is not currently listed in `blueprnt/package.json`.
  Evidence: Dependency review and repository search found no `expo-image-picker` import or package entry.
- Observation: `blueprnt/src/app/create-post.tsx` currently exposes a manual `Image URL` input.
  Evidence: The route owns `imageUrl` text state and passes it directly to `createPost`.
- Observation: `blueprnt/src/services/posts.ts` already uses `getAuthHeaders('accessToken')` and the shared `client.post` helper.
  Evidence: The create-post service sends authenticated requests through `client.post<CreatePostResponse>('/posts', ...)`.
- Observation: The first dependency install attempt failed because sandbox networking could not resolve `registry.npmjs.org`.
  Evidence: `npx expo install expo-image-picker` exited with `ENOTFOUND`; rerunning with approved network access completed successfully.
- Observation: The project lint script currently reports two warnings outside this feature.
  Evidence: `npm run lint` reports unused values in `blueprnt/src/app/(tabs)/explore.tsx` and exits with code 0.
- Observation: Runtime validation should be left to the user in their already-running Expo session.
  Evidence: The user explicitly said not to run the project because they already have it running and can check it themselves.
- Observation: The checked-in Expo config did not include the `expo-image-picker` config plugin or photo-library permission text.
  Evidence: `blueprnt/app.json` had `expo-router`, `expo-splash-screen`, and `expo-secure-store` plugins only.
- Observation: This repo has a local native iOS project that is ignored by git.
  Evidence: `blueprnt/ios/blueprnt/Info.plist` exists and `git check-ignore` reports `blueprnt/.gitignore:42:/ios`.

## Decision Log

- Decision: Add a dedicated `blueprnt/src/services/media.ts` wrapper for `POST /media/upload-url`.
  Rationale: The backend route is a domain API call and should reuse the app's existing auth/client pattern while keeping `client.ts` generic.
  Date/Author: 2026-05-13 / Codex
- Decision: Upload the selected blob to S3 with a direct `fetch(uploadUrl, { method: 'PUT' })` instead of the app API client.
  Rationale: The presigned URL points outside the backend base URL, and the backend should only generate the URL, not receive the image bytes.
  Date/Author: 2026-05-13 / Codex
- Decision: Keep image-picker and upload mutation state in `blueprnt/src/app/create-post.tsx`.
  Rationale: The behavior is local to this route for now; extracting a hook would add indirection before reuse exists.
  Date/Author: 2026-05-13 / Codex
- Decision: Remove the manual `Image URL` input from the create-post screen.
  Rationale: User-selected local images should be uploaded through the presigned URL flow, and manual URL entry would create competing image sources in the composer.
  Date/Author: 2026-05-13 / Codex
- Decision: Launch the image library directly instead of explicitly calling `requestMediaLibraryPermissionsAsync` first.
  Rationale: Expo's modern image library picker can present the system picker directly, and avoiding the explicit permission request prevents an iOS privacy-permission crash before the picker appears when native permission text is missing or stale.
  Date/Author: 2026-05-13 / Codex
- Decision: Add `expo-image-picker` plugin config to `app.json` and add `NSPhotoLibraryUsageDescription` to the local ignored iOS plist.
  Rationale: The tracked Expo config should persist the permission text for future prebuilds, while the local iOS project needs the permission string in the actual native plist used by the current development binary.
  Date/Author: 2026-05-13 / Codex

## Outcomes & Retrospective

- `blueprnt/package.json` and `blueprnt/package-lock.json` now include `expo-image-picker`.
- `blueprnt/src/services/media.ts` wraps `POST /media/upload-url` with auth headers and performs direct S3 `PUT` uploads without routing image bytes through the backend.
- `blueprnt/src/services/posts.ts` now accepts optional `imageUrl` and `imageKey` and only includes them in the create-post request when present.
- `blueprnt/src/types/post.ts` now models optional `imageKey` on `Post`.
- `blueprnt/src/app/create-post.tsx` now lets users choose, preview, change, or remove a selected image and stages submit state as `Uploading...` then `Posting...`. The picker opens directly without a separate media-library permission request.
- `blueprnt/app.json` now configures the `expo-image-picker` plugin with photo-library permission text and disables unused camera/microphone permission additions.
- The local ignored iOS plist at `blueprnt/ios/blueprnt/Info.plist` now includes `NSPhotoLibraryUsageDescription`.
- TypeScript validation passes. Lint exits successfully with unrelated pre-existing warnings in the Explore tab. Runtime validation against the user's already-running app and live backend/S3 target remains the main manual check.

## Context and Orientation

- `blueprnt/src/app/create-post.tsx` is the Expo Router route for the composer. It currently owns form state, loading state, error state, and calls `createPost` directly.
- `blueprnt/src/services/posts.ts` is the create-post service. It normalizes optional metric values, injects `visibility: 'followers'`, and authenticates with `getAuthHeaders('accessToken')`.
- `blueprnt/src/services/client.ts` is the generic REST client for backend-relative paths and JSON bodies.
- `blueprnt/src/services/authSession.ts` provides auth headers from Amplify.
- `blueprnt/src/types/post.ts` models post data consumed by feed cards. It currently has `imageUrl?: string` but no `imageKey`.
- `blueprnt/src/components/post-card.tsx` already renders `post.imageUrl` through `expo-image`, so uploaded image posts should appear in the feed as long as the backend returns `imageUrl`.

## Plan of Work

Install `expo-image-picker` with the Expo-compatible version. Add `blueprnt/src/services/media.ts` with explicit request/response types and an authenticated `createPostImageUploadUrl` function. Extend `CreatePostInput` and `Post` to include optional `imageKey`, and have `createPost` include `imageUrl` and `imageKey` only when available. Replace the manual Image URL form field in `blueprnt/src/app/create-post.tsx` with an image picker section that requests photo-library access, previews the selected image, supports remove/change actions, and performs the presigned URL upload before calling `createPost`. Keep submit disabled while picking, uploading, or creating, and show readable errors for permission denial, upload URL failure, direct upload failure, and post creation failure.

## Concrete Steps

From `/Users/diegosoto/Documents/towson/IronCircle/`, keep this ExecPlan current as implementation proceeds.

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, install the image picker dependency:

```sh
npx expo install expo-image-picker
```

Expect:

```text
blueprnt/package.json and blueprnt/package-lock.json include an Expo-compatible expo-image-picker dependency.
```

Add or update these files:

```text
blueprnt/src/services/media.ts
blueprnt/src/services/posts.ts
blueprnt/src/types/post.ts
blueprnt/src/app/create-post.tsx
```

From `/Users/diegosoto/Documents/towson/IronCircle/blueprnt/`, run:

```sh
npx tsc --noEmit
```

Expect:

```text
TypeScript exits successfully after dependency, service, type, and route updates are in place.
```

The user has an Expo session running already. Do not start another copy for this task. In that running app, validate:

```text
The create-post screen opens, image picking works on a simulator/device or web target, preview/remove/change controls behave correctly, and submission creates posts with or without an uploaded image.
```

## Validation and Acceptance

- `npx tsc --noEmit` from `blueprnt/` succeeds.
- `npm run lint` from `blueprnt/` exits successfully; known warnings in `src/app/(tabs)/explore.tsx` are outside this change.
- Opening `/create-post` shows the existing post type, caption, distance, calories, and duration controls plus an image picker section.
- Tapping the image picker asks for photo-library permission when needed.
- Selecting a JPEG, PNG, or WebP image shows a preview.
- The selected image can be removed or changed before submission.
- Submitting with no selected image calls the existing create-post API without image fields.
- Submitting with a selected image calls `POST /media/upload-url`, converts the local URI to a blob, uploads the blob directly to the returned `uploadUrl` with the selected `Content-Type`, then calls create post with `imageUrl` and `imageKey`.
- The Post button is disabled during the upload/create sequence and shows progress text.
- Errors are visible and leave the user on the composer without clearing their form.

## Idempotence and Recovery

- Re-running `npx expo install expo-image-picker` is safe; it should keep dependency versions compatible with the installed Expo SDK.
- Re-running `npx tsc --noEmit` is safe and should be the default verification step.
- Re-running `npm run start` is safe; if Metro gets stuck, retry with `npm run start -- --clear`.
- If S3 upload succeeds but create post fails, retrying submission may upload the same local file again and create a fresh S3 object; testers should remove duplicate uploaded test images server-side if needed.
- If permission is denied, users can recover by granting photo-library access in OS settings or posting without an image.
- If partial edits need to be backed out, revert only the files touched by this image-upload feature and preserve unrelated local changes.

## Artifacts and Notes

- Backend endpoint dependency: `POST /media/upload-url`.
- Request body: `{ imageType: 'post', contentType: 'image/jpeg' | 'image/png' | 'image/webp' }`.
- Response body: `{ uploadUrl: string, imageKey: string, pictureUrl: string }`.
- The S3 upload request must be a direct `PUT` to `uploadUrl` with the same content type used to request the presigned URL.
- The create-post request should include `imageUrl: pictureUrl` and `imageKey`.

## Interfaces and Dependencies

- Frontend dependency:
  - `expo-image-picker`
- Route:
  - `blueprnt/src/app/create-post.tsx`
- Services:
  - `blueprnt/src/services/media.ts`
  - `blueprnt/src/services/posts.ts`
  - `blueprnt/src/services/client.ts`
  - `blueprnt/src/services/authSession.ts`
- Types:
  - `blueprnt/src/types/post.ts`
- Backend APIs:
  - `POST /media/upload-url`
  - `POST /posts`
- Runtime configuration:
  - `EXPO_PUBLIC_API_BASE_URL`
