import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Button, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logout } from '@/auth/authService';

import { PostCard } from '@/components/post-card';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockFeedPosts } from '@/mocks/feed-posts';
import { getFeed } from '@/services/feed';
import { likePost, unlikePost } from '@/services/likes';
import type { FeedPost } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
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

  function handleCreatePostPress() {
    router.push('/create-post');
  }

  function handleProfilePress() {
    router.push('/profile');
  }

  function handleAuthorPress(item: FeedPost) {
    router.push({
      pathname: '/profile/[userId]',
      params: { userId: item.author.userId },
    });
  }

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadFeed() {
        try {
          setIsLoading(true);
          setErrorMessage(null);

          const data = await getFeed();

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
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          eyebrow="Blueprnt"
          title="Checkout Your Circle&apos;s Activity"
          alignTrailingToTop
          trailingContent={
            <View style={styles.headerActions}>
              <View style={styles.headerTopRow}>
                <Button
                  title="Sign out"
                  onPress={async () => {
                    await logout();
                    router.replace('/auth/login');
                  }}
                />
                <Pressable
                  onPress={handleProfilePress}
                  style={({ pressed }) => [
                    styles.profileButton,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.backgroundSelected,
                    },
                    pressed ? styles.pressed : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="View your profile">
                  <FontAwesome name="user-circle-o" size={18} color={theme.text} />
                </Pressable>
              </View>
              <View style={styles.headerLowerActions}>
                <Pressable
                  onPress={handleCreatePostPress}
                  style={({ pressed }) => [
                    styles.createPostButton,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.backgroundSelected,
                    },
                    pressed ? styles.pressed : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Create post">
                  <FontAwesome name="plus" size={12} color={theme.accent} />
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    Create
                  </ThemedText>
                </Pressable>
                <ThemedText type="small" themeColor="textSecondary">
                  {feedPosts.length} posts
                </ThemedText>
              </View>
            </View>
          }
        />

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
              onAuthorPress={handleAuthorPress}
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
  feedContent: {
    paddingVertical: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: -Spacing.two,
  },
  headerLowerActions: {
    alignItems: 'flex-end',
    gap: Spacing.one,
    marginTop: Spacing.five + Spacing.two,
  },
  createPostButton: {
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
  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  stateContainer: {
    paddingBottom: Spacing.two,
  },
});
