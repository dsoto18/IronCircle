import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExploreCard } from '@/components/explore-card';
import { FilterChip } from '@/components/filter-chip';
import { ScreenHeader } from '@/components/screen-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserSearchCard } from '@/components/user-search-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getFeaturedPosts } from '@/services/featured';
import { getMe, searchUsers, type UserSearchResult } from '@/services/user';
import type { ExploreItem, ExploreSourceType } from '@/types';

const EXPLORE_MODES = [
  { label: 'Featured', value: 'featured' },
  { label: 'People', value: 'people' },
] as const;

type ExploreMode = (typeof EXPLORE_MODES)[number]['value'];

const EXPLORE_FILTERS = ['All', 'Influencers', 'Clubs', 'Brands'] as const;
type ExploreFilter = (typeof EXPLORE_FILTERS)[number];

type ExploreListItem =
  | { type: 'featured'; item: ExploreItem }
  | { type: 'person'; user: UserSearchResult };

const FILTER_TO_SOURCE_TYPE: Partial<Record<ExploreFilter, ExploreSourceType>> = {
  Influencers: 'influencer',
  Clubs: 'club',
  Brands: 'brand',
};

export default function ExploreScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedMode, setSelectedMode] = useState<ExploreMode>('featured');
  const [featuredItems, setFeaturedItems] = useState<ExploreItem[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [featuredErrorMessage, setFeaturedErrorMessage] = useState<string | null>(null);
  const [canCreateFeaturedPost, setCanCreateFeaturedPost] = useState(false);
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState('');
  const [peopleSearchQuery, setPeopleSearchQuery] = useState('');
  const [peopleResults, setPeopleResults] = useState<UserSearchResult[]>([]);
  const [isPeopleLoading, setIsPeopleLoading] = useState(false);
  const [peopleErrorMessage, setPeopleErrorMessage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<ExploreFilter>('All');

  const normalizedQuery = featuredSearchQuery.trim().toLowerCase();
  const trimmedPeopleQuery = peopleSearchQuery.trim();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadFeaturedPosts() {
        try {
          setIsFeaturedLoading(true);
          setFeaturedErrorMessage(null);

          const posts = await getFeaturedPosts();

          if (isActive) {
            setFeaturedItems(posts);
          }
        } catch (error) {
          if (isActive) {
            console.error('Failed to load featured posts', error);
            setFeaturedErrorMessage('Could not load featured posts right now.');
          }
        } finally {
          if (isActive) {
            setIsFeaturedLoading(false);
          }
        }
      }

      async function loadCurrentUser() {
        try {
          const result = await getMe();

          if (isActive) {
            setCanCreateFeaturedPost(result.user?.isVerified === true);
          }
        } catch (error) {
          if (isActive) {
            console.error('Failed to load current user for featured permissions', error);
            setCanCreateFeaturedPost(false);
          }
        }
      }

      loadFeaturedPosts();
      loadCurrentUser();

      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    if (selectedMode !== 'people') {
      setIsPeopleLoading(false);
      return;
    }

    if (trimmedPeopleQuery.length < 3) {
      setPeopleResults([]);
      setPeopleErrorMessage(null);
      setIsPeopleLoading(false);
      return;
    }

    let isActive = true;

    setPeopleResults([]);
    setPeopleErrorMessage(null);
    setIsPeopleLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchUsers(trimmedPeopleQuery);

        if (isActive) {
          setPeopleResults(results);
        }
      } catch (error) {
        if (isActive) {
          console.error('Failed to search users', error);
          setPeopleErrorMessage('Could not search people right now.');
        }
      } finally {
        if (isActive) {
          setIsPeopleLoading(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [selectedMode, trimmedPeopleQuery]);

  const filteredItems = featuredItems.filter((item) => {
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

  const activeSearchQuery = selectedMode === 'people' ? peopleSearchQuery : featuredSearchQuery;
  const searchPlaceholder =
    selectedMode === 'people'
      ? 'Search users by username'
      : 'Search creators, clubs, or topics';
  const listItems: ExploreListItem[] =
    selectedMode === 'people'
      ? peopleResults.map((user) => ({ type: 'person', user }))
      : filteredItems.map((item) => ({ type: 'featured', item }));
  const headerSubtitle =
    selectedMode === 'people'
      ? 'Find people on Blueprnt and open their profiles.'
      : 'Discover workouts, announcements, featured challenges, and brand content from verified sources.';
  const headerCountLabel =
    selectedMode === 'people'
      ? trimmedPeopleQuery.length >= 3
        ? `${peopleResults.length} people`
        : 'People'
      : isFeaturedLoading
        ? 'Loading'
      : `${filteredItems.length} items`;
  const sectionTitle =
    selectedMode === 'people' ? 'People on Blueprnt' : 'Featured:'; // left out 'from verified sources'
  const sectionDetail =
    selectedMode === 'people'
      ? isPeopleLoading
        ? 'Searching Blueprnt'
        : 'Name and username'
      : isFeaturedLoading
        ? 'Loading from Blueprnt'
      : 'Posts, challenges, and announcements';
  const showCreateFeaturedButton = selectedMode === 'featured' && canCreateFeaturedPost;
  const showEyebrowTrailingContent = showCreateFeaturedButton || selectedMode === 'people';

  function handleSearchChange(value: string) {
    if (selectedMode === 'people') {
      setPeopleSearchQuery(value);
      return;
    }

    setFeaturedSearchQuery(value);
  }

  function handleUserPress(user: UserSearchResult) {
    router.push(`/profile/${encodeURIComponent(user.userId)}`);
  }

  function handleCreateFeaturedPostPress() {
    router.push('/create-featured-post');
  }

  function renderEmptyState() {
    if (selectedMode === 'people') {
      if (isPeopleLoading) {
        return (
          <ThemedView type="backgroundElement" style={styles.statusCard}>
            <ActivityIndicator />
            <View style={styles.statusCopy}>
              <ThemedText type="smallBold">Searching people...</ThemedText>
              <ThemedText themeColor="textSecondary">
                Looking for matching names and usernames.
              </ThemedText>
            </View>
          </ThemedView>
        );
      }

      if (peopleErrorMessage) {
        return (
          <ThemedView type="backgroundElement" style={styles.emptyState}>
            <ThemedText type="smallBold">Could not search people</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
              {peopleErrorMessage}
            </ThemedText>
          </ThemedView>
        );
      }

      if (trimmedPeopleQuery.length < 3) {
        return (
          <ThemedView type="backgroundElement" style={styles.emptyState}>
            <ThemedText type="smallBold">Search for people on Blueprnt.</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
              Enter at least 3 characters to search by name or username.
            </ThemedText>
          </ThemedView>
        );
      }

      return (
        <ThemedView type="backgroundElement" style={styles.emptyState}>
          <ThemedText type="smallBold">No people match that search yet.</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
            Try a different name or username.
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <ThemedView type="backgroundElement" style={styles.emptyState}>
        <ThemedText type="smallBold">No explore items match that search yet.</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
          Try clearing your search or switching to a different source filter.
        </ThemedText>
      </ThemedView>
    );
  }

  function renderFeaturedStatus() {
    if (selectedMode !== 'featured' || listItems.length > 0) {
      return null;
    }

    if (isFeaturedLoading) {
      return (
        <ThemedView type="backgroundElement" style={styles.statusCard}>
          <ActivityIndicator />
          <View style={styles.statusCopy}>
            <ThemedText type="smallBold">Loading featured posts...</ThemedText>
            <ThemedText themeColor="textSecondary">
              Pulling the latest posts from verified sources.
            </ThemedText>
          </View>
        </ThemedView>
      );
    }

    if (featuredErrorMessage) {
      return (
        <ThemedView type="backgroundElement" style={styles.emptyState}>
          <ThemedText type="smallBold">Could not load featured posts</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.emptyCopy}>
            {featuredErrorMessage}
          </ThemedText>
        </ThemedView>
      );
    }

    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={listItems}
          keyExtractor={(item) =>
            item.type === 'featured' ? `${item.item.PK}-${item.item.SK}` : item.user.userId
          }
          renderItem={({ item }) =>
            item.type === 'featured' ? (
              <ExploreCard item={item.item} />
            ) : (
              <UserSearchCard user={item.user} onPress={() => handleUserPress(item.user)} />
            )
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <ScreenHeader
                eyebrow="Blueprnt"
                title="Explore"
                subtitle={headerSubtitle}
                alignTrailingToTop={showEyebrowTrailingContent}
                overlayTrailingContent={showEyebrowTrailingContent}
                fullWidthSubtitle={showEyebrowTrailingContent}
                trailingContent={
                  <View style={styles.headerActions}>
                    {showCreateFeaturedButton ? (
                      <Pressable
                        onPress={handleCreateFeaturedPostPress}
                        style={({ pressed }) => [
                          styles.createFeaturedButton,
                          {
                            backgroundColor: theme.backgroundElement,
                            borderColor: theme.backgroundSelected,
                          },
                          pressed ? styles.pressed : null,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Create featured post">
                        <FontAwesome name="plus" size={12} color={theme.accent} />
                        <ThemedText type="smallBold" style={{ color: theme.accent }}>
                          Create
                        </ThemedText>
                      </Pressable>
                    ) : null}
                    <ThemedText type="small" themeColor="textSecondary">
                      {headerCountLabel}
                    </ThemedText>
                  </View>
                }
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsRow}
                contentContainerStyle={styles.chipsContent}>
                {EXPLORE_MODES.map((mode) => (
                  <FilterChip
                    key={mode.value}
                    label={mode.label}
                    selected={selectedMode === mode.value}
                    onPress={() => setSelectedMode(mode.value)}
                  />
                ))}
              </ScrollView>

              <SearchBar
                value={activeSearchQuery}
                onChangeText={handleSearchChange}
                placeholder={searchPlaceholder}
              />

              {selectedMode === 'featured' ? (
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
              ) : null}

              <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">{sectionTitle}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {sectionDetail}
                </ThemedText>
              </View>

              {renderFeaturedStatus()}
            </View>
          }
          ListEmptyComponent={
            selectedMode === 'featured' && (isFeaturedLoading || featuredErrorMessage)
              ? null
              : renderEmptyState
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
  headerActions: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  createFeaturedButton: {
    minHeight: 34,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
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
  statusCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCopy: {
    flex: 1,
    gap: Spacing.one,
  },
});
