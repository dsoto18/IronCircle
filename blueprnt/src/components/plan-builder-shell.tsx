import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { FilterChip } from '@/components/filter-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createPlan } from '@/services/plans';
import type { Plan, PlanDifficulty, PlanGoal, PlanType } from '@/types';

type CreatePlanDraft = {
  title: string;
  summary: string;
  description: string;
  goal: PlanGoal;
  difficulty: PlanDifficulty;
  type: PlanType;
  durationWeeks: string;
  tags: string;
  imageUrl: string;
};

type PlanBuilderShellProps = {
  userId: string;
  onPlanCreated: (plan: Plan) => void;
};

const PLAN_TYPE_OPTIONS: { label: string; value: PlanType }[] = [
  { label: 'Workout', value: 'workout' },
  { label: 'Meal', value: 'meal' },
  { label: 'Hybrid', value: 'hybrid' },
];

const PLAN_GOAL_OPTIONS: { label: string; value: PlanGoal }[] = [
  { label: 'General Fitness', value: 'general-fitness' },
  { label: 'Strength', value: 'strength-training' },
  { label: 'Muscle', value: 'muscle-building' },
  { label: 'Weight Loss', value: 'weight-loss' },
  { label: 'Marathon', value: 'marathon-training' },
  { label: 'Mobility', value: 'flexibility-mindfulness' },
  { label: 'HIIT', value: 'hiit' },
];

const PLAN_DIFFICULTY_OPTIONS: { label: string; value: PlanDifficulty }[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

const INITIAL_CREATE_PLAN_DRAFT: CreatePlanDraft = {
  title: '',
  summary: '',
  description: '',
  goal: 'general-fitness',
  difficulty: 'beginner',
  type: 'workout',
  durationWeeks: '4',
  tags: '',
  imageUrl: '',
};

export function PlanBuilderShell({ userId, onPlanCreated }: PlanBuilderShellProps) {
  const theme = useTheme();
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [createPlanDraft, setCreatePlanDraft] = useState<CreatePlanDraft>(INITIAL_CREATE_PLAN_DRAFT);
  const [createdPlan, setCreatedPlan] = useState<Plan | null>(null);
  const [isCreatePlanLoading, setIsCreatePlanLoading] = useState(false);
  const [createPlanError, setCreatePlanError] = useState<string | null>(null);

  function updateCreatePlanDraft<Key extends keyof CreatePlanDraft>(
    key: Key,
    value: CreatePlanDraft[Key]
  ) {
    setCreatePlanDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleCreatePlan() {
    const title = createPlanDraft.title.trim();
    const summary = createPlanDraft.summary.trim();
    const durationWeeks = Number(createPlanDraft.durationWeeks);

    if (!title || !summary || !Number.isFinite(durationWeeks) || durationWeeks <= 0) {
      setCreatePlanError('Add a title, summary, and a valid duration in weeks before creating.');
      return;
    }

    setIsCreatePlanLoading(true);
    setCreatePlanError(null);

    try {
      const nextPlan = await createPlan({
        userId,
        title,
        summary,
        description: createPlanDraft.description.trim() || undefined,
        goal: createPlanDraft.goal,
        difficulty: createPlanDraft.difficulty,
        type: createPlanDraft.type,
        durationWeeks,
        tags:
          createPlanDraft.tags.trim()
            ? createPlanDraft.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            : undefined,
        imageUrl: createPlanDraft.imageUrl.trim() || undefined,
      });

      setCreatedPlan(nextPlan);
      onPlanCreated(nextPlan);
      setIsCreatePlanOpen(false);
      setCreatePlanDraft(INITIAL_CREATE_PLAN_DRAFT);
    } catch (error) {
      setCreatePlanError(error instanceof Error ? error.message : 'Unable to create plan.');
    } finally {
      setIsCreatePlanLoading(false);
    }
  }

  if (createdPlan) {
    return (
      <ThemedView type="backgroundElement" style={styles.builderCard}>
        <View style={styles.builderHeader}>
          <View style={styles.builderHeaderCopy}>
            <ThemedText type="smallBold">Plan shell created</ThemedText>
            <ThemedText themeColor="textSecondary">
              Your first builder node is ready. We can add weeks next.
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Draft
          </ThemedText>
        </View>

        <View style={styles.snapshotContent}>
          <ThemedText type="smallBold">{createdPlan.title}</ThemedText>
          <ThemedText themeColor="textSecondary">{createdPlan.summary}</ThemedText>
          <View style={styles.snapshotMetaRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {createdPlan.type}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {createdPlan.difficulty}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {createdPlan.durationWeeks} weeks
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.builderCard}>
      <View style={styles.builderHeader}>
        <View style={styles.builderHeaderCopy}>
          <ThemedText type="smallBold">Plan Builder</ThemedText>
          <ThemedText themeColor="textSecondary">
            Start by creating the plan shell. Weeks come next.
          </ThemedText>
        </View>
        <Pressable
          onPress={() => setIsCreatePlanOpen((current) => !current)}
          style={({ pressed }) => [styles.toggleButton, pressed ? styles.pressed : null]}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {isCreatePlanOpen ? 'Hide' : 'Create Plan'}
          </ThemedText>
        </Pressable>
      </View>

      {isCreatePlanOpen ? (
        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Title</ThemedText>
            <TextInput
              value={createPlanDraft.title}
              onChangeText={(value) => updateCreatePlanDraft('title', value)}
              placeholder="Starter Strength Blueprint"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.background,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Summary</ThemedText>
            <TextInput
              value={createPlanDraft.summary}
              onChangeText={(value) => updateCreatePlanDraft('summary', value)}
              placeholder="A short explanation of the plan."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[
                styles.textInput,
                styles.multilineInput,
                {
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.background,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Description (optional)</ThemedText>
            <TextInput
              value={createPlanDraft.description}
              onChangeText={(value) => updateCreatePlanDraft('description', value)}
              placeholder="Add extra context for the plan."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[
                styles.textInput,
                styles.multilineInput,
                {
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.background,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Duration in weeks</ThemedText>
            <TextInput
              value={createPlanDraft.durationWeeks}
              onChangeText={(value) => updateCreatePlanDraft('durationWeeks', value)}
              placeholder="4"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.background,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Goal</ThemedText>
            <View style={styles.optionWrap}>
              {PLAN_GOAL_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  selected={createPlanDraft.goal === option.value}
                  onPress={() => updateCreatePlanDraft('goal', option.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Difficulty</ThemedText>
            <View style={styles.optionWrap}>
              {PLAN_DIFFICULTY_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  selected={createPlanDraft.difficulty === option.value}
                  onPress={() => updateCreatePlanDraft('difficulty', option.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Type</ThemedText>
            <View style={styles.optionWrap}>
              {PLAN_TYPE_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  selected={createPlanDraft.type === option.value}
                  onPress={() => updateCreatePlanDraft('type', option.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Tags (optional)</ThemedText>
            <TextInput
              value={createPlanDraft.tags}
              onChangeText={(value) => updateCreatePlanDraft('tags', value)}
              placeholder="Outdoors, Individual"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.background,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Image URL (optional)</ThemedText>
            <TextInput
              value={createPlanDraft.imageUrl}
              onChangeText={(value) => updateCreatePlanDraft('imageUrl', value)}
              placeholder="https://..."
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.background,
                },
              ]}
            />
          </View>

          {createPlanError ? (
            <ThemedText type="small" themeColor="textSecondary">
              {createPlanError}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={handleCreatePlan}
            disabled={isCreatePlanLoading}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.accent },
              pressed || isCreatePlanLoading ? styles.pressed : null,
            ]}>
            {isCreatePlanLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ThemedText type="smallBold" style={styles.submitButtonText}>
                Create Plan Shell
              </ThemedText>
            )}
          </Pressable>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  builderCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  builderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  builderHeaderCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  toggleButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  formSection: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    lineHeight: 22,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  submitButton: {
    borderRadius: Spacing.three,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  submitButtonText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
  snapshotContent: {
    gap: Spacing.two,
  },
  snapshotMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
