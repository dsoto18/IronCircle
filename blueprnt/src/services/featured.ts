import { getAuthHeaders } from '@/services/authSession';
import { client } from '@/services/client';
import type { ExploreContentType, ExploreItem } from '@/types';

export type FeaturedPostContentType = Exclude<ExploreContentType, 'ad'>;

export const FEATURED_POST_CONTENT_TYPES: FeaturedPostContentType[] = [
  'post',
  'announcement',
  'challenge',
];

export type CreateFeaturedPostInput = {
  contentType: FeaturedPostContentType;
  title: string;
  summary: string;
  tags?: string[];
  metadataLabel?: string;
};

type GetFeaturedPostsResponse = {
  Items?: ExploreItem[];
  Count?: number;
  ScannedCount?: number;
};

type CreateFeaturedPostResponse = ExploreItem | { item: ExploreItem } | { post: ExploreItem };

export async function getFeaturedPosts() {
  const response = await client.get<GetFeaturedPostsResponse>('/featured', {
    headers: await getAuthHeaders('accessToken'),
  });

  return response.Items ?? [];
}

export async function createFeaturedPost(input: CreateFeaturedPostInput) {
  const body = {
    contentType: input.contentType,
    title: input.title.trim(),
    summary: input.summary.trim(),
    ...(input.tags?.length ? { tags: input.tags } : {}),
    ...(input.metadataLabel?.trim() ? { metadataLabel: input.metadataLabel.trim() } : {}),
  };

  const response = await client.post<CreateFeaturedPostResponse>('/featured', body, {
    headers: await getAuthHeaders('accessToken'),
  });

  if (response && typeof response === 'object' && 'item' in response) {
    return response.item;
  }

  if (response && typeof response === 'object' && 'post' in response) {
    return response.post;
  }

  return response;
}
