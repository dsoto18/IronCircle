import { getAuthHeaders } from '@/services/authSession';
import { client } from '@/services/client';

export const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const POST_IMAGE_CONTENT_TYPES = IMAGE_CONTENT_TYPES;

export type ImageContentType = (typeof IMAGE_CONTENT_TYPES)[number];
export type PostImageContentType = ImageContentType;
export type MediaUploadImageType = 'post' | 'profile';

export type CreateImageUploadUrlInput = {
  imageType: MediaUploadImageType;
  contentType: ImageContentType;
};

export type CreatePostImageUploadUrlInput = {
  contentType: ImageContentType;
};

export type CreateImageUploadUrlResponse = {
  uploadUrl: string;
  imageKey: string;
  pictureUrl: string;
};

export type CreatePostImageUploadUrlResponse = CreateImageUploadUrlResponse;

const IMAGE_CONTENT_TYPE_BY_EXTENSION: Record<string, ImageContentType> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export function isPostImageContentType(
  value: string | null | undefined
): value is PostImageContentType {
  return isImageContentType(value);
}

export function isImageContentType(value: string | null | undefined): value is ImageContentType {
  return IMAGE_CONTENT_TYPES.includes(value as ImageContentType);
}

export function getSupportedImageContentType({
  mimeType,
  fileName,
  uri,
}: {
  mimeType?: string | null;
  fileName?: string | null;
  uri: string;
}) {
  const normalizedMimeType = mimeType?.toLowerCase();

  if (normalizedMimeType === 'image/jpg') {
    return 'image/jpeg';
  }

  if (isImageContentType(normalizedMimeType)) {
    return normalizedMimeType;
  }

  for (const candidate of [fileName, uri.split('?')[0]]) {
    const extension = candidate?.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
    const contentType = extension ? IMAGE_CONTENT_TYPE_BY_EXTENSION[extension] : undefined;

    if (contentType) {
      return contentType;
    }
  }

  return null;
}

export async function getBlobFromUri(uri: string) {
  const response = await fetch(uri);

  if (!response.ok && response.status !== 0) {
    throw new Error('Could not read the selected image.');
  }

  return response.blob();
}

export async function createImageUploadUrl({ imageType, contentType }: CreateImageUploadUrlInput) {
  return client.post<CreateImageUploadUrlResponse>(
    '/media/upload-url',
    {
      imageType,
      contentType,
    },
    {
      headers: await getAuthHeaders('accessToken'),
    }
  );
}

export async function createPostImageUploadUrl({ contentType }: CreatePostImageUploadUrlInput) {
  return createImageUploadUrl({
    imageType: 'post',
    contentType,
  });
}

export async function createProfileImageUploadUrl({ contentType }: CreatePostImageUploadUrlInput) {
  return createImageUploadUrl({
    imageType: 'profile',
    contentType,
  });
}

export async function uploadImageBlobToUrl({
  uploadUrl,
  blob,
  contentType,
}: {
  uploadUrl: string;
  blob: Blob;
  contentType: ImageContentType;
}) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`);
  }
}
