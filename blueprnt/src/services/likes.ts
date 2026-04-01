import { client } from '@/services/client';

export type LikePostPayload = {
  userId: string;
  author: string;
  createdAt: string;
};

export function likePost(postId: string, body: LikePostPayload) {
  return client.post(`/likes/${postId}`, body);
}

export function unlikePost(postId: string, body: LikePostPayload) {
  return client.delete(`/likes/${postId}`, { body });
}
