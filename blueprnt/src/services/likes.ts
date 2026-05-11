import { getAuthHeaders } from '@/services/authSession';
import { client } from '@/services/client';

export type LikePostPayload = {
  author: string;
  createdAt: string;
};

export async function likePost(postId: string, body: LikePostPayload) {
  return client.post(`/likes/${postId}`, body, {
    headers: await getAuthHeaders('accessToken'),
  });
}

export async function unlikePost(postId: string, body: LikePostPayload) {
  return client.delete(`/likes/${postId}`, {
    body,
    headers: await getAuthHeaders('accessToken'),
  });
}
