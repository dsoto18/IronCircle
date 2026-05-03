import { client } from '@/services/client';
import type { Post, PostVisibility } from '@/types';

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

type CreatePostBody = Omit<CreatePostInput, 'userId'> & {
  visibility: Extract<PostVisibility, 'followers'>;
};

type CreatePostResponse = Post | { post: Post };

export async function createPost({ userId, ...input }: CreatePostInput) {
  const body: CreatePostBody = {
    ...input,
    visibility: 'followers',
  };

  const response = await client.post<CreatePostResponse>(`/${userId}/posts`, body);

  return response && typeof response === 'object' && 'post' in response ? response.post : response;
}
