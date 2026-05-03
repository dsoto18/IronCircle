import { signUp, signIn, getCurrentUser, signOut } from 'aws-amplify/auth';

export async function register(email: string, password: string) {
  return await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email
      }
    }
  });
}

export async function login(email: string, password: string) {
  return await signIn({
    username: email,
    password
  });
}

export async function getUser() {
  return await getCurrentUser();
}

export async function logout() {
  return await signOut();
}