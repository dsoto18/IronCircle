import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = 'http://localhost:3000'; // temporary, should user services/client.ts after verifying it works

export async function getMe() {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  if (!token) {
    throw new Error('Missing auth token');
  }

  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.json().catch(() => null);

  if (res.status === 404) {
    // User not found, needs onboarding
    return { needsOnboarding: true };
  }

  if (!res.ok) {
    throw new Error('Unable to fetch current user');
  }

  return {
    needsOnboarding: body?.needsOnboarding === true,
    user: body?.user ?? null,
  };
}