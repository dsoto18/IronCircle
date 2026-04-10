import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/filter-chip';
import { PlanBuilderShell } from '@/components/plan-builder-shell';
import { PlanCard } from '@/components/plan-card';
import { ScreenHeader } from '@/components/screen-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getPlans } from '@/services/plans';
import type { Plan, PlanType } from '@/types';

type PlanTypeFilter = 'all' | PlanType;

const TEST_USER_ID = '33fdc5e3-3c0b-4736-ae6d-a296077abe5d';

const PLAN_TYPE_FILTERS: { label: string; value: PlanTypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Workout', value: 'workout' },
  { label: 'Meal', value: 'meal' },
  { label: 'Hybrid', value: 'hybrid' },
];

function getPlanListKey(plan: Plan, index: number) {
  return [plan.planId, plan.createdAt, plan.title, String(index)].filter(Boolean).join('-');
}

export default function PlansScreen() {
  const [plans, setPlans] = useState<Awaited<ReturnType<typeof getPlans>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PlanTypeFilter>('all');

  async function loadPlans() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const nextPlans = await getPlans();
      setPlans(nextPlans);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load plans right now.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadPlansForEffect() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const nextPlans = await getPlans();

        if (!isActive) {
          return;
        }

        setPlans(nextPlans);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to load plans right now.'
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPlansForEffect();

    return () => {
      isActive = false;
    };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredPlans = plans.filter((plan) => {
    const matchesType = selectedType === 'all' || plan.type === selectedType;
    if (!matchesType) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableFields = [
      plan.title,
      plan.summary,
      plan.creator,
      plan.goal,
      ...(plan.tags ?? []),
    ];

    return searchableFields.some((field) => field.toLowerCase().includes(normalizedQuery));
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={filteredPlans}
          keyExtractor={getPlanListKey}
          renderItem={({ item }) => <PlanCard plan={item} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <ScreenHeader
                eyebrow="Blueprnt"
                title="Find your routine"
                subtitle="Browse free workout, nutrition, and hybrid programs designed around clear goals."
                trailingContent={
                  <ThemedText type="small" themeColor="textSecondary">
                    {filteredPlans.length} plans
                  </ThemedText> 
                }
              />

              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search plans, goals, or creators"
              />

              <PlanBuilderShell
                userId={TEST_USER_ID}
                onPlanPublished={loadPlans}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContent}>
                {PLAN_TYPE_FILTERS.map((filter) => (
                  <FilterChip
                    key={filter.value}
                    label={filter.label}
                    selected={selectedType === filter.value}
                    onPress={() => setSelectedType(filter.value)}
                  />
                ))}
              </ScrollView>

              <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">Featured plans</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {isLoading ? 'Loading from Blueprnt' : 'Free and community-driven'}
                </ThemedText>
              </View>

              {isLoading ? (
                <ThemedView type="backgroundElement" style={styles.statusCard}>
                  <ActivityIndicator />
                  <View style={styles.statusCopy}>
                    <ThemedText type="smallBold">Loading plans...</ThemedText>
                    <ThemedText themeColor="textSecondary">
                      Pulling the latest routines from your database.
                    </ThemedText>
                  </View>
                </ThemedView>
              ) : null}

              {errorMessage ? (
                <ThemedView type="backgroundElement" style={styles.statusCard}>
                  <View style={styles.statusCopy}>
                    <ThemedText type="smallBold">Could not load plans</ThemedText>
                    <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText>
                  </View>
                </ThemedView>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            !isLoading && !errorMessage ? (
              <ThemedView type="backgroundElement" style={styles.emptyState}>
                <ThemedText type="smallBold">No plans match that search yet.</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
                  Try clearing your search or switching to a different plan type.
                </ThemedText>
              </ThemedView>
            ) : null
          }
        />
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
  headerBlock: {
    gap: Spacing.three,
    paddingBottom: Spacing.one,
  },
  chipsContent: {
    gap: Spacing.two,
    paddingRight: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  emptyState: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  statusCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  emptyCopy: {
    lineHeight: 22,
  },
});
