import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

// auth gate
import AuthGate from '@/auth/AuthGate';
// auth config
import { Amplify } from 'aws-amplify';
import awsConfig from '../aws-exports';

Amplify.configure(awsConfig);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="create-post" />
          <Stack.Screen name="create-featured-post" />
          <Stack.Screen name="plan-builder" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth/confirm" />
        </Stack>
      </AuthGate>
    </ThemeProvider>
  );
}
