import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProfileScreen, ProfileStateScreen } from '@/components/profile-screen';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getUserFollowers, getUserFollowing } from '@/services/follows';
import {
  createProfileImageUploadUrl,
  getBlobFromUri,
  getSupportedImageContentType,
  uploadImageBlobToUrl,
  type ImageContentType,
} from '@/services/media';
import { getMe, updateUserProfile, type UpdateUserProfileInput } from '@/services/user';
import type { User } from '@/types';

const BIO_MAX_LENGTH = 160;

type EditSubmitPhase = 'idle' | 'uploading' | 'saving';

type SelectedProfileImage = {
  uri: string;
  contentType: ImageContentType;
};

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
  const [selectedProfileImage, setSelectedProfileImage] = useState<SelectedProfileImage | null>(
    null
  );
  const [isPickingProfileImage, setIsPickingProfileImage] = useState(false);
  const [editSubmitPhase, setEditSubmitPhase] = useState<EditSubmitPhase>('idle');
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const isSubmittingEdit = editSubmitPhase !== 'idle';
  const isEditBusy = isSubmittingEdit || isPickingProfileImage;
  const editSaveLabel =
    editSubmitPhase === 'uploading'
      ? 'Uploading...'
      : editSubmitPhase === 'saving'
        ? 'Saving...'
        : 'Save';

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
    setSelectedProfileImage(null);
    setEditErrorMessage(null);
    setEditSubmitPhase('idle');
    setIsEditOpen(true);
  }

  function handleEditClose() {
    if (isEditBusy) {
      return;
    }

    setIsEditOpen(false);
  }

  async function handlePickProfileImage() {
    if (isEditBusy) {
      return;
    }

    setIsPickingProfileImage(true);
    setEditErrorMessage(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        allowsMultipleSelection: false,
        quality: 0.9,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const contentType = getSupportedImageContentType({
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        uri: asset.uri,
      });

      if (!contentType) {
        setEditErrorMessage('Choose a JPEG, PNG, or WebP image.');
        return;
      }

      setSelectedProfileImage({
        uri: asset.uri,
        contentType,
      });
    } catch (error) {
      console.error('Failed to pick profile image', error);
      setEditErrorMessage(
        error instanceof Error ? error.message : 'Could not open your photo library right now.'
      );
    } finally {
      setIsPickingProfileImage(false);
    }
  }

  function handleRemoveProfileImage() {
    if (isEditBusy) {
      return;
    }

    setSelectedProfileImage(null);
    setEditErrorMessage(null);
  }

  async function handleEditSubmit() {
    if (!user || isEditBusy) {
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

    if (Object.keys(payload).length === 0 && !selectedProfileImage) {
      setEditErrorMessage('Enter at least one profile detail to update.');
      return;
    }

    try {
      setEditSubmitPhase(selectedProfileImage ? 'uploading' : 'saving');
      setEditErrorMessage(null);
      setProfileStatusMessage(null);

      if (selectedProfileImage) {
        const uploadTarget = await createProfileImageUploadUrl({
          contentType: selectedProfileImage.contentType,
        });
        const imageBlob = await getBlobFromUri(selectedProfileImage.uri);

        await uploadImageBlobToUrl({
          uploadUrl: uploadTarget.uploadUrl,
          blob: imageBlob,
          contentType: selectedProfileImage.contentType,
        });

        payload.profilePictureUrl = uploadTarget.pictureUrl;
        setEditSubmitPhase('saving');
      }

      const response = await updateUserProfile(user.username, payload);
      setUser(getUpdatedUser(response, user, payload));
      setProfileStatusMessage('Profile updated.');
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      setEditErrorMessage('Could not update your profile. Please try again.');
    } finally {
      setEditSubmitPhase('idle');
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

  const profileImagePreviewUri = selectedProfileImage?.uri ?? user.profilePictureUrl;
  const profileImageButtonLabel = selectedProfileImage
    ? 'Change'
    : user.profilePictureUrl
      ? 'Change photo'
      : 'Choose photo';

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
                disabled={isEditBusy}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                  pressed && !isEditBusy ? styles.pressed : null,
                  isEditBusy ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close edit profile form">
                <FontAwesome name="times" size={16} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold">Profile photo</ThemedText>
                <View style={styles.profileImageEditor}>
                  {profileImagePreviewUri ? (
                    <Image
                      source={profileImagePreviewUri}
                      style={styles.profileImagePreview}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.profileImagePreview,
                        styles.profileImageFallback,
                        {
                          backgroundColor: theme.backgroundElement,
                          borderColor: theme.backgroundSelected,
                        },
                      ]}>
                      <FontAwesome name="user" size={28} color={theme.textSecondary} />
                    </View>
                  )}

                  <View style={styles.profileImageActions}>
                    <Pressable
                      onPress={handlePickProfileImage}
                      disabled={isEditBusy}
                      style={({ pressed }) => [
                        styles.profileImageButton,
                        {
                          borderColor: theme.backgroundSelected,
                          backgroundColor: theme.backgroundElement,
                        },
                        pressed && !isEditBusy ? styles.pressed : null,
                        isEditBusy ? styles.disabled : null,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Choose profile photo">
                      {isPickingProfileImage ? (
                        <ActivityIndicator color={theme.accent} />
                      ) : (
                        <FontAwesome name="image" size={15} color={theme.accent} />
                      )}
                      <ThemedText type="smallBold" style={{ color: theme.accent }}>
                        {isPickingProfileImage ? 'Opening...' : profileImageButtonLabel}
                      </ThemedText>
                    </Pressable>

                    {selectedProfileImage ? (
                      <Pressable
                        onPress={handleRemoveProfileImage}
                        disabled={isEditBusy}
                        style={({ pressed }) => [
                          styles.profileImageButton,
                          {
                            borderColor: theme.backgroundSelected,
                            backgroundColor: theme.backgroundElement,
                          },
                          pressed && !isEditBusy ? styles.pressed : null,
                          isEditBusy ? styles.disabled : null,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Remove selected profile photo">
                        <FontAwesome name="trash-o" size={15} color="#D92D20" />
                        <ThemedText type="smallBold" style={styles.removeProfileImageText}>
                          Remove
                        </ThemedText>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold">First name</ThemedText>
                <TextInput
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  placeholder={user.firstName}
                  placeholderTextColor={theme.textSecondary}
                  editable={!isEditBusy}
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
                  editable={!isEditBusy}
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
                  editable={!isEditBusy}
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
            </ScrollView>

            {editErrorMessage ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.formMessage}>
                {editErrorMessage}
              </ThemedText>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                onPress={handleEditClose}
                disabled={isEditBusy}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    borderColor: theme.backgroundSelected,
                    backgroundColor: theme.backgroundElement,
                  },
                  pressed && !isEditBusy ? styles.pressed : null,
                  isEditBusy ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel profile edits">
                <ThemedText type="smallBold">Cancel</ThemedText>
              </Pressable>

              <Pressable
                onPress={handleEditSubmit}
                disabled={isEditBusy}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.accent, borderColor: theme.accent },
                  pressed && !isEditBusy ? styles.pressed : null,
                  isEditBusy ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Save profile edits">
                {isSubmittingEdit ? <ActivityIndicator color="#FFFFFF" /> : null}
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  {editSaveLabel}
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
    maxHeight: '88%',
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
  formScroll: {
    flexGrow: 0,
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
  profileImageEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  profileImagePreview: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  profileImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileImageActions: {
    flex: 1,
    gap: Spacing.two,
  },
  profileImageButton: {
    minHeight: 40,
    borderRadius: Spacing.three,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  removeProfileImageText: {
    color: '#D92D20',
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
