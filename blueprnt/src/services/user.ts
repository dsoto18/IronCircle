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

export type UpdateUserProfileInput = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePictureUrl?: string;
};

export type UserSearchResult = {
  profilePictureUrl?: string;
  firstName: string;
  lastName: string;
  userId: string;
  username: string;
};

type GetMeResponse = {
  needsOnboarding?: boolean;
  user?: User | null;
};

type CreateCurrentUserResponse = User | { user: User };

type SearchUsersResponse = {
  Items?: UserSearchResult[];
  Count?: number;
};

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

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

export async function searchUsers(text: string) {
  const trimmedText = text.trim();

  if (trimmedText.length < 3) {
    return [];
  }

  try {
    const params = new URLSearchParams({ text: trimmedText });
    const response = await client.get<SearchUsersResponse>(`/users?${params.toString()}`);

    return response.Items ?? [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(getApiErrorMessage(error) ?? 'Unable to search users');
    }

    throw error;
  }
}

export async function getUserProfile(user: string) {
  try {
    const response = await client.get<any>(`/users/${encodePathSegment(user)}`);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(getApiErrorMessage(error) ?? 'Unable to load user profile');
    }

    throw error;
  }
}

export async function updateUserProfile(username: string, input: UpdateUserProfileInput) {
  try {
    return client.patch<any>(`/users/${encodePathSegment(username)}`, input, {
      headers: await getAuthHeaders('accessToken'),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(getApiErrorMessage(error) ?? 'Unable to update profile');
    }

    throw error;
  }
}
