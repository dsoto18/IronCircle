import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExploreCard } from '@/components/explore-card';
import { FilterChip } from '@/components/filter-chip';
import { ScreenHeader } from '@/components/screen-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { mockExploreItems } from '@/mocks/explore-items';
import type { ExploreSourceType } from '@/types';

const EXPLORE_FILTERS = ['All', 'Influencers', 'Clubs', 'Brands'] as const;
type ExploreFilter = (typeof EXPLORE_FILTERS)[number];

const FILTER_TO_SOURCE_TYPE: Partial<Record<ExploreFilter, ExploreSourceType>> = {
  Influencers: 'influencer',
  Clubs: 'club',
  Brands: 'brand',
};

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ExploreFilter>('All');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredItems = mockExploreItems.filter((item) => {
    const selectedSourceType = FILTER_TO_SOURCE_TYPE[selectedFilter];
    const matchesFilter = !selectedSourceType || item.sourceType === selectedSourceType;

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableFields = [
      item.sourceName,
      item.title,
      item.summary,
      item.contentType,
      item.sourceType,
      ...(item.tags ?? []),
    ];

    return searchableFields.some((field) => field.toLowerCase().includes(normalizedQuery));
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.PK}
          renderItem={({ item }) => <ExploreCard item={item} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <ScreenHeader
                eyebrow="Blueprnt"
                title="Explore"
                subtitle="Discover workouts, announcements, featured challenges, and brand content from verified sources."
                trailingContent={
                  <ThemedText type="small" themeColor="textSecondary">
                    {filteredItems.length} items
                  </ThemedText>
                }
              />

              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search creators, clubs, or topics"
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsRow}
                contentContainerStyle={styles.chipsContent}>
                {EXPLORE_FILTERS.map((filter) => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    selected={selectedFilter === filter}
                    onPress={() => setSelectedFilter(filter)}
                  />
                ))}
              </ScrollView>

              <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">Featured from verified sources</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Posts, challenges, and announcements
                </ThemedText>
              </View>
            </View>
          }
          ListEmptyComponent={
            <ThemedView type="backgroundElement" style={styles.emptyState}>
              <ThemedText type="smallBold">No explore items match that search yet.</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
                Try clearing your search or switching to a different source filter.
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
  chipsRow: {
    flexGrow: 0,
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
