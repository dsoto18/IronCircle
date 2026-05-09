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
import { router } from 'expo-router';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = 'http://localhost:3000';

export default function Onboarding() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!username.trim()) {
        setError('Username is required');
        return;
    }
    if (!firstName.trim()) {
        setError('Display name is required');
        return;
    }
    if(!lastName.trim()) {
        setError('Last name is required');
        return;
    }

    try {
      const session = await fetchAuthSession();
    //   const token = session.tokens?.accessToken?.toString();
      const token = session.tokens?.idToken?.toString();
    //   const email = session.tokens?.idToken?.payload?.email as string | undefined;

      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        //   email, old approach, backend extracts it from token now
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Unable to complete onboarding');
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Unable to complete onboarding');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Set Up Profile</Text>
        <Text style={styles.subtitle}>Choose how others will see you.</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Continue" onPress={handleSubmit} />
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
});