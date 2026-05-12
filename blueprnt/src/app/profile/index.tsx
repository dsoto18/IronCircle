import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProfileScreen, ProfileStateScreen } from '@/components/profile-screen';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getUserFollowers, getUserFollowing } from '@/services/follows';
import { getMe, updateUserProfile, type UpdateUserProfileInput } from '@/services/user';
import type { User } from '@/types';

const BIO_MAX_LENGTH = 160;

function getUpdatedUser(response: any, currentUser: User, payload: UpdateUserProfileInput) {
  if (response && typeof response === 'object' && 'Item' in response) {
    return response.Item as User;
  }

  if (response && typeof response === 'object' && 'user' in response) {
    return response.user as User;
  }

  if (response && typeof response === 'object' && 'userId' in response) {
    return response as User;
  }

  return {
    ...currentUser,
    ...payload,
  };
}

export default function CurrentUserProfileRoute() {
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [followerCount, setFollowerCount] = useState<number | undefined>();
  const [followingCount, setFollowingCount] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileStatusMessage, setProfileStatusMessage] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentUserResult = await getMe();

        if (!isMounted) {
          return;
        }

        if (!currentUserResult.user) {
          setUser(null);
          setErrorMessage('Complete onboarding to view your profile.');
          return;
        }

        setUser(currentUserResult.user);

        const [followers, following] = await Promise.all([
          getUserFollowers(currentUserResult.user.userId),
          getUserFollowing(currentUserResult.user.userId),
        ]);

        if (!isMounted) {
          return;
        }

        setFollowerCount(Array.isArray(followers) ? followers.length : 0);
        setFollowingCount(Array.isArray(following) ? following.length : 0);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load current user profile', error);
        setErrorMessage('Could not load your profile. Please try again.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleBackPress() {
    router.back();
  }

  function handleEditPress() {
    setEditFirstName('');
    setEditLastName('');
    setEditBio('');
    setEditErrorMessage(null);
    setIsEditOpen(true);
  }

  function handleEditClose() {
    if (isSubmittingEdit) {
      return;
    }

    setIsEditOpen(false);
  }

  async function handleEditSubmit() {
    if (!user || isSubmittingEdit) {
      return;
    }

    const payload: UpdateUserProfileInput = {};
    const trimmedFirstName = editFirstName.trim();
    const trimmedLastName = editLastName.trim();
    const trimmedBio = editBio.trim();

    if (trimmedFirstName) {
      payload.firstName = trimmedFirstName;
    }

    if (trimmedLastName) {
      payload.lastName = trimmedLastName;
    }

    if (trimmedBio) {
      payload.bio = trimmedBio.slice(0, BIO_MAX_LENGTH);
    }

    if (Object.keys(payload).length === 0) {
      setEditErrorMessage('Enter at least one profile detail to update.');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      setEditErrorMessage(null);
      setProfileStatusMessage(null);

      const response = await updateUserProfile(user.username, payload);
      setUser(getUpdatedUser(response, user, payload));
      setProfileStatusMessage('Profile updated.');
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      setEditErrorMessage('Could not update your profile. Please try again.');
    } finally {
      setIsSubmittingEdit(false);
    }
  }

  if (isLoading) {
    return (
      <ProfileStateScreen
        isLoading
        message="Loading your profile..."
        onBackPress={handleBackPress}
      />
    );
  }

  if (errorMessage || !user) {
    return (
      <ProfileStateScreen
        message={errorMessage ?? 'Could not load this profile.'}
        detail="Check your connection and try again."
        onBackPress={handleBackPress}
      />
    );
  }

  return (
    <>
      <ProfileScreen
        user={user}
        isOwnProfile
        followerCount={followerCount}
        followingCount={followingCount}
        statusMessage={profileStatusMessage}
        onBackPress={handleBackPress}
        onEditPress={handleEditPress}
      />

      <Modal
        visible={isEditOpen}
        transparent
        animationType="fade"
        onRequestClose={handleEditClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="smallBold">Edit profile</ThemedText>
              </View>

              <Pressable
                onPress={handleEditClose}
                disabled={isSubmittingEdit}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                  pressed ? styles.pressed : null,
                  isSubmittingEdit ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close edit profile form">
                <FontAwesome name="times" size={16} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold">First name</ThemedText>
                <TextInput
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  placeholder={user.firstName}
                  placeholderTextColor={theme.textSecondary}
                  editable={!isSubmittingEdit}
                  style={[
                    styles.input,
                    {
                      borderColor: theme.backgroundSelected,
                      color: theme.text,
                      backgroundColor: theme.backgroundElement,
                    },
                  ]}
                />
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold">Last name</ThemedText>
                <TextInput
                  value={editLastName}
                  onChangeText={setEditLastName}
                  placeholder={user.lastName}
                  placeholderTextColor={theme.textSecondary}
                  editable={!isSubmittingEdit}
                  style={[
                    styles.input,
                    {
                      borderColor: theme.backgroundSelected,
                      color: theme.text,
                      backgroundColor: theme.backgroundElement,
                    },
                  ]}
                />
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <ThemedText type="smallBold">Bio</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {editBio.length}/{BIO_MAX_LENGTH}
                  </ThemedText>
                </View>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder={user.bio ?? 'No bio yet.'}
                  placeholderTextColor={theme.textSecondary}
                  editable={!isSubmittingEdit}
                  maxLength={BIO_MAX_LENGTH}
                  multiline
                  style={[
                    styles.input,
                    styles.bioInput,
                    {
                      borderColor: theme.backgroundSelected,
                      color: theme.text,
                      backgroundColor: theme.backgroundElement,
                    },
                  ]}
                />
              </View>
            </View>

            {editErrorMessage ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.formMessage}>
                {editErrorMessage}
              </ThemedText>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                onPress={handleEditClose}
                disabled={isSubmittingEdit}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    borderColor: theme.backgroundSelected,
                    backgroundColor: theme.backgroundElement,
                  },
                  pressed ? styles.pressed : null,
                  isSubmittingEdit ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel profile edits">
                <ThemedText type="smallBold">Cancel</ThemedText>
              </Pressable>

              <Pressable
                onPress={handleEditSubmit}
                disabled={isSubmittingEdit}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.accent, borderColor: theme.accent },
                  pressed ? styles.pressed : null,
                  isSubmittingEdit ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Save profile edits">
                {isSubmittingEdit ? <ActivityIndicator color="#FFFFFF" /> : null}
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    lineHeight: 22,
  },
  bioInput: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  formMessage: {
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.five,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.five,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.55,
  },
});