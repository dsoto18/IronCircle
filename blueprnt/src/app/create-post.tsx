import { FontAwesome } from '@expo/vector-icons';
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
import { createPost, POST_TYPES, type CreatePostType } from '@/services/posts';

const TEST_USER_ID = '55919bed-82b2-4868-93e9-7d453d2743db';

type FormInputProps = TextInputProps & {
  label: string;
  fieldStyle?: ViewStyle;
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
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createPost({
        userId: TEST_USER_ID,
        type: selectedType,
        distance: distance.trim(),
        calories: calories.trim(),
        duration: duration.trim(),
        imageUrl: imageUrl.trim(),
        caption: caption.trim(),
      });

      setIsSubmitting(false);
      handleBack();
    } catch (error) {
      console.error('Failed to create post', error);
      setErrorMessage(error instanceof Error ? error.message : 'Could not create post right now.');
      setIsSubmitting(false);
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
                      onPress={() => setSelectedType(postType)}
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
              />

              <View style={styles.metricsGrid}>
                <FormInput
                  label="Distance"
                  value={distance}
                  onChangeText={setDistance}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  fieldStyle={styles.metricField}
                />
                <FormInput
                  label="Calories"
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  keyboardType="number-pad"
                  fieldStyle={styles.metricField}
                />
                <FormInput
                  label="Duration"
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Minutes"
                  keyboardType="number-pad"
                  fieldStyle={styles.metricField}
                />
              </View>

              <FormInput
                label="Image URL"
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://..."
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              {errorMessage ? (
                <ThemedView type="background" style={styles.errorMessage}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {errorMessage}
                  </ThemedText>
                </ThemedView>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: isSubmitting ? theme.backgroundSelected : theme.accent },
                  pressed && !isSubmitting ? styles.pressed : null,
                  isSubmitting ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Create post">
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <FontAwesome name="paper-plane" size={16} color="#FFFFFF" />
                )}
                <ThemedText type="smallBold" style={styles.submitButtonText}>
                  {isSubmitting ? 'Posting...' : 'Create Post'}
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
