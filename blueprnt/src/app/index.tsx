import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/post-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockFeedPosts } from '@/mocks/feed-posts';
import { getFeed } from '@/services/feed';
import { likePost, unlikePost } from '@/services/likes';
import type { FeedPost } from '@/types';

const TEST_USER_ID = '56ae422b-0adb-4418-a756-4f6c83c029bb'; // change with local data
// const TEST_USER_ID = `f5f4be11-4e97-4148-95d2-703274937972` // prod example

export default function HomeScreen() {
  const theme = useTheme();
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [likeLoadingPostIds, setLikeLoadingPostIds] = useState<string[]>([]);

  async function handleToggleLike(item: FeedPost) {
    const { post, isLiked } = item;
    const postId = post.postId;

    if (likeLoadingPostIds.includes(postId)) {
      return;
    }

    setLikeLoadingPostIds((current) => [...current, postId]);

    try {
      const payload = {
        userId: TEST_USER_ID,
        author: post.userId,
        createdAt: post.createdAt,
      };

      if (isLiked) {
        await unlikePost(postId, payload);
      } else {
        await likePost(postId, payload);
      }

      setFeedPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          currentPost.post.postId === postId
            ? {
                ...currentPost,
                isLiked: !isLiked,
                likeCount: isLiked
                  ? (currentPost.likeCount ?? 0) - 1
                  : (currentPost.likeCount ?? 0) + 1,
              }
            : currentPost
        )
      );
    } catch (error) {
      console.error(`Failed to ${isLiked ? 'remove like from' : 'like'} post`, error);
    } finally {
      setLikeLoadingPostIds((current) => current.filter((id) => id !== postId));
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadFeed() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await getFeed(TEST_USER_ID);

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
            <ThemedText type="small" style={{ color: theme.accent }}>
              Blueprnt
            </ThemedText>
            <ThemedText type="subtitle">Checkout Your Circle&apos;s Activity</ThemedText>
          </View>
        </View>
          <ThemedText type="small" themeColor="textSecondary">
            {feedPosts.length} posts
          </ThemedText>

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
          renderItem={({ item }) => (
            <PostCard
              item={item}
              isLikeLoading={likeLoadingPostIds.includes(item.post.postId)}
              onToggleLike={handleToggleLike}
            />
          )}
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
