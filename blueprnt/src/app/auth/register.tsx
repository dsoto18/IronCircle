import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { register } from '@/auth/authService';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    if (isSubmitting) {
      return;
    }

    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(email.trim(), password);

      setSuccess('Account created. Check your email to verify your account, then log in.');

      setTimeout(() => {
        // router.replace('/auth/login');
        router.replace({
          pathname: '/auth/confirm',
          params: { email: email.trim() },
        });
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Unable to create account');
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Button
          title={isSubmitting ? 'Creating account...' : 'Create Account'}
          onPress={handleRegister}
          disabled={isSubmitting}
        />

        <Pressable disabled={isSubmitting} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
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
    color: 'green',
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
  },
});
