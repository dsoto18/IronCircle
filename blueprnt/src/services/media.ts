import { getAuthHeaders } from '@/services/authSession';
import { client } from '@/services/client';

export const POST_IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type PostImageContentType = (typeof POST_IMAGE_CONTENT_TYPES)[number];

export type CreatePostImageUploadUrlInput = {
  contentType: PostImageContentType;
};

export type CreatePostImageUploadUrlResponse = {
  uploadUrl: string;
  imageKey: string;
  pictureUrl: string;
};

export function isPostImageContentType(
  value: string | null | undefined
): value is PostImageContentType {
  return POST_IMAGE_CONTENT_TYPES.includes(value as PostImageContentType);
}

export async function createPostImageUploadUrl({ contentType }: CreatePostImageUploadUrlInput) {
  return client.post<CreatePostImageUploadUrlResponse>(
    '/media/upload-url',
    {
      imageType: 'post',
      contentType,
    },
    {
      headers: await getAuthHeaders('accessToken'),
    }
  );
}

export async function uploadImageBlobToUrl({
  uploadUrl,
  blob,
  contentType,
}: {
  uploadUrl: string;
  blob: Blob;
  contentType: PostImageContentType;
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
