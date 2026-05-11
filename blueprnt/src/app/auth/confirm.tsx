import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { confirmRegistration, resendRegistrationCode } from '@/auth/authService';
import { getMe } from '@/services/user';

export default function Confirm() {
  //   const { email } = useLocalSearchParams<{ email: string }>();
  const params = useLocalSearchParams<{ email?: string }>();
  const [emailInput, setEmailInput] = useState(params.email ?? '');

  const email = emailInput.trim();

  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isBusy = isConfirming || isResending;

  async function handleConfirm() {
    if (isBusy) {
      return;
    }

    setError('');
    setMessage('');

    if (!email) {
      setError('Missing email. Please register again.');
      return;
    }

    if (!code.trim()) {
      setError('Confirmation code is required');
      return;
    }

    try {
      setIsConfirming(true);
      const result = await confirmRegistration(email, code.trim());

      if(result?.isSignedIn){
        const me = await getMe();
        
        if (me.needsOnboarding) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)');
        }

        return;
      }

      // delayed cofirm workflow (user closed the app on confirm step)
      setMessage('Account confirmed. Please log in.');
      router.replace('/auth/login');

    } catch (err: any) {
      setError(err?.message || 'Unable to confirm account');
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleResendCode() {
    if (isBusy) {
      return;
    }

    setError('');
    setMessage('');

    if (!email) {
      setError('Missing email. Please register again.');
      return;
    }

    try {
      setIsResending(true);
      await resendRegistrationCode(email);
      setMessage('Confirmation code resent. Check your email. If you have an account, the code will arrive shortly.');
    } catch (err: any) {
      setError(err?.message || 'Unable to resend confirmation code');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Verify Account</Text>
        <Text style={styles.subtitle}>Enter the code sent to your email.</Text>

        <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailInput}
            onChangeText={setEmailInput}
        />
        <TextInput
            style={styles.input}
            placeholder="Confirmation Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <Button
          title={isConfirming ? 'Confirming...' : 'Confirm'}
          onPress={handleConfirm}
          disabled={isBusy}
        />
        <Button
          title={isResending ? 'Resending...' : 'Resend Code'}
          onPress={handleResendCode}
          disabled={isBusy}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  card: {
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: {
    color: 'red',
  },
  success: {
    color: 'green'
  }
});
