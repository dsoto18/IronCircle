import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { router, useSegments } from 'expo-router';
import { getCurrentUser, AuthUser } from 'aws-amplify/auth';
import { getMe } from '@/services/user';

const AUTH_CHECK_ERROR_MESSAGE = 'Unable to check your profile. Please try again.';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [authCheckError, setAuthCheckError] = useState<string | null>(null);
  const segments = useSegments();

  const refreshAuthenticatedUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    try {
      const me = await getMe();
      setNeedsOnboarding(me.needsOnboarding === true);
      setAuthCheckError(null);
      return me;
    } catch {
      setNeedsOnboarding(false);
      setAuthCheckError(AUTH_CHECK_ERROR_MESSAGE);
      return null;
    }
  }, []);

  const checkUser = useCallback(async () => {
    setLoading(true);
    setAuthCheckError(null);

    try {
      await refreshAuthenticatedUser();
    } catch {
      setUser(null);
      setNeedsOnboarding(false);
      setAuthCheckError(null);
    } finally {
      setLoading(false);
    }
  }, [refreshAuthenticatedUser]);

  const confirmLoggedOutBeforeRedirect = useCallback(async () => {
    try {
      await refreshAuthenticatedUser();
    } catch {
      router.replace('/auth/login');
    }
  }, [refreshAuthenticatedUser]);

  const confirmNeedsOnboardingBeforeRedirect = useCallback(async () => {
    try {
      const me = await getMe();
      setAuthCheckError(null);

      if (me.needsOnboarding) {
        router.replace('/onboarding');
      } else {
        setNeedsOnboarding(false);
      }
    } catch {
      setAuthCheckError(AUTH_CHECK_ERROR_MESSAGE);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (loading) return;
    if (authCheckError) return;

    const inAuthGroup = segments[0] === 'auth';
    const onOnboarding = segments[0] === 'onboarding';

    if (!user && !inAuthGroup) {
      confirmLoggedOutBeforeRedirect();
      return;
    }

    if (user && needsOnboarding && !onOnboarding) {
      confirmNeedsOnboardingBeforeRedirect();
      return;
    }

    if (user && !needsOnboarding && onOnboarding) {
      router.replace('/(tabs)');
      return;
    }
  }, [
    authCheckError,
    confirmLoggedOutBeforeRedirect,
    confirmNeedsOnboardingBeforeRedirect,
    loading,
    needsOnboarding,
    segments,
    user,
  ]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (authCheckError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{authCheckError}</Text>
        <Button title="Retry" onPress={checkUser} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});
