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
import {
  createBlock,
  createDay,
  createItem,
  createPlan,
  createWeek,
  publishPlan,
} from '@/services/plans';
import type {
  HydratedPlanDraft,
  Plan,
  PlanBlock,
  PlanDay,
  PlanDifficulty,
  PlanGoal,
  PlanItem,
  PlanItemType,
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

type CreateBlockDraft = {
  title: string;
  summary: string;
  notes: string;
};

type CreateItemDraft = {
  itemType: PlanItemType;
  title: string;
  description: string;
  sets: string;
  reps: string;
  durationMin: string;
  distance: string;
  restSeconds: string;
  intensity: string;
  tempo: string;
  videoUrl: string;
  calories: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
  ingredients: string;
  recipeUrl: string;
};

type PlanBuilderShellProps = {
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

const PLAN_ITEM_TYPE_OPTIONS: { label: string; value: PlanItemType }[] = [
  { label: 'Exercise', value: 'exercise' },
  { label: 'Meal', value: 'meal' },
  { label: 'Note', value: 'note' },
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

const INITIAL_CREATE_BLOCK_DRAFT: CreateBlockDraft = {
  title: '',
  summary: '',
  notes: '',
};

const INITIAL_CREATE_ITEM_DRAFT: CreateItemDraft = {
  itemType: 'exercise',
  title: '',
  description: '',
  sets: '',
  reps: '',
  durationMin: '',
  distance: '',
  restSeconds: '',
  intensity: '',
  tempo: '',
  videoUrl: '',
  calories: '',
  proteinGrams: '',
  carbsGrams: '',
  fatGrams: '',
  ingredients: '',
  recipeUrl: '',
};

export function PlanBuilderShell({
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
  const [activeDay, setActiveDay] = useState<PlanDay | null>(null);
  const [activeBlock, setActiveBlock] = useState<PlanBlock | null>(null);
  const [openDayBlockForms, setOpenDayBlockForms] = useState<Record<string, boolean>>({});
  const [createBlockDrafts, setCreateBlockDrafts] = useState<Record<string, CreateBlockDraft>>({});
  const [createdBlocksByDay, setCreatedBlocksByDay] = useState<Record<string, PlanBlock[]>>({});
  const [createBlockLoadingDayKey, setCreateBlockLoadingDayKey] = useState<string | null>(null);
  const [createBlockErrors, setCreateBlockErrors] = useState<Record<string, string | null>>({});
  const [openBlockItemForms, setOpenBlockItemForms] = useState<Record<string, boolean>>({});
  const [createItemDrafts, setCreateItemDrafts] = useState<Record<string, CreateItemDraft>>({});
  const [createdItemsByBlock, setCreatedItemsByBlock] = useState<Record<string, PlanItem[]>>({});
  const [createItemLoadingBlockKey, setCreateItemLoadingBlockKey] = useState<string | null>(null);
  const [createItemErrors, setCreateItemErrors] = useState<Record<string, string | null>>({});
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

  function getDayKey(day: Pick<PlanDay, 'planId' | 'weekNumber' | 'dayNumber'>) {
    return `${day.planId}-${day.weekNumber}-${day.dayNumber}`;
  }

  function getBlockKey(
    block: Pick<PlanBlock, 'planId' | 'weekNumber' | 'dayNumber' | 'blockNumber'>
  ) {
    return `${block.planId}-${block.weekNumber}-${block.dayNumber}-${block.blockNumber}`;
  }

  function getPreview(value: string | undefined, fallback: string, maxLength = 24) {
    if (!value) {
      return fallback;
    }

    return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
  }

  function getItemDetails(item: PlanItem) {
    return [
      item.sets ? `Sets ${item.sets}` : null,
      item.reps ? `Reps ${item.reps}` : null,
      item.durationMin ? `${item.durationMin} min` : null,
      item.distance ? `${item.distance} distance` : null,
      item.restSeconds ? `${item.restSeconds}s rest` : null,
      item.intensity ? `Intensity ${item.intensity}` : null,
      item.tempo ? `Tempo ${item.tempo}` : null,
      item.calories ? `${item.calories} calories` : null,
      item.proteinGrams ? `${item.proteinGrams}g protein` : null,
      item.carbsGrams ? `${item.carbsGrams}g carbs` : null,
      item.fatGrams ? `${item.fatGrams}g fat` : null,
      item.ingredients?.length ? item.ingredients.join(', ') : null,
    ].filter((detail): detail is string => Boolean(detail));
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
    const hydratedDays = Object.values(initialDraft.daysByWeek).flat();
    const hydratedBlocks = Object.values(initialDraft.blocksByDay).flat();
    const nextOpenDayBlockForms = Object.fromEntries(
      hydratedDays.map((day) => [getDayKey(day), false])
    );
    const nextCreateBlockDrafts = Object.fromEntries(
      hydratedDays.map((day) => [getDayKey(day), INITIAL_CREATE_BLOCK_DRAFT])
    );
    const nextCreateBlockErrors = Object.fromEntries(
      hydratedDays.map((day) => [getDayKey(day), null])
    );
    const nextOpenBlockItemForms = Object.fromEntries(
      hydratedBlocks.map((block) => [getBlockKey(block), false])
    );
    const nextCreateItemDrafts = Object.fromEntries(
      hydratedBlocks.map((block) => [getBlockKey(block), INITIAL_CREATE_ITEM_DRAFT])
    );
    const nextCreateItemErrors = Object.fromEntries(
      hydratedBlocks.map((block) => [getBlockKey(block), null])
    );

    setCreatedPlan(initialDraft.plan);
    setCreatedWeeks(initialDraft.weeks);
    setCreatedDaysByWeek(initialDraft.daysByWeek);
    setCreatedBlocksByDay(initialDraft.blocksByDay);
    setCreatedItemsByBlock(initialDraft.itemsByBlock);
    setOpenWeekDayForms(nextOpenWeekDayForms);
    setCreateDayDrafts(nextCreateDayDrafts);
    setCreateDayErrors(nextCreateDayErrors);
    setCreateDayLoadingWeekKey(null);
    setOpenDayBlockForms(nextOpenDayBlockForms);
    setCreateBlockDrafts(nextCreateBlockDrafts);
    setCreateBlockErrors(nextCreateBlockErrors);
    setCreateBlockLoadingDayKey(null);
    setOpenBlockItemForms(nextOpenBlockItemForms);
    setCreateItemDrafts(nextCreateItemDrafts);
    setCreateItemErrors(nextCreateItemErrors);
    setCreateItemLoadingBlockKey(null);
    setActiveDay(null);
    setActiveBlock(null);
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

  function getCreateBlockDraftForDay(dayKey: string) {
    return createBlockDrafts[dayKey] ?? INITIAL_CREATE_BLOCK_DRAFT;
  }

  function updateCreateBlockDraft<Key extends keyof CreateBlockDraft>(
    dayKey: string,
    key: Key,
    value: CreateBlockDraft[Key]
  ) {
    setCreateBlockDrafts((current) => ({
      ...current,
      [dayKey]: {
        ...(current[dayKey] ?? INITIAL_CREATE_BLOCK_DRAFT),
        [key]: value,
      },
    }));
  }

  function getCreateItemDraftForBlock(blockKey: string) {
    return createItemDrafts[blockKey] ?? INITIAL_CREATE_ITEM_DRAFT;
  }

  function updateCreateItemDraft<Key extends keyof CreateItemDraft>(
    blockKey: string,
    key: Key,
    value: CreateItemDraft[Key]
  ) {
    setCreateItemDrafts((current) => ({
      ...current,
      [blockKey]: {
        ...(current[blockKey] ?? INITIAL_CREATE_ITEM_DRAFT),
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
      setActiveDay(null);
      setActiveBlock(null);
      setOpenDayBlockForms({});
      setCreateBlockDrafts({});
      setCreatedBlocksByDay({});
      setCreateBlockErrors({});
      setCreateBlockLoadingDayKey(null);
      setOpenBlockItemForms({});
      setCreateItemDrafts({});
      setCreatedItemsByBlock({});
      setCreateItemErrors({});
      setCreateItemLoadingBlockKey(null);
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
      await publishPlan({
        createdAt: createdPlan.createdAt,
        planId: createdPlan.planId,
      });

      await onPlanPublished?.();
      setCreatedPlan(null);
      setCreatedWeeks([]);
      setOpenWeekDayForms({});
      setCreateDayDrafts({});
      setCreatedDaysByWeek({});
      setCreateDayErrors({});
      setCreateDayLoadingWeekKey(null);
      setActiveDay(null);
      setActiveBlock(null);
      setOpenDayBlockForms({});
      setCreateBlockDrafts({});
      setCreatedBlocksByDay({});
      setCreateBlockErrors({});
      setCreateBlockLoadingDayKey(null);
      setOpenBlockItemForms({});
      setCreateItemDrafts({});
      setCreatedItemsByBlock({});
      setCreateItemErrors({});
      setCreateItemLoadingBlockKey(null);
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
      const dayKey = getDayKey(nextDay);
      setOpenDayBlockForms((current) => ({ ...current, [dayKey]: false }));
      setCreateBlockDrafts((current) => ({ ...current, [dayKey]: INITIAL_CREATE_BLOCK_DRAFT }));
      setCreatedBlocksByDay((current) => ({ ...current, [dayKey]: [] }));
      setCreateBlockErrors((current) => ({ ...current, [dayKey]: null }));
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

  async function handleCreateBlock(day: PlanDay) {
    if (!createdPlan) {
      return;
    }

    const dayKey = getDayKey(day);
    const draft = getCreateBlockDraftForDay(dayKey);
    const title = draft.title.trim();
    const summary = draft.summary.trim();

    if (!title || !summary) {
      setCreateBlockErrors((current) => ({
        ...current,
        [dayKey]: 'Add a title and summary before creating a block.',
      }));
      return;
    }

    setCreateBlockLoadingDayKey(dayKey);
    setCreateBlockErrors((current) => ({ ...current, [dayKey]: null }));

    try {
      const nextBlock = await createBlock({
        planId: createdPlan.planId,
        weekNumber: day.weekNumber,
        dayNumber: day.dayNumber,
        title,
        summary,
        notes: draft.notes.trim() || undefined,
      });
      const blockKey = getBlockKey(nextBlock);

      setCreatedBlocksByDay((current) => ({
        ...current,
        [dayKey]: [...(current[dayKey] ?? []), nextBlock],
      }));
      setOpenBlockItemForms((current) => ({ ...current, [blockKey]: false }));
      setCreateItemDrafts((current) => ({ ...current, [blockKey]: INITIAL_CREATE_ITEM_DRAFT }));
      setCreatedItemsByBlock((current) => ({ ...current, [blockKey]: [] }));
      setCreateItemErrors((current) => ({ ...current, [blockKey]: null }));
      setCreateBlockDrafts((current) => ({
        ...current,
        [dayKey]: INITIAL_CREATE_BLOCK_DRAFT,
      }));
      setOpenDayBlockForms((current) => ({ ...current, [dayKey]: false }));
      setPublishError(null);
    } catch (error) {
      setCreateBlockErrors((current) => ({
        ...current,
        [dayKey]: error instanceof Error ? error.message : 'Unable to create block.',
      }));
    } finally {
      setCreateBlockLoadingDayKey(null);
    }
  }

  async function handleCreateItem(block: PlanBlock) {
    if (!createdPlan) {
      return;
    }

    const blockKey = getBlockKey(block);
    const draft = getCreateItemDraftForBlock(blockKey);
    const title = draft.title.trim();

    if (!title) {
      setCreateItemErrors((current) => ({
        ...current,
        [blockKey]: 'Add a title before creating an item.',
      }));
      return;
    }

    setCreateItemLoadingBlockKey(blockKey);
    setCreateItemErrors((current) => ({ ...current, [blockKey]: null }));

    try {
      const nextItem = await createItem({
        planId: createdPlan.planId,
        weekNumber: block.weekNumber,
        dayNumber: block.dayNumber,
        blockNumber: block.blockNumber,
        itemType: draft.itemType,
        title,
        description: draft.description.trim() || undefined,
        sets: draft.sets.trim() || undefined,
        reps: draft.reps.trim() || undefined,
        durationMin: draft.durationMin.trim() || undefined,
        distance: draft.distance.trim() || undefined,
        restSeconds: draft.restSeconds.trim() || undefined,
        intensity: draft.intensity.trim() || undefined,
        tempo: draft.tempo.trim() || undefined,
        videoUrl: draft.videoUrl.trim() || undefined,
        calories: draft.calories.trim() || undefined,
        proteinGrams: draft.proteinGrams.trim() || undefined,
        carbsGrams: draft.carbsGrams.trim() || undefined,
        fatGrams: draft.fatGrams.trim() || undefined,
        ingredients: draft.ingredients.trim()
          ? draft.ingredients
              .split(',')
              .map((ingredient) => ingredient.trim())
              .filter(Boolean)
          : undefined,
        recipeUrl: draft.recipeUrl.trim() || undefined,
      });

      setCreatedItemsByBlock((current) => ({
        ...current,
        [blockKey]: [...(current[blockKey] ?? []), nextItem],
      }));
      setCreateItemDrafts((current) => ({ ...current, [blockKey]: INITIAL_CREATE_ITEM_DRAFT }));
      setOpenBlockItemForms((current) => ({ ...current, [blockKey]: false }));
      setPublishError(null);
    } catch (error) {
      setCreateItemErrors((current) => ({
        ...current,
        [blockKey]: error instanceof Error ? error.message : 'Unable to create item.',
      }));
    } finally {
      setCreateItemLoadingBlockKey(null);
    }
  }

  if (createdPlan && activeBlock) {
    const blockKey = getBlockKey(activeBlock);
    const itemDraft = getCreateItemDraftForBlock(blockKey);
    const savedItems = createdItemsByBlock[blockKey] ?? [];

    return (
      <ThemedView type="backgroundElement" style={styles.builderCard}>
        <View style={styles.builderHeader}>
          <View style={styles.builderHeaderCopy}>
            <ThemedText type="smallBold">
              Block {activeBlock.blockNumber}: {activeBlock.title}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Week {activeBlock.weekNumber} / Day {activeBlock.dayNumber} / Items
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setActiveBlock(null)}
            style={({ pressed }) => [styles.toggleButton, pressed ? styles.pressed : null]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Back to Day
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.snapshotContent}>
          <ThemedText themeColor="textSecondary">{activeBlock.summary}</ThemedText>
          {activeBlock.notes ? (
            <ThemedText type="small" themeColor="textSecondary">
              {activeBlock.notes}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.builderHeader}>
          <View style={styles.builderHeaderCopy}>
            <ThemedText type="smallBold">Items</ThemedText>
            <ThemedText themeColor="textSecondary">
              Add exercises, meals, or notes inside this block.
            </ThemedText>
          </View>
          <Pressable
            onPress={() =>
              setOpenBlockItemForms((current) => ({
                ...current,
                [blockKey]: !current[blockKey],
              }))
            }
            style={({ pressed }) => [styles.toggleButton, pressed ? styles.pressed : null]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {openBlockItemForms[blockKey] ? 'Hide' : '+ Add Item'}
            </ThemedText>
          </Pressable>
        </View>

        {openBlockItemForms[blockKey] ? (
          <View style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Item type</ThemedText>
              <View style={styles.optionWrap}>
                {PLAN_ITEM_TYPE_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    selected={itemDraft.itemType === option.value}
                    onPress={() => updateCreateItemDraft(blockKey, 'itemType', option.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Item title</ThemedText>
              <TextInput
                value={itemDraft.title}
                onChangeText={(value) => updateCreateItemDraft(blockKey, 'title', value)}
                placeholder="Push Ups"
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
              <ThemedText type="smallBold">Description (optional)</ThemedText>
              <TextInput
                value={itemDraft.description}
                onChangeText={(value) => updateCreateItemDraft(blockKey, 'description', value)}
                placeholder="Add coaching notes, meal context, or setup details."
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

            {itemDraft.itemType === 'exercise' ? (
              <>
                <View style={styles.twoColumnFields}>
                  <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold">Sets</ThemedText>
                    <TextInput
                      value={itemDraft.sets}
                      onChangeText={(value) => updateCreateItemDraft(blockKey, 'sets', value)}
                      placeholder="3"
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
                    <ThemedText type="smallBold">Reps</ThemedText>
                    <TextInput
                      value={itemDraft.reps}
                      onChangeText={(value) => updateCreateItemDraft(blockKey, 'reps', value)}
                      placeholder="8-10"
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
                </View>

                <View style={styles.twoColumnFields}>
                  <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold">Duration min</ThemedText>
                    <TextInput
                      value={itemDraft.durationMin}
                      onChangeText={(value) =>
                        updateCreateItemDraft(blockKey, 'durationMin', value)
                      }
                      placeholder="20"
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
                    <ThemedText type="smallBold">Rest sec</ThemedText>
                    <TextInput
                      value={itemDraft.restSeconds}
                      onChangeText={(value) =>
                        updateCreateItemDraft(blockKey, 'restSeconds', value)
                      }
                      placeholder="60"
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
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="smallBold">Distance / intensity / tempo / video</ThemedText>
                  <TextInput
                    value={itemDraft.distance}
                    onChangeText={(value) => updateCreateItemDraft(blockKey, 'distance', value)}
                    placeholder="Distance"
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
                  <TextInput
                    value={itemDraft.intensity}
                    onChangeText={(value) => updateCreateItemDraft(blockKey, 'intensity', value)}
                    placeholder="Intensity"
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
                  <TextInput
                    value={itemDraft.tempo}
                    onChangeText={(value) => updateCreateItemDraft(blockKey, 'tempo', value)}
                    placeholder="Tempo"
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
                  <TextInput
                    value={itemDraft.videoUrl}
                    onChangeText={(value) => updateCreateItemDraft(blockKey, 'videoUrl', value)}
                    placeholder="Video URL"
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
              </>
            ) : null}

            {itemDraft.itemType === 'meal' ? (
              <>
                <View style={styles.twoColumnFields}>
                  <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold">Calories</ThemedText>
                    <TextInput
                      value={itemDraft.calories}
                      onChangeText={(value) => updateCreateItemDraft(blockKey, 'calories', value)}
                      placeholder="500"
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
                    <ThemedText type="smallBold">Protein g</ThemedText>
                    <TextInput
                      value={itemDraft.proteinGrams}
                      onChangeText={(value) =>
                        updateCreateItemDraft(blockKey, 'proteinGrams', value)
                      }
                      placeholder="35"
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
                </View>

                <View style={styles.twoColumnFields}>
                  <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold">Carbs g</ThemedText>
                    <TextInput
                      value={itemDraft.carbsGrams}
                      onChangeText={(value) =>
                        updateCreateItemDraft(blockKey, 'carbsGrams', value)
                      }
                      placeholder="45"
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
                    <ThemedText type="smallBold">Fat g</ThemedText>
                    <TextInput
                      value={itemDraft.fatGrams}
                      onChangeText={(value) => updateCreateItemDraft(blockKey, 'fatGrams', value)}
                      placeholder="18"
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
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="smallBold">Ingredients (optional)</ThemedText>
                  <TextInput
                    value={itemDraft.ingredients}
                    onChangeText={(value) => updateCreateItemDraft(blockKey, 'ingredients', value)}
                    placeholder="Chicken, rice, vegetables"
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
                  <ThemedText type="smallBold">Recipe URL (optional)</ThemedText>
                  <TextInput
                    value={itemDraft.recipeUrl}
                    onChangeText={(value) => updateCreateItemDraft(blockKey, 'recipeUrl', value)}
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
              </>
            ) : null}

            {createItemErrors[blockKey] ? (
              <ThemedText type="small" themeColor="textSecondary">
                {createItemErrors[blockKey]}
              </ThemedText>
            ) : null}

            <Pressable
              onPress={() => handleCreateItem(activeBlock)}
              disabled={createItemLoadingBlockKey === blockKey}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: theme.accent },
                pressed || createItemLoadingBlockKey === blockKey ? styles.pressed : null,
              ]}>
              {createItemLoadingBlockKey === blockKey ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText type="smallBold" style={styles.submitButtonText}>
                  Create Item
                </ThemedText>
              )}
            </Pressable>
          </View>
        ) : null}

        {savedItems.length ? (
          <View style={styles.dayList}>
            {savedItems.map((item) => {
              const itemDetails = getItemDetails(item);

              return (
                <ThemedView
                  key={`${item.planId}-${item.weekNumber}-${item.dayNumber}-${item.blockNumber}-${item.order}-${item.createdAt}`}
                  type="background"
                  style={styles.childCard}>
                  <View style={styles.childHeader}>
                    <ThemedText type="smallBold">
                      Item {item.order}: {getPreview(item.title, 'Untitled item', 22)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.itemType}
                    </ThemedText>
                  </View>
                  {item.description ? (
                    <ThemedText themeColor="textSecondary">{item.description}</ThemedText>
                  ) : null}
                  {itemDetails.length ? (
                    <View style={styles.snapshotMetaRow}>
                      {itemDetails.map((detail, index) => (
                        <ThemedText
                          key={`${detail}-${index}`}
                          type="small"
                          themeColor="textSecondary">
                          {detail}
                        </ThemedText>
                      ))}
                    </View>
                  ) : null}
                </ThemedView>
              );
            })}
          </View>
        ) : (
          <ThemedText themeColor="textSecondary">
            No items in this block yet.
          </ThemedText>
        )}
      </ThemedView>
    );
  }

  if (createdPlan && activeDay) {
    const dayKey = getDayKey(activeDay);
    const blockDraft = getCreateBlockDraftForDay(dayKey);
    const savedBlocks = createdBlocksByDay[dayKey] ?? [];

    return (
      <ThemedView type="backgroundElement" style={styles.builderCard}>
        <View style={styles.builderHeader}>
          <View style={styles.builderHeaderCopy}>
            <ThemedText type="smallBold">
              Day {activeDay.dayNumber}: {activeDay.title ?? 'Untitled'}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Week {activeDay.weekNumber} / Blocks
            </ThemedText>
          </View>
          <Pressable
            onPress={() => {
              setActiveBlock(null);
              setActiveDay(null);
            }}
            style={({ pressed }) => [styles.toggleButton, pressed ? styles.pressed : null]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Back to Plan
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.snapshotContent}>
          {activeDay.dayLabel ? (
            <ThemedText type="small" themeColor="textSecondary">
              {activeDay.dayLabel}
            </ThemedText>
          ) : null}
          {activeDay.summary ? (
            <ThemedText themeColor="textSecondary">{activeDay.summary}</ThemedText>
          ) : null}
          {activeDay.notes ? (
            <ThemedText type="small" themeColor="textSecondary">
              {activeDay.notes}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.builderHeader}>
          <View style={styles.builderHeaderCopy}>
            <ThemedText type="smallBold">Blocks</ThemedText>
            <ThemedText themeColor="textSecondary">
              Add the sections or timespans that make up this day.
            </ThemedText>
          </View>
          <Pressable
            onPress={() =>
              setOpenDayBlockForms((current) => ({
                ...current,
                [dayKey]: !current[dayKey],
              }))
            }
            style={({ pressed }) => [styles.toggleButton, pressed ? styles.pressed : null]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {openDayBlockForms[dayKey] ? 'Hide' : '+ Add Block'}
            </ThemedText>
          </Pressable>
        </View>

        {openDayBlockForms[dayKey] ? (
          <View style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold">Block title</ThemedText>
              <TextInput
                value={blockDraft.title}
                onChangeText={(value) => updateCreateBlockDraft(dayKey, 'title', value)}
                placeholder="Morning"
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
              <ThemedText type="smallBold">Block summary</ThemedText>
              <TextInput
                value={blockDraft.summary}
                onChangeText={(value) => updateCreateBlockDraft(dayKey, 'summary', value)}
                placeholder="Describe what this part of the day includes."
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
                value={blockDraft.notes}
                onChangeText={(value) => updateCreateBlockDraft(dayKey, 'notes', value)}
                placeholder="Any extra context for this block."
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

            {createBlockErrors[dayKey] ? (
              <ThemedText type="small" themeColor="textSecondary">
                {createBlockErrors[dayKey]}
              </ThemedText>
            ) : null}

            <Pressable
              onPress={() => handleCreateBlock(activeDay)}
              disabled={createBlockLoadingDayKey === dayKey}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: theme.accent },
                pressed || createBlockLoadingDayKey === dayKey ? styles.pressed : null,
              ]}>
              {createBlockLoadingDayKey === dayKey ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText type="smallBold" style={styles.submitButtonText}>
                  Create Block
                </ThemedText>
              )}
            </Pressable>
          </View>
        ) : null}

        {savedBlocks.length ? (
          <View style={styles.dayList}>
            {savedBlocks.map((block) => (
              <Pressable
                key={`${block.planId}-${block.weekNumber}-${block.dayNumber}-${block.blockNumber}-${block.createdAt}`}
                onPress={() => setActiveBlock(block)}
                style={({ pressed }) => [pressed ? styles.pressed : null]}>
                <ThemedView type="background" style={styles.childCard}>
                  <View style={styles.childHeader}>
                    <ThemedText type="smallBold">
                      Block {block.blockNumber}: {getPreview(block.title, 'Untitled block', 22)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {createdItemsByBlock[getBlockKey(block)]?.length ?? 0} items
                    </ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary">{block.summary}</ThemedText>
                  {block.notes ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {block.notes}
                    </ThemedText>
                  ) : null}
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    Manage Items
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </View>
        ) : (
          <ThemedText themeColor="textSecondary">
            No blocks in this day yet.
          </ThemedText>
        )}
      </ThemedView>
    );
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
                        <Pressable
                          key={`${day.planId}-${day.weekNumber}-${day.dayNumber}-${day.createdAt}`}
                          onPress={() => {
                            setActiveBlock(null);
                            setActiveDay(day);
                          }}
                          style={({ pressed }) => [pressed ? styles.pressed : null]}>
                          <ThemedView type="backgroundElement" style={styles.grandChildCard}>
                            <View style={styles.childHeader}>
                              <ThemedText type="smallBold">
                                Day {day.dayNumber}: {getPreview(day.title, 'Untitled', 18)}
                              </ThemedText>
                              <ThemedText type="small" themeColor="textSecondary">
                                {createdBlocksByDay[getDayKey(day)]?.length ?? 0} blocks
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
                            <ThemedText type="smallBold" style={{ color: theme.accent }}>
                              Build Blocks
                            </ThemedText>
                          </ThemedView>
                        </Pressable>
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
  twoColumnFields: {
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
