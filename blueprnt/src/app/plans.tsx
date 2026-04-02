import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/filter-chip';
import { PlanCard } from '@/components/plan-card';
import { ScreenHeader } from '@/components/screen-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { mockPlans } from '@/mocks/plans';
import type { PlanType } from '@/types';

type PlanTypeFilter = 'all' | PlanType;

const PLAN_TYPE_FILTERS: { label: string; value: PlanTypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Workout', value: 'workout' },
  { label: 'Meal', value: 'meal' },
  { label: 'Hybrid', value: 'hybrid' },
];

export default function PlansScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PlanTypeFilter>('all');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredPlans = mockPlans.filter((plan) => {
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
      plan.creatorName,
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
          keyExtractor={(item) => item.PK}
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
                  Free and community-driven
                </ThemedText>
              </View>
            </View>
          }
          ListEmptyComponent={
            <ThemedView type="backgroundElement" style={styles.emptyState}>
              <ThemedText type="smallBold">No plans match that search yet.</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
                Try clearing your search or switching to a different plan type.
              </ThemedText>
            </ThemedView>
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
  emptyCopy: {
    lineHeight: 22,
  },
});
