import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/filter-chip';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  buildHydratedPlanDraft,
  getBlockKey,
  getDayKey,
  getWeekKey,
} from '@/services/planHydration';
import { getFullPlan } from '@/services/plans';
import type {
  HydratedPlanDraft,
  Plan,
  PlanBlock,
  PlanDay,
  PlanDifficulty,
  PlanGoal,
  PlanItem,
  PlanType,
} from '@/types';

const GOAL_LABELS: Record<PlanGoal, string> = {
  'marathon-training': 'Marathon',
  'muscle-building': 'Muscle',
  'strength-training': 'Strength',
  'weight-loss': 'Weight Loss',
  'flexibility-mindfulness': 'Mobility',
  hiit: 'HIIT',
  'general-fitness': 'General Fitness',
};

const DIFFICULTY_LABELS: Record<PlanDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TYPE_LABELS: Record<PlanType, string> = {
  workout: 'Workout',
  meal: 'Meal',
  hybrid: 'Hybrid',
};

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPreview(value: string | undefined, fallback: string, maxLength = 28) {
  if (!value) {
    return fallback;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

type ItemDetailChip = {
  label: string;
};

type ItemLink = {
  label: string;
  url: string;
};

function normalizeExternalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function getItemDetails(item: PlanItem): ItemDetailChip[] {
  return [
    item.sets ? { label: `Sets ${item.sets}` } : null,
    item.reps ? { label: `Reps ${item.reps}` } : null,
    item.durationMin ? { label: `${item.durationMin} min` } : null,
    item.distance ? { label: item.distance } : null,
    item.restSeconds ? { label: `${item.restSeconds}s rest` } : null,
    item.intensity ? { label: `Intensity ${item.intensity}` } : null,
    item.tempo ? { label: `Tempo ${item.tempo}` } : null,
    item.calories ? { label: `${item.calories} calories` } : null,
    item.proteinGrams ? { label: `${item.proteinGrams}g protein` } : null,
    item.carbsGrams ? { label: `${item.carbsGrams}g carbs` } : null,
    item.fatGrams ? { label: `${item.fatGrams}g fat` } : null,
    item.ingredients?.length ? { label: item.ingredients.join(', ') } : null,
  ].filter((detail): detail is ItemDetailChip => Boolean(detail));
}

function getItemLinks(item: PlanItem): ItemLink[] {
  return [
    item.videoUrl ? { label: 'Video Link', url: normalizeExternalUrl(item.videoUrl) } : null,
    item.recipeUrl ? { label: 'Recipe Link', url: normalizeExternalUrl(item.recipeUrl) } : null,
  ].filter((link): link is ItemLink => Boolean(link));
}

export default function PlanDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const planId = getRouteParam(params.planId);
  const [draft, setDraft] = useState<HydratedPlanDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<PlanDay | null>(null);
  const [activeBlock, setActiveBlock] = useState<PlanBlock | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPlanDetails() {
      if (!planId) {
        setIsLoading(false);
        setErrorMessage('No plan was selected.');
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        setActiveDay(null);
        setActiveBlock(null);

        const items = await getFullPlan(planId);
        const hydratedDraft = buildHydratedPlanDraft(items);

        if (!isActive) {
          return;
        }

        if (!hydratedDraft) {
          setDraft(null);
          setErrorMessage('Could not read this plan.');
          return;
        }

        setDraft(hydratedDraft);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this plan.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPlanDetails();

    return () => {
      isActive = false;
    };
  }, [planId]);

  function handleBackToPlans() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/plans');
  }

  async function handleOpenExternalUrl(url: string) {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.warn('Unable to open external URL', error);
    }
  }

  function renderPlanMeta(plan: Plan) {
    return (
      <ThemedView type="backgroundElement" style={styles.metaCard}>
        <View style={styles.metaHeader}>
          <View style={styles.metaCopy}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {plan.creator}
            </ThemedText>
            <ThemedText style={styles.planTitle}>{plan.title}</ThemedText>
          </View>
          {plan.status ? (
            <ThemedText type="small" themeColor="textSecondary">
              {plan.status}
            </ThemedText>
          ) : null}
        </View>

        <ThemedText themeColor="textSecondary">
          {plan.description || plan.summary}
        </ThemedText>

        <View style={styles.statGrid}>
          <View style={styles.statPill}>
            <FontAwesome name="calendar-o" size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {plan.durationWeeks} weeks
            </ThemedText>
          </View>
          <View style={styles.statPill}>
            <FontAwesome name="signal" size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {DIFFICULTY_LABELS[plan.difficulty]}
            </ThemedText>
          </View>
          <View style={styles.statPill}>
            <FontAwesome name="flag-o" size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {GOAL_LABELS[plan.goal]}
            </ThemedText>
          </View>
          <View style={styles.statPill}>
            <FontAwesome name="bookmark-o" size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {TYPE_LABELS[plan.type]}
            </ThemedText>
          </View>
        </View>

        {plan.tags?.length ? (
          <View style={styles.tagsRow}>
            {plan.tags.map((tag) => (
              <FilterChip key={tag} label={tag} variant="accent" />
            ))}
          </View>
        ) : null}
      </ThemedView>
    );
  }

  function renderOverview(currentDraft: HydratedPlanDraft) {
    return (
      <>
        {renderPlanMeta(currentDraft.plan)}

        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold">Plan structure</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {currentDraft.weeks.length} weeks
          </ThemedText>
        </View>

        {currentDraft.weeks.length ? (
          <View style={styles.weekList}>
            {currentDraft.weeks.map((week) => {
              const days = currentDraft.daysByWeek[getWeekKey(week)] ?? [];

              return (
                <ThemedView
                  key={`${week.planId}-${week.weekNumber}-${week.createdAt}`}
                  type="backgroundElement"
                  style={styles.weekCard}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="smallBold">
                      Week {week.weekNumber}: {week.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {days.length} days
                    </ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary">{week.summary}</ThemedText>
                  {week.notes ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {week.notes}
                    </ThemedText>
                  ) : null}

                  {days.length ? (
                    <View style={styles.dayList}>
                      {days.map((day) => (
                        <Pressable
                          key={`${day.planId}-${day.weekNumber}-${day.dayNumber}-${day.createdAt}`}
                          onPress={() => {
                            setActiveBlock(null);
                            setActiveDay(day);
                          }}
                          style={({ pressed }) => [pressed ? styles.pressed : null]}>
                          <ThemedView type="background" style={styles.dayCard}>
                            <View style={styles.cardHeader}>
                              <ThemedText type="smallBold">
                                Day {day.dayNumber}: {getPreview(day.title, 'Untitled day')}
                              </ThemedText>
                              <ThemedText type="small" themeColor="textSecondary">
                                {currentDraft.blocksByDay[getDayKey(day)]?.length ?? 0} blocks
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
                            <ThemedText type="smallBold" style={{ color: theme.accent }}>
                              View Blocks
                            </ThemedText>
                          </ThemedView>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </ThemedView>
              );
            })}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.statusCard}>
            <ThemedText type="smallBold">No weeks yet.</ThemedText>
            <ThemedText themeColor="textSecondary">
              This plan does not have a published structure to browse yet.
            </ThemedText>
          </ThemedView>
        )}
      </>
    );
  }

  function renderDayDetail(currentDraft: HydratedPlanDraft, day: PlanDay) {
    const blocks = currentDraft.blocksByDay[getDayKey(day)] ?? [];

    return (
      <>
        <View style={styles.focusHeader}>
          <View style={styles.metaCopy}>
            <ThemedText type="small" themeColor="textSecondary">
              {currentDraft.plan.title} / Week {day.weekNumber}
            </ThemedText>
            <ThemedText type="subtitle">Day {day.dayNumber}</ThemedText>
          </View>
          <Pressable
            onPress={() => {
              setActiveBlock(null);
              setActiveDay(null);
            }}
            style={({ pressed }) => [styles.textButton, pressed ? styles.pressed : null]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Overview
            </ThemedText>
          </Pressable>
        </View>

        <ThemedView type="backgroundElement" style={styles.metaCard}>
          <ThemedText type="smallBold">{day.title ?? 'Untitled day'}</ThemedText>
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

        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold">Blocks</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {blocks.length} blocks
          </ThemedText>
        </View>

        {blocks.length ? (
          <View style={styles.weekList}>
            {blocks.map((block) => (
              <Pressable
                key={`${block.planId}-${block.weekNumber}-${block.dayNumber}-${block.blockNumber}-${block.createdAt}`}
                onPress={() => setActiveBlock(block)}
                style={({ pressed }) => [pressed ? styles.pressed : null]}>
                <ThemedView type="backgroundElement" style={styles.weekCard}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="smallBold">
                      Block {block.blockNumber}: {block.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {currentDraft.itemsByBlock[getBlockKey(block)]?.length ?? 0} items
                    </ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary">{block.summary}</ThemedText>
                  {block.notes ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {block.notes}
                    </ThemedText>
                  ) : null}
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    View Items
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.statusCard}>
            <ThemedText type="smallBold">No blocks in this day.</ThemedText>
            <ThemedText themeColor="textSecondary">
              This day does not include any scheduled blocks yet.
            </ThemedText>
          </ThemedView>
        )}
      </>
    );
  }

  function renderBlockDetail(currentDraft: HydratedPlanDraft, block: PlanBlock) {
    const items = currentDraft.itemsByBlock[getBlockKey(block)] ?? [];

    return (
      <>
        <View style={styles.focusHeader}>
          <View style={styles.metaCopy}>
            <ThemedText type="small" themeColor="textSecondary">
              Week {block.weekNumber} / Day {block.dayNumber}
            </ThemedText>
            <ThemedText type="subtitle">Block {block.blockNumber}</ThemedText>
          </View>
          <Pressable
            onPress={() => setActiveBlock(null)}
            style={({ pressed }) => [styles.textButton, pressed ? styles.pressed : null]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Day
            </ThemedText>
          </Pressable>
        </View>

        <ThemedView type="backgroundElement" style={styles.metaCard}>
          <ThemedText type="smallBold">{block.title}</ThemedText>
          <ThemedText themeColor="textSecondary">{block.summary}</ThemedText>
          {block.notes ? (
            <ThemedText type="small" themeColor="textSecondary">
              {block.notes}
            </ThemedText>
          ) : null}
        </ThemedView>

        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold">Items</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {items.length} items
          </ThemedText>
        </View>

        {items.length ? (
          <View style={styles.weekList}>
            {items.map((item) => {
              const itemDetails = getItemDetails(item);
              const itemLinks = getItemLinks(item);

              return (
                <ThemedView
                  key={`${item.planId}-${item.weekNumber}-${item.dayNumber}-${item.blockNumber}-${item.order}-${item.createdAt}`}
                  type="backgroundElement"
                  style={styles.weekCard}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="smallBold">
                      Item {item.order}: {item.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.itemType}
                    </ThemedText>
                  </View>
                  {item.description ? (
                    <ThemedText themeColor="textSecondary">{item.description}</ThemedText>
                  ) : null}
                  {itemDetails.length ? (
                    <View style={styles.tagsRow}>
                      {itemDetails.map((detail, index) => (
                        <FilterChip
                          key={`${detail.label}-${index}`}
                          label={detail.label}
                          variant="accent"
                        />
                      ))}
                    </View>
                  ) : null}
                  {itemLinks.length ? (
                    <View style={styles.linkList}>
                      {itemLinks.map((link) => (
                        <Pressable
                          key={link.label}
                          onPress={() => handleOpenExternalUrl(link.url)}
                          style={({ pressed }) => [
                            styles.linkRow,
                            { borderColor: theme.backgroundSelected },
                            pressed ? styles.pressed : null,
                          ]}>
                          <ThemedText type="smallBold" style={{ color: theme.accent }}>
                            {link.label}
                          </ThemedText>
                          <FontAwesome name="external-link" size={13} color={theme.accent} />
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </ThemedView>
              );
            })}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.statusCard}>
            <ThemedText type="smallBold">No items in this block.</ThemedText>
            <ThemedText themeColor="textSecondary">
              This block does not include any exercises, meals, or notes yet.
            </ThemedText>
          </ThemedView>
        )}
      </>
    );
  }

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <ThemedView type="backgroundElement" style={styles.statusCard}>
        <ActivityIndicator />
        <ThemedText type="smallBold">Loading plan...</ThemedText>
      </ThemedView>
    );
  } else if (errorMessage || !draft) {
    content = (
      <ThemedView type="backgroundElement" style={styles.statusCard}>
        <ThemedText type="smallBold">Could not load plan</ThemedText>
        <ThemedText themeColor="textSecondary">
          {errorMessage ?? 'This plan may not exist yet.'}
        </ThemedText>
      </ThemedView>
    );
  } else if (activeBlock) {
    content = renderBlockDetail(draft, activeBlock);
  } else if (activeDay) {
    content = renderDayDetail(draft, activeDay);
  } else {
    content = renderOverview(draft);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <ScreenHeader
            eyebrow="Plans"
            title="Plan details"
            subtitle="Browse the full structure without leaving the Plans experience."
            trailingContent={
              <Pressable
                onPress={handleBackToPlans}
                style={({ pressed }) => [styles.textButton, pressed ? styles.pressed : null]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  Back
                </ThemedText>
              </Pressable>
            }
          />

          {content}
        </ScrollView>
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
  content: {
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  metaCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  metaCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  planTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  linkList: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  linkRow: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  weekList: {
    gap: Spacing.two,
  },
  weekCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  dayList: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  dayCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  statusCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  textButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.8,
  },
});
