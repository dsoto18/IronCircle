import { useEffect, useState } from 'react';
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
import { createDay, createPlan, createWeek, publishPlan } from '@/services/plans';
import type {
  HydratedPlanDraft,
  Plan,
  PlanDay,
  PlanDifficulty,
  PlanGoal,
  PlanType,
  PlanWeek,
} from '@/types';

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

type CreateWeekDraft = {
  title: string;
  summary: string;
  notes: string;
};

type CreateDayDraft = {
  title: string;
  summary: string;
  notes: string;
  dayLabel: string;
};

type PlanBuilderShellProps = {
  userId: string;
  onPlanCreated?: (plan: Plan) => void;
  onPlanPublished?: () => Promise<void> | void;
  initialDraft?: HydratedPlanDraft | null;
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

const INITIAL_CREATE_WEEK_DRAFT: CreateWeekDraft = {
  title: '',
  summary: '',
  notes: '',
};

const INITIAL_CREATE_DAY_DRAFT: CreateDayDraft = {
  title: '',
  summary: '',
  notes: '',
  dayLabel: '',
};

export function PlanBuilderShell({
  userId,
  onPlanCreated,
  onPlanPublished,
  initialDraft,
}: PlanBuilderShellProps) {
  const theme = useTheme();
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [createPlanDraft, setCreatePlanDraft] = useState<CreatePlanDraft>(INITIAL_CREATE_PLAN_DRAFT);
  const [createdPlan, setCreatedPlan] = useState<Plan | null>(null);
  const [createdWeeks, setCreatedWeeks] = useState<PlanWeek[]>([]);
  const [isCreatePlanLoading, setIsCreatePlanLoading] = useState(false);
  const [createPlanError, setCreatePlanError] = useState<string | null>(null);
  const [isCreateWeekOpen, setIsCreateWeekOpen] = useState(false);
  const [createWeekDraft, setCreateWeekDraft] = useState<CreateWeekDraft>(INITIAL_CREATE_WEEK_DRAFT);
  const [isCreateWeekLoading, setIsCreateWeekLoading] = useState(false);
  const [createWeekError, setCreateWeekError] = useState<string | null>(null);
  const [openWeekDayForms, setOpenWeekDayForms] = useState<Record<string, boolean>>({});
  const [createDayDrafts, setCreateDayDrafts] = useState<Record<string, CreateDayDraft>>({});
  const [createdDaysByWeek, setCreatedDaysByWeek] = useState<Record<string, PlanDay[]>>({});
  const [createDayLoadingWeekKey, setCreateDayLoadingWeekKey] = useState<string | null>(null);
  const [createDayErrors, setCreateDayErrors] = useState<Record<string, string | null>>({});
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  function updateCreatePlanDraft<Key extends keyof CreatePlanDraft>(
    key: Key,
    value: CreatePlanDraft[Key]
  ) {
    setCreatePlanDraft((current) => ({ ...current, [key]: value }));
  }

  function updateCreateWeekDraft<Key extends keyof CreateWeekDraft>(
    key: Key,
    value: CreateWeekDraft[Key]
  ) {
    setCreateWeekDraft((current) => ({ ...current, [key]: value }));
  }

  function getWeekKey(week: Pick<PlanWeek, 'planId' | 'weekNumber'>) {
    return `${week.planId}-${week.weekNumber}`;
  }

  useEffect(() => {
    if (!initialDraft) {
      return;
    }

    const nextOpenWeekDayForms = Object.fromEntries(
      initialDraft.weeks.map((week) => [getWeekKey(week), false])
    );
    const nextCreateDayDrafts = Object.fromEntries(
      initialDraft.weeks.map((week) => [getWeekKey(week), INITIAL_CREATE_DAY_DRAFT])
    );
    const nextCreateDayErrors = Object.fromEntries(
      initialDraft.weeks.map((week) => [getWeekKey(week), null])
    );

    setCreatedPlan(initialDraft.plan);
    setCreatedWeeks(initialDraft.weeks);
    setCreatedDaysByWeek(initialDraft.daysByWeek);
    setOpenWeekDayForms(nextOpenWeekDayForms);
    setCreateDayDrafts(nextCreateDayDrafts);
    setCreateDayErrors(nextCreateDayErrors);
    setCreateDayLoadingWeekKey(null);
    setIsCreatePlanOpen(false);
    setCreatePlanDraft(INITIAL_CREATE_PLAN_DRAFT);
    setCreatePlanError(null);
    setIsCreateWeekOpen(false);
    setCreateWeekDraft(INITIAL_CREATE_WEEK_DRAFT);
    setCreateWeekError(null);
    setPublishError(null);
  }, [initialDraft]);

  function getCreateDayDraftForWeek(weekKey: string) {
    return createDayDrafts[weekKey] ?? INITIAL_CREATE_DAY_DRAFT;
  }

  function updateCreateDayDraft<Key extends keyof CreateDayDraft>(
    weekKey: string,
    key: Key,
    value: CreateDayDraft[Key]
  ) {
    setCreateDayDrafts((current) => ({
      ...current,
      [weekKey]: {
        ...(current[weekKey] ?? INITIAL_CREATE_DAY_DRAFT),
        [key]: value,
      },
    }));
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
      onPlanCreated?.(nextPlan);
      setCreatedWeeks([]);
      setOpenWeekDayForms({});
      setCreateDayDrafts({});
      setCreatedDaysByWeek({});
      setCreateDayErrors({});
      setCreateDayLoadingWeekKey(null);
      setIsCreateWeekOpen(false);
      setCreateWeekDraft(INITIAL_CREATE_WEEK_DRAFT);
      setCreateWeekError(null);
      setPublishError(null);
      setIsCreatePlanOpen(false);
      setCreatePlanDraft(INITIAL_CREATE_PLAN_DRAFT);
    } catch (error) {
      setCreatePlanError(error instanceof Error ? error.message : 'Unable to create plan.');
    } finally {
      setIsCreatePlanLoading(false);
    }
  }

  async function handleCreateWeek() {
    if (!createdPlan) {
      return;
    }

    const title = createWeekDraft.title.trim();
    const summary = createWeekDraft.summary.trim();

    if (!title || !summary) {
      setCreateWeekError('Add a title and summary before creating a week.');
      return;
    }

    setIsCreateWeekLoading(true);
    setCreateWeekError(null);

    try {
      const nextWeek = await createWeek({
        planId: createdPlan.planId,
        userId,
        title,
        summary,
        notes: createWeekDraft.notes.trim() || undefined,
      });

      const weekKey = getWeekKey(nextWeek);

      setCreatedWeeks((current) => [...current, nextWeek]);
      setOpenWeekDayForms((current) => ({ ...current, [weekKey]: false }));
      setCreateDayDrafts((current) => ({ ...current, [weekKey]: INITIAL_CREATE_DAY_DRAFT }));
      setCreatedDaysByWeek((current) => ({ ...current, [weekKey]: [] }));
      setCreateDayErrors((current) => ({ ...current, [weekKey]: null }));
      setCreateWeekDraft(INITIAL_CREATE_WEEK_DRAFT);
      setIsCreateWeekOpen(false);
      setPublishError(null);
    } catch (error) {
      setCreateWeekError(error instanceof Error ? error.message : 'Unable to create week.');
    } finally {
      setIsCreateWeekLoading(false);
    }
  }

  async function handlePublishPlan() {
    if (!createdPlan || createdWeeks.length === 0) {
      setPublishError('Add at least one week before publishing this plan.');
      return;
    }

    setIsPublishLoading(true);
    setPublishError(null);

    try {
      console.log("Created Plan: ", createdPlan);
      await publishPlan({
        createdAt: createdPlan.createdAt,
        planId: createdPlan.planId,
        userId,
      });

      await onPlanPublished?.();
      setCreatedPlan(null);
      setCreatedWeeks([]);
      setOpenWeekDayForms({});
      setCreateDayDrafts({});
      setCreatedDaysByWeek({});
      setCreateDayErrors({});
      setCreateDayLoadingWeekKey(null);
      setIsCreateWeekOpen(false);
      setCreateWeekDraft(INITIAL_CREATE_WEEK_DRAFT);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Unable to publish plan.');
    } finally {
      setIsPublishLoading(false);
    }
  }

  async function handleCreateDay(week: PlanWeek) {
    if (!createdPlan) {
      return;
    }

    const weekKey = getWeekKey(week);
    const draft = getCreateDayDraftForWeek(weekKey);
    const title = draft.title.trim();

    if (!title) {
      setCreateDayErrors((current) => ({
        ...current,
        [weekKey]: 'Add a title before creating a day.',
      }));
      return;
    }

    setCreateDayLoadingWeekKey(weekKey);
    setCreateDayErrors((current) => ({ ...current, [weekKey]: null }));

    try {
      const nextDay = await createDay({
        planId: createdPlan.planId,
        userId,
        weekNumber: week.weekNumber,
        title,
        summary: draft.summary.trim() || undefined,
        notes: draft.notes.trim() || undefined,
        dayLabel: draft.dayLabel.trim() || undefined,
      });

      setCreatedDaysByWeek((current) => ({
        ...current,
        [weekKey]: [...(current[weekKey] ?? []), nextDay],
      }));
      setCreateDayDrafts((current) => ({ ...current, [weekKey]: INITIAL_CREATE_DAY_DRAFT }));
      setOpenWeekDayForms((current) => ({ ...current, [weekKey]: false }));
      setPublishError(null);
    } catch (error) {
      setCreateDayErrors((current) => ({
        ...current,
        [weekKey]: error instanceof Error ? error.message : 'Unable to create day.',
      }));
    } finally {
      setCreateDayLoadingWeekKey(null);
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

        <View style={styles.divider} />

        <View style={styles.builderHeader}>
          <View style={styles.builderHeaderCopy}>
            <ThemedText type="smallBold">Weeks</ThemedText>
            <ThemedText themeColor="textSecondary">
              Add the first week beneath this saved plan shell.
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setIsCreateWeekOpen((current) => !current)}
            style={({ pressed }) => [styles.toggleButton, pressed ? styles.pressed : null]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {isCreateWeekOpen ? 'Hide' : '+ Add Week'}
            </ThemedText>
          </Pressable>
        </View>

        {isCreateWeekOpen ? (
          <View style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Week title</ThemedText>
              <TextInput
                value={createWeekDraft.title}
                onChangeText={(value) => updateCreateWeekDraft('title', value)}
                placeholder="Week 1 Foundation"
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
              <ThemedText type="smallBold">Week summary</ThemedText>
              <TextInput
                value={createWeekDraft.summary}
                onChangeText={(value) => updateCreateWeekDraft('summary', value)}
                placeholder="Outline the focus for this week."
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
              <ThemedText type="smallBold">Notes (optional)</ThemedText>
              <TextInput
                value={createWeekDraft.notes}
                onChangeText={(value) => updateCreateWeekDraft('notes', value)}
                placeholder="Anything the user should know before starting."
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

            {createWeekError ? (
              <ThemedText type="small" themeColor="textSecondary">
                {createWeekError}
              </ThemedText>
            ) : null}

            <Pressable
              onPress={handleCreateWeek}
              disabled={isCreateWeekLoading}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: theme.accent },
                pressed || isCreateWeekLoading ? styles.pressed : null,
              ]}>
              {isCreateWeekLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText type="smallBold" style={styles.submitButtonText}>
                  Create Week
                </ThemedText>
              )}
            </Pressable>
          </View>
        ) : null}

        {createdWeeks.length ? (
          <View style={styles.weekList}>
            {createdWeeks.map((week) => (
              <ThemedView key={`${week.planId}-${week.weekNumber}-${week.createdAt}`} type="background" style={styles.childCard}>
                <View style={styles.childHeader}>
                  <ThemedText type="smallBold">
                    Week {week.weekNumber}: {week.title.slice(0, 20) + "..."}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Saved
                  </ThemedText>
                </View>
                <ThemedText themeColor="textSecondary">{week.summary}</ThemedText>
                {week.notes ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {week.notes}
                  </ThemedText>
                ) : null}

                <View style={styles.nestedSection}>
                  <View style={styles.childHeader}>
                    <View style={styles.builderHeaderCopy}>
                      <ThemedText type="smallBold">Days</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        Create days inside this specific week.
                      </ThemedText>
                    </View>
                    <Pressable
                      onPress={() =>
                        setOpenWeekDayForms((current) => ({
                          ...current,
                          [getWeekKey(week)]: !current[getWeekKey(week)],
                        }))
                      }
                      style={({ pressed }) => [styles.toggleButton, pressed ? styles.pressed : null]}>
                      <ThemedText type="smallBold" style={{ color: theme.accent }}>
                        {openWeekDayForms[getWeekKey(week)] ? 'Hide' : '+ Add Day'}
                      </ThemedText>
                    </Pressable>
                  </View>

                  {openWeekDayForms[getWeekKey(week)] ? (
                    <View style={styles.formSection}>
                      <View style={styles.fieldGroup}>
                        <ThemedText type="smallBold">Day title</ThemedText>
                        <TextInput
                          value={getCreateDayDraftForWeek(getWeekKey(week)).title}
                          onChangeText={(value) =>
                            updateCreateDayDraft(getWeekKey(week), 'title', value)
                          }
                          placeholder="Day 1 Training"
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
                        <ThemedText type="smallBold">Day label (optional)</ThemedText>
                        <TextInput
                          value={getCreateDayDraftForWeek(getWeekKey(week)).dayLabel}
                          onChangeText={(value) =>
                            updateCreateDayDraft(getWeekKey(week), 'dayLabel', value)
                          }
                          placeholder="Monday"
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
                        <ThemedText type="smallBold">Day summary (optional)</ThemedText>
                        <TextInput
                          value={getCreateDayDraftForWeek(getWeekKey(week)).summary}
                          onChangeText={(value) =>
                            updateCreateDayDraft(getWeekKey(week), 'summary', value)
                          }
                          placeholder="Outline the focus for this day."
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
                        <ThemedText type="smallBold">Notes (optional)</ThemedText>
                        <TextInput
                          value={getCreateDayDraftForWeek(getWeekKey(week)).notes}
                          onChangeText={(value) =>
                            updateCreateDayDraft(getWeekKey(week), 'notes', value)
                          }
                          placeholder="Any coaching notes for this day."
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

                      {createDayErrors[getWeekKey(week)] ? (
                        <ThemedText type="small" themeColor="textSecondary">
                          {createDayErrors[getWeekKey(week)]}
                        </ThemedText>
                      ) : null}

                      <Pressable
                        onPress={() => handleCreateDay(week)}
                        disabled={createDayLoadingWeekKey === getWeekKey(week)}
                        style={({ pressed }) => [
                          styles.submitButton,
                          { backgroundColor: theme.accent },
                          pressed || createDayLoadingWeekKey === getWeekKey(week)
                            ? styles.pressed
                            : null,
                        ]}>
                        {createDayLoadingWeekKey === getWeekKey(week) ? (
                          <ActivityIndicator color="#ffffff" />
                        ) : (
                          <ThemedText type="smallBold" style={styles.submitButtonText}>
                            Create Day
                          </ThemedText>
                        )}
                      </Pressable>
                    </View>
                  ) : null}

                  {(createdDaysByWeek[getWeekKey(week)] ?? []).length ? (
                    <View style={styles.dayList}>
                      {(createdDaysByWeek[getWeekKey(week)] ?? []).map((day) => (
                        <ThemedView
                          key={`${day.planId}-${day.weekNumber}-${day.dayNumber}-${day.createdAt}`}
                          type="backgroundElement"
                          style={styles.grandChildCard}>
                          <View style={styles.childHeader}>
                            <ThemedText type="smallBold">
                              Day {day.dayNumber}: {day?.title?.slice(0, 18) + "..." || 'Untitled'}
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                              Saved
                            </ThemedText>
                          </View>
                          {day.dayLabel ? (
                            <ThemedText type="small" themeColor="textSecondary">
                              {day.dayLabel}
                            </ThemedText>
                          ) : null}
                          {day.summary ? (
                            <ThemedText themeColor="textSecondary">{day.summary}</ThemedText>
                          ) : null}
                          {day.notes ? (
                            <ThemedText type="small" themeColor="textSecondary">
                              {day.notes}
                            </ThemedText>
                          ) : null}
                        </ThemedView>
                      ))}
                    </View>
                  ) : null}
                </View>
              </ThemedView>
            ))}
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.publishSection}>
          <View style={styles.builderHeaderCopy}>
            <ThemedText type="smallBold">Publish</ThemedText>
            <ThemedText themeColor="textSecondary">
              Draft plans stay here until published. Add at least one week before publishing.
            </ThemedText>
          </View>

          {publishError ? (
            <ThemedText type="small" themeColor="textSecondary">
              {publishError}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={handlePublishPlan}
            disabled={isPublishLoading || createdWeeks.length === 0}
            style={({ pressed }) => [
              styles.publishButton,
              { backgroundColor: createdWeeks.length ? theme.accent : theme.backgroundSelected },
              pressed || isPublishLoading || createdWeeks.length === 0 ? styles.pressed : null,
            ]}>
            {isPublishLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ThemedText type="smallBold" style={styles.submitButtonText}>
                Publish Plan
              </ThemedText>
            )}
          </Pressable>
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(127,127,127,0.2)',
  },
  weekList: {
    gap: Spacing.two,
  },
  childCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  nestedSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(127,127,127,0.2)',
  },
  dayList: {
    gap: Spacing.two,
  },
  grandChildCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  publishSection: {
    gap: Spacing.two,
  },
  publishButton: {
    borderRadius: Spacing.three,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
});
