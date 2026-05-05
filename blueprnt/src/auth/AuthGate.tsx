import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useSegments } from 'expo-router';
import { getCurrentUser, AuthUser } from 'aws-amplify/auth';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // router.replace('/auth/login');
      confirmLoggedOutBeforeRedirect();
    }

    // if (user && inAuthGroup) {
    //   router.replace('/(tabs)');
    // }
  }, [user, loading, segments]);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      setUser(currentUser);
    } catch (err) {
      console.log('No user signed in');
      setUser(null);
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
      console.log('Confirmed user after route change:', currentUser);
      setUser(currentUser);
    } catch {
      router.replace('/auth/login');
    }
  }

  return <>{children}</>;
}