import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { ProfileScreen, ProfileStateScreen } from '@/components/profile-screen';
import { followUser, getUserFollowers, getUserFollowing, unfollowUser } from '@/services/follows';
import { getMe, getUserProfile } from '@/services/user';
import type { User } from '@/types';

type FollowRelationship = {
  PK?: string;
  SK?: string;
  sourceUserId?: string;
  targetUserId?: string;
};

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function asFollowRelationships(value: any): FollowRelationship[] {
  return Array.isArray(value) ? value : [];
}

function asUser(value: any): User | null {
  if (value && typeof value === 'object' && 'Item' in value) {
    return value.Item;
  }

  if (value && typeof value === 'object' && 'user' in value) {
    return value.user;
  }

  if (value && typeof value === 'object' && 'userId' in value) {
    return value;
  }

  return null;
}

function isFollowFromUser(follow: FollowRelationship, user: User | null) {
  if (!user) {
    return false;
  }

  return follow.sourceUserId === user.userId || follow.sourceUserId === user.PK;
}

function includesFollower(followers: FollowRelationship[], user: User | null) {
  return followers.some((follow) => isFollowFromUser(follow, user));
}

export default function UserProfileRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = getRouteParam(params.userId);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState<FollowRelationship[]>([]);
  const [followingCount, setFollowingCount] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isOwnProfile = useMemo(() => {
    if (!profileUser || !currentUser) {
      return false;
    }

    return profileUser.PK === currentUser.PK || profileUser.userId === currentUser.userId;
  }, [currentUser, profileUser]);

  const isFollowing = useMemo(
    () => includesFollower(followers, currentUser),
    [currentUser, followers]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!userId) {
        setIsLoading(false);
        setErrorMessage('No profile was selected.');
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        setStatusMessage(null);

        const [profileResponse, currentUserResult] = await Promise.all([
          getUserProfile(userId),
          getMe(),
        ]);
        const loadedProfileUser = asUser(profileResponse);

        if (!isMounted) {
          return;
        }

        if (!loadedProfileUser) {
          setProfileUser(null);
          setErrorMessage('Could not read this profile response.');
          return;
        }

        setProfileUser(loadedProfileUser);
        setCurrentUser(currentUserResult.user);

        const [loadedFollowers, loadedFollowing] = await Promise.all([
          getUserFollowers(loadedProfileUser.userId),
          getUserFollowing(loadedProfileUser.userId),
        ]);

        if (!isMounted) {
          return;
        }

        setFollowers(asFollowRelationships(loadedFollowers));
        setFollowingCount(asFollowRelationships(loadedFollowing).length);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load user profile', error);
        setErrorMessage('Could not load this profile. Please try again.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  async function handleToggleFollow() {
    if (!profileUser || !currentUser || isFollowLoading || isOwnProfile) {
      return;
    }

    setIsFollowLoading(true);
    setStatusMessage(null);

    try {
      if (isFollowing) {
        await unfollowUser(profileUser.userId, currentUser.userId);
        setFollowers((currentFollowers) =>
          currentFollowers.filter((follower) => !isFollowFromUser(follower, currentUser))
        );
        setStatusMessage(`You unfollowed @${profileUser.username}.`);
      } else {
        await followUser(currentUser.userId, profileUser.userId);
        setFollowers((currentFollowers) =>
          includesFollower(currentFollowers, currentUser)
            ? currentFollowers
            : [
                ...currentFollowers,
                {
                  PK: profileUser.PK,
                  SK: `FOLLOWED_BY#${currentUser.userId}`,
                  sourceUserId: currentUser.userId,
                },
              ]
        );
        setStatusMessage(`You are now following @${profileUser.username}.`);
      }
    } catch (error) {
      console.error('Failed to update follow relationship', error);
      setStatusMessage('Could not follow this user. Please try again.');
    } finally {
      setIsFollowLoading(false);
    }
  }

  function handleBackPress() {
    router.back();
  }

  if (isLoading) {
    return (
      <ProfileStateScreen
        isLoading
        message="Loading profile..."
        onBackPress={handleBackPress}
      />
    );
  }

  if (errorMessage || !profileUser) {
    return (
      <ProfileStateScreen
        message={errorMessage ?? 'Could not load this profile.'}
        detail="This profile may not exist, or the backend may not support this identifier yet."
        onBackPress={handleBackPress}
      />
    );
  }

  return (
    <ProfileScreen
      user={profileUser}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      isFollowLoading={isFollowLoading}
      followerCount={followers.length}
      followingCount={followingCount}
      statusMessage={statusMessage}
      onBackPress={handleBackPress}
      onFollowPress={handleToggleFollow}
    />
  );
}
