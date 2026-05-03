import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { register } from '@/auth/authService';
import { router } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    try {
      await register(email, password);

      // after signup → go to login
      router.replace('../auth/login');
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <View>
      <Text>Register</Text>

      <TextInput placeholder="email" onChangeText={setEmail} />
      <TextInput placeholder="password" secureTextEntry onChangeText={setPassword} />

      <Button title="Create Account" onPress={handleRegister} />
    </View>
  );
}