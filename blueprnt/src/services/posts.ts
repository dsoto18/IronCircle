import { getAuthHeaders } from '@/services/authSession';
import { client } from '@/services/client';
import type { Post } from '@/types';

export const POST_TYPES = ['Run', 'Lift', 'Yoga', 'Swim', 'Cycling', 'HIIT'] as const;

export type CreatePostType = (typeof POST_TYPES)[number];

export type CreatePostInput = {
  type: CreatePostType;
  distance: string;
  calories: string;
  duration: string;
  imageUrl?: string;
  imageKey?: string;
  caption: string;
};

type CreatePostResponse = Post | { post: Post };

function normalizeOptionalMetric(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const numericValue = Number(trimmedValue);

  if (Number.isFinite(numericValue) && numericValue === 0) {
    return null;
  }

  return trimmedValue;
}

export async function createPost({
  type,
  distance,
  calories,
  duration,
  imageUrl,
  imageKey,
  caption,
}: CreatePostInput) {
  const body: Record<string, string> = {
    type,
    duration: duration.trim(),
    caption: caption.trim(),
    visibility: 'followers',
  };
  const normalizedDistance = normalizeOptionalMetric(distance);
  const normalizedCalories = normalizeOptionalMetric(calories);
  const normalizedImageUrl = imageUrl?.trim();
  const normalizedImageKey = imageKey?.trim();

  if (normalizedDistance !== null) {
    body.distance = normalizedDistance;
  }

  if (normalizedCalories !== null) {
    body.calories = normalizedCalories;
  }

  if (normalizedImageUrl) {
    body.imageUrl = normalizedImageUrl;
  }

  if (normalizedImageKey) {
    body.imageKey = normalizedImageKey;
  }

  const response = await client.post<CreatePostResponse>('/posts', body, {
    headers: await getAuthHeaders('accessToken'),
  });

  return response && typeof response === 'object' && 'post' in response ? response.post : response;
}
