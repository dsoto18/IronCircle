import { client } from '@/services/client';
import type { Post } from '@/types';

export const POST_TYPES = ['Run', 'Lift', 'Yoga', 'Swim', 'Cycling', 'HIIT'] as const;

export type CreatePostType = (typeof POST_TYPES)[number];

export type CreatePostInput = {
  userId: string;
  type: CreatePostType;
  distance: string;
  calories: string;
  duration: string;
  imageUrl: string;
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
  userId,
  type,
  distance,
  calories,
  duration,
  imageUrl,
  caption,
}: CreatePostInput) {
  const body: Record<string, string> = {
    type,
    duration: duration.trim(),
    imageUrl: imageUrl.trim(),
    caption: caption.trim(),
    visibility: 'followers',
  };
  const normalizedDistance = normalizeOptionalMetric(distance);
  const normalizedCalories = normalizeOptionalMetric(calories);

  if (normalizedDistance !== null) {
    body.distance = normalizedDistance;
  }

  if (normalizedCalories !== null) {
    body.calories = normalizedCalories;
  }

  const response = await client.post<CreatePostResponse>(`/${userId}/posts`, body);

  return response && typeof response === 'object' && 'post' in response ? response.post : response;
}
