import { client } from '@/services/client';
import type { FeedPost } from '@/types';

export function getFeed(userId: string) {
  return client.get<FeedPost[]>(`/feed/${userId}`);
}
