import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ProfileScreen, ProfileStateScreen } from '@/components/profile-screen';
import { getUserFollowers, getUserFollowing } from '@/services/follows';
import { getMe } from '@/services/user';
import type { User } from '@/types';

export default function CurrentUserProfileRoute() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [followerCount, setFollowerCount] = useState<number | undefined>();
  const [followingCount, setFollowingCount] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentUserResult = await getMe();
        console.log('Current user result', currentUserResult);

        if (!isMounted) {
          return;
        }

        if (!currentUserResult.user) {
          setUser(null);
          setErrorMessage('Complete onboarding to view your profile.');
          return;
        }

        console.log("Setting user");
        setUser(currentUserResult.user);
        console.log("User set.")

        const [followers, following] = await Promise.all([
          getUserFollowers(currentUserResult.user.userId),
          getUserFollowing(currentUserResult.user.userId),
        ]);

        console.log('Followers', followers);
        console.log('Following', following);

        if (!isMounted) {
          return;
        }

        setFollowerCount(followers.length);
        setFollowingCount(following.length);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load current user profile', error);
        setErrorMessage('Could not load your profile. Please try again.');
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
  }, []);

  function handleBackPress() {
    router.back();
  }

  if (isLoading) {
    return (
      <ProfileStateScreen
        isLoading
        message="Loading your profile..."
        onBackPress={handleBackPress}
      />
    );
  }

  if (errorMessage || !user) {
    return (
      <ProfileStateScreen
        message={errorMessage ?? 'Could not load this profile.'}
        detail="Check your connection and try again."
        onBackPress={handleBackPress}
      />
    );
  }

  return (
    <ProfileScreen
      user={user}
      isOwnProfile
      followerCount={followerCount}
      followingCount={followingCount}
      onBackPress={handleBackPress}
    />
  );
}
