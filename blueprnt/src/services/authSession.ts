import { fetchAuthSession } from 'aws-amplify/auth';

export type AuthTokenType = 'accessToken' | 'idToken';

export async function getAuthHeaders(tokenType: AuthTokenType = 'accessToken') {
  const session = await fetchAuthSession();
  const token =
    tokenType === 'idToken'
      ? session.tokens?.idToken?.toString()
      : session.tokens?.accessToken?.toString();

  if (!token) {
    throw new Error('Missing auth token');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getCurrentUserId() {
  const session = await fetchAuthSession();
  const userId = session.tokens?.accessToken?.payload.sub;

  if (typeof userId !== 'string') {
    throw new Error('Missing authenticated user id');
  }

  return userId;
}
