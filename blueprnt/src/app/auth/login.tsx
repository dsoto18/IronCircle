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
import { login } from '@/auth/authService';
import { router } from 'expo-router';
import { getMe } from '@/auth/userService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');

    try {
      const result = await login(email.trim(), password);
      console.log('Login successful:', result);
      if (!result) {
        throw new Error('Login failed');
      }

      const me = await getMe();
      if(me.needsOnboarding){
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.log(err);

      if(
        err?.name === 'UserNotConfirmedException' ||
        err?.message?.includes('User is not confirmed')
      ) {
        router.replace({
          pathname: '/auth/confirm',
          params: { email: email.trim() }
        });
        return;
      }
      
      
      setError(err?.message || 'Unable to log in');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Login" onPress={handleLogin} />

        <Pressable onPress={() => router.push('/auth/register')}>
          <Text style={styles.link}>Need an account? Register</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/auth/confirm',
              params: { email: email.trim() },
            })
          }
        >
          <Text style={styles.link}>Already registered? Verify account</Text>
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
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
  },
});