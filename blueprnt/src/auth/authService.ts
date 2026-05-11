import {
  signUp,
  signIn,
  getCurrentUser,
  signOut,
  confirmSignUp,
  autoSignIn,
  resendSignUpCode,
} from 'aws-amplify/auth';

export async function register(email: string, password: string) {
  return await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email
      },
      autoSignIn: true,
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

export async function confirmRegistration(email: string, code: string) {
  await confirmSignUp({
    username: email,
    confirmationCode: code,
  });

  try {
    return await autoSignIn();
  } catch {
    // Auto sign-in unavailable after confirmation
    return null;
  }
}

export async function resendRegistrationCode(email: string) {
  return await resendSignUpCode({ username: email });
}
