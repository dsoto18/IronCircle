import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { login } from '@/auth/authService';
import { router } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      await login(email, password);

      // go to app
      router.replace('/(tabs)');
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <View>
      <Text>Login</Text>

      <TextInput placeholder="email" onChangeText={setEmail} />
      <TextInput placeholder="password" secureTextEntry onChangeText={setPassword} />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}