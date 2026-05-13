import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/filter-chip';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  createPostImageUploadUrl,
  getBlobFromUri,
  getSupportedImageContentType,
  uploadImageBlobToUrl,
  type ImageContentType,
} from '@/services/media';
import { createPost, POST_TYPES, type CreatePostType } from '@/services/posts';

type FormInputProps = TextInputProps & {
  label: string;
  fieldStyle?: ViewStyle;
};

type SubmitPhase = 'idle' | 'uploading' | 'posting';

type SelectedPostImage = {
  uri: string;
  contentType: ImageContentType;
};

function FormInput({ label, fieldStyle, multiline, style, ...inputProps }: FormInputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.field, fieldStyle]}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline ? styles.textArea : null,
          {
            backgroundColor: theme.background,
            borderColor: theme.backgroundSelected,
            color: theme.text,
          },
          style,
        ]}
        {...inputProps}
      />
    </View>
  );
}

export default function CreatePostScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<CreatePostType>('Run');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedImage, setSelectedImage] = useState<SelectedPostImage | null>(null);
  const [caption, setCaption] = useState('');
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmitting = submitPhase !== 'idle';
  const isBusy = isSubmitting || isPickingImage;
  const submitLabel =
    submitPhase === 'uploading'
      ? 'Uploading...'
      : submitPhase === 'posting'
        ? 'Posting...'
        : 'Create Post';

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  async function handlePickImage() {
    if (isBusy) {
      return;
    }

    setIsPickingImage(true);
    setErrorMessage(null);

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
        setErrorMessage('Choose a JPEG, PNG, or WebP image.');
        return;
      }

      setSelectedImage({
        uri: asset.uri,
        contentType,
      });
    } catch (error) {
      console.error('Failed to pick image', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not open your photo library right now.'
      );
    } finally {
      setIsPickingImage(false);
    }
  }

  function handleRemoveImage() {
    if (isBusy) {
      return;
    }

    setSelectedImage(null);
    setErrorMessage(null);
  }

  async function handleSubmit() {
    if (isBusy) {
      return;
    }

    setSubmitPhase(selectedImage ? 'uploading' : 'posting');
    setErrorMessage(null);

    try {
      let uploadedImage: { imageUrl: string; imageKey: string } | null = null;

      if (selectedImage) {
        const uploadTarget = await createPostImageUploadUrl({
          contentType: selectedImage.contentType,
        });
        const imageBlob = await getBlobFromUri(selectedImage.uri);

        await uploadImageBlobToUrl({
          uploadUrl: uploadTarget.uploadUrl,
          blob: imageBlob,
          contentType: selectedImage.contentType,
        });

        uploadedImage = {
          imageUrl: uploadTarget.pictureUrl,
          imageKey: uploadTarget.imageKey,
        };
        setSubmitPhase('posting');
      }

      await createPost({
        type: selectedType,
        distance: distance.trim(),
        calories: calories.trim(),
        duration: duration.trim(),
        imageUrl: uploadedImage?.imageUrl,
        imageKey: uploadedImage?.imageKey,
        caption: caption.trim(),
      });

      handleBack();
    } catch (error) {
      console.error('Failed to create post', error);
      setErrorMessage(error instanceof Error ? error.message : 'Could not create post right now.');
      setSubmitPhase('idle');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}>
            <ScreenHeader
              eyebrow="Blueprnt"
              title="Create post"
              trailingContent={
                <Pressable
                  onPress={handleBack}
                  style={({ pressed }) => [styles.cancelButton, pressed ? styles.pressed : null]}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel create post">
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    Cancel
                  </ThemedText>
                </Pressable>
              }
            />

            <ThemedView type="backgroundElement" style={styles.formCard}>
              <View style={styles.section}>
                <ThemedText type="smallBold">Post Type</ThemedText>
                <View style={styles.typeGrid}>
                  {POST_TYPES.map((postType) => (
                    <FilterChip
                      key={postType}
                      label={postType}
                      selected={selectedType === postType}
                      onPress={isBusy ? undefined : () => setSelectedType(postType)}
                      variant="accent"
                    />
                  ))}
                </View>
              </View>

              <FormInput
                label="Caption"
                value={caption}
                onChangeText={setCaption}
                placeholder="How did it go?"
                multiline
                maxLength={280}
                editable={!isBusy}
              />

              <View style={styles.metricsGrid}>
                <FormInput
                  label="Distance"
                  value={distance}
                  onChangeText={setDistance}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  fieldStyle={styles.metricField}
                  editable={!isBusy}
                />
                <FormInput
                  label="Calories"
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  keyboardType="number-pad"
                  fieldStyle={styles.metricField}
                  editable={!isBusy}
                />
                <FormInput
                  label="Duration"
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Minutes"
                  keyboardType="number-pad"
                  fieldStyle={styles.metricField}
                  editable={!isBusy}
                />
              </View>

              <View style={styles.field}>
                <ThemedText type="smallBold">Image</ThemedText>
                {selectedImage ? (
                  <View style={styles.selectedImageBlock}>
                    <View
                      style={[
                        styles.imagePreviewFrame,
                        {
                          backgroundColor: theme.background,
                          borderColor: theme.backgroundSelected,
                        },
                      ]}>
                      <Image
                        source={selectedImage.uri}
                        style={styles.imagePreview}
                        contentFit="cover"
                      />
                    </View>
                    <View style={styles.imageActions}>
                      <Pressable
                        onPress={handlePickImage}
                        disabled={isBusy}
                        style={({ pressed }) => [
                          styles.imageActionButton,
                          {
                            backgroundColor: theme.background,
                            borderColor: theme.backgroundSelected,
                          },
                          pressed && !isBusy ? styles.pressed : null,
                          isBusy ? styles.disabled : null,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Change selected image">
                        <FontAwesome name="image" size={15} color={theme.accent} />
                        <ThemedText type="smallBold" style={{ color: theme.accent }}>
                          Change
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={handleRemoveImage}
                        disabled={isBusy}
                        style={({ pressed }) => [
                          styles.imageActionButton,
                          {
                            backgroundColor: theme.background,
                            borderColor: theme.backgroundSelected,
                          },
                          pressed && !isBusy ? styles.pressed : null,
                          isBusy ? styles.disabled : null,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Remove selected image">
                        <FontAwesome name="trash-o" size={15} color="#D92D20" />
                        <ThemedText type="smallBold" style={styles.removeImageText}>
                          Remove
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={handlePickImage}
                    disabled={isBusy}
                    style={({ pressed }) => [
                      styles.imagePickerButton,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.backgroundSelected,
                      },
                      pressed && !isBusy ? styles.pressed : null,
                      isBusy ? styles.disabled : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Choose post image">
                    {isPickingImage ? (
                      <ActivityIndicator color={theme.accent} />
                    ) : (
                      <FontAwesome name="image" size={20} color={theme.accent} />
                    )}
                    <ThemedText type="smallBold" style={{ color: theme.accent }}>
                      {isPickingImage ? 'Opening...' : 'Choose Image'}
                    </ThemedText>
                  </Pressable>
                )}
              </View>

              {errorMessage ? (
                <ThemedView type="background" style={styles.errorMessage}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {errorMessage}
                  </ThemedText>
                </ThemedView>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                disabled={isBusy}
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: isBusy ? theme.backgroundSelected : theme.accent },
                  pressed && !isBusy ? styles.pressed : null,
                  isBusy ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Create post">
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <FontAwesome name="paper-plane" size={16} color="#FFFFFF" />
                )}
                <ThemedText type="smallBold" style={styles.submitButtonText}>
                  {submitLabel}
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  formCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    minHeight: 52,
    borderRadius: Spacing.three,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
  },
  textArea: {
    minHeight: 112,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricField: {
    minWidth: 150,
    flex: 1,
  },
  imagePickerButton: {
    minHeight: 92,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  selectedImageBlock: {
    gap: Spacing.two,
  },
  imagePreviewFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.three,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  imageActionButton: {
    minHeight: 44,
    borderRadius: Spacing.three,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexGrow: 1,
  },
  removeImageText: {
    color: '#D92D20',
  },
  errorMessage: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.85,
  },
});
