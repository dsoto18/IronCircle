import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/post-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { mockFeedPosts } from '@/mocks/feed-posts';
import { client } from '@/services/client';
import type { FeedPost } from '@/types';

const TEST_USER_ID = '9a6a42cf-90aa-40e2-8582-f1369993b65d'; // change with local data

export default function HomeScreen() {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFeed() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await client.get<FeedPost[]>(`/feed/${TEST_USER_ID}`);

        if (!isMounted) {
          return;
        }

        setFeedPosts(data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load home feed', error);
        setErrorMessage('Could not load your feed. Showing mock data instead.');
        setFeedPosts(mockFeedPosts);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="small" themeColor="textSecondary">
              Home
            </ThemedText>
            <ThemedText type="subtitle">Blueprnt</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {feedPosts.length} posts
          </ThemedText>
        </View>

        {isLoading ? (
          <View style={styles.stateContainer}>
            <ThemedText themeColor="textSecondary">Loading your feed...</ThemedText>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.stateContainer}>
            <ThemedText type="small" themeColor="textSecondary">
              {errorMessage}
            </ThemedText>
          </View>
        ) : null}

        <FlatList
          data={feedPosts}
          keyExtractor={(item) => item.post.postId}
          renderItem={({ item }) => <PostCard item={item} />}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerText: {
    gap: Spacing.half,
  },
  feedContent: {
    paddingVertical: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  stateContainer: {
    paddingBottom: Spacing.two,
  },
});
