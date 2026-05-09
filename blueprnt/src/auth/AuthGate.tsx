import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useSegments } from 'expo-router';
import { getCurrentUser, AuthUser } from 'aws-amplify/auth';
import { getMe } from './userService';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const onOnboarding = segments[0] === 'onboarding';

    if (!user && !inAuthGroup) {
      confirmLoggedOutBeforeRedirect();
      return;
    }

    if (user && needsOnboarding && !onOnboarding) {
      // router.replace('/onboarding');
      confirmNeedsOnboardingBeforeRedirect();
      return;
    }

    if (user && !needsOnboarding && onOnboarding) {
      router.replace('/(tabs)');
      return;
    }
  }, [user, needsOnboarding, loading, segments]);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const me = await getMe();
      setNeedsOnboarding(me.needsOnboarding === true);
    } catch (err) {
      setUser(null);
      setNeedsOnboarding(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  async function confirmLoggedOutBeforeRedirect() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const me = await getMe();
      setNeedsOnboarding(me.needsOnboarding === true);
    } catch {
      router.replace('/auth/login');
    }
  }

  async function confirmNeedsOnboardingBeforeRedirect() {
    try {
      const me = await getMe();

      if (me.needsOnboarding) {
        router.replace('/onboarding');
      } else {
        setNeedsOnboarding(false);
      }
    } catch (err) {
      router.replace('/auth/login');
    }
  }

  return <>{children}</>;
}