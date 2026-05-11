import { getAuthHeaders } from '@/services/authSession';
import { ApiError, client } from '@/services/client';
import type { User } from '@/types';

export type CurrentUserResult = {
  needsOnboarding: boolean;
  user: User | null;
};

export type CreateCurrentUserInput = {
  username: string;
  firstName: string;
  lastName: string;
};

type GetMeResponse = {
  needsOnboarding?: boolean;
  user?: User | null;
};

type CreateCurrentUserResponse = User | { user: User };

function getApiErrorMessage(error: ApiError) {
  if (
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data &&
    typeof error.data.message === 'string'
  ) {
    return error.data.message;
  }

  return null;
}

export async function getMe(): Promise<CurrentUserResult> {
  try {
    const response = await client.get<GetMeResponse>('/users/me', {
      headers: await getAuthHeaders('accessToken'),
    });

    return {
      needsOnboarding: response.needsOnboarding === true,
      user: response.user ?? null,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        needsOnboarding: true,
        user: null,
      };
    }

    if (error instanceof Error && error.message === 'Missing auth token') {
      throw error;
    }

    throw new Error('Unable to fetch current user');
  }
}

export async function createCurrentUser(input: CreateCurrentUserInput) {
  try {
    const response = await client.post<CreateCurrentUserResponse>(
      '/users',
      {
        username: input.username.trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
      },
      {
        headers: await getAuthHeaders('idToken'),
      }
    );

    return response && typeof response === 'object' && 'user' in response ? response.user : response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(getApiErrorMessage(error) ?? 'Unable to complete onboarding');
    }

    throw error;
  }
}
