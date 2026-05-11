import { getAuthHeaders } from '@/services/authSession';
import { client } from '@/services/client';
import type { FeedPost } from '@/types';

export async function getFeed() {
  return client.get<FeedPost[]>('/feed', {
    headers: await getAuthHeaders('accessToken'),
  });
}
