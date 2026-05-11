import { getAuthHeaders } from '@/services/authSession';
import { client } from '@/services/client';

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

export async function getUserFollowers(userId: string) {
  const response = await client.get<any>(
    `/users/${encodePathSegment(userId)}/followers`
  );

  return response.Items;
  // return unwrapUserList(response, 'followers');
}

export async function getUserFollowing(userId: string) {
  const response = await client.get<any>(
    `/users/${encodePathSegment(userId)}/following`
  );

  // return unwrapUserList(response, 'following');
  return response.Items;
}

export async function followUser(userId: string, followerId: string) {
  return client.post(
    `/${encodePathSegment(userId)}/followers/${encodePathSegment(followerId)}`,
    undefined,
    {
      headers: await getAuthHeaders('accessToken'),
    }
  );
}

export async function unfollowUser(userId: string, followerId: string) {
  return client.delete(`/${encodePathSegment(userId)}/followers/${encodePathSegment(followerId)}`, {
    headers: await getAuthHeaders('accessToken'),
  });
}
