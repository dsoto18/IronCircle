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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/filter-chip';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  createFeaturedPost,
  FEATURED_POST_CONTENT_TYPES,
  type FeaturedPostContentType,
} from '@/services/featured';

type FormInputProps = TextInputProps & {
  label: string;
};

const CONTENT_TYPE_LABELS: Record<FeaturedPostContentType, string> = {
  post: 'Post',
  announcement: 'Announcement',
  challenge: 'Challenge',
};

function FormInput({ label, multiline, style, ...inputProps }: FormInputProps) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
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

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export default function CreateFeaturedPostScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [contentType, setContentType] = useState<FeaturedPostContentType>('post');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && summary.trim().length > 0 && !isSubmitting;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/explore');
  }

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createFeaturedPost({
        contentType,
        title,
        summary,
        tags: parseTags(tags),
      });

      handleBack();
    } catch (error) {
      console.error('Failed to create featured post', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not create featured post right now.'
      );
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
              title="Create featured post"
              subtitle="Share a featured update for Explore."
              trailingContent={
                <Pressable
                  onPress={handleBack}
                  style={({ pressed }) => [styles.cancelButton, pressed ? styles.pressed : null]}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel create featured post">
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    Cancel
                  </ThemedText>
                </Pressable>
              }
            />

            <ThemedView type="backgroundElement" style={styles.formCard}>
              <View style={styles.section}>
                <ThemedText type="smallBold">Featured Type</ThemedText>
                <View style={styles.typeGrid}>
                  {FEATURED_POST_CONTENT_TYPES.map((option) => (
                    <FilterChip
                      key={option}
                      label={CONTENT_TYPE_LABELS[option]}
                      selected={contentType === option}
                      onPress={() => setContentType(option)}
                      variant="accent"
                    />
                  ))}
                </View>
              </View>

              <FormInput
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="What are you sharing?"
                maxLength={40}
              />

              <FormInput
                label="Summary"
                value={summary}
                onChangeText={setSummary}
                placeholder="Add the short context people should see in Explore."
                multiline
                maxLength={250}
              />

              <FormInput
                label="Tags"
                value={tags}
                onChangeText={setTags}
                placeholder="Hybrid, Conditioning"
                autoCapitalize="words"
                autoCorrect={false}
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
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: canSubmit ? theme.accent : theme.backgroundSelected },
                  pressed && canSubmit ? styles.pressed : null,
                  !canSubmit ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Create featured post">
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <FontAwesome name="paper-plane" size={16} color="#FFFFFF" />
                )}
                <ThemedText type="smallBold" style={styles.submitButtonText}>
                  {isSubmitting ? 'Publishing...' : 'Publish Featured Post'}
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
