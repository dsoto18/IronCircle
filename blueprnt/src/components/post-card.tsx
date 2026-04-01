import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { FeedPost } from '@/types';

type PostCardProps = {
  item: FeedPost;
  isLikeLoading?: boolean;
  onToggleLike?: (item: FeedPost) => void;
};

function formatPostTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

function formatWorkoutType(type?: FeedPost['post']['type']) {
  if (!type) {
    return null;
  }

  return type
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getWorkoutTypeColors(type?: FeedPost['post']['type']) {
  switch (type?.toLowerCase()) {
    case 'lift':
      return { backgroundColor: '#DBEAFE', textColor: '#1D4ED8' };
    case 'run':
      return { backgroundColor: '#E0F2FE', textColor: '#0369A1' };
    case 'swim':
      return { backgroundColor: '#DBEAFE', textColor: '#1E40AF' };
    case 'yoga':
      return { backgroundColor: '#F3E8FF', textColor: '#7E22CE' };
    case 'hiit':
      return { backgroundColor: '#DCFCE7', textColor: '#15803D' };
    case 'cycle':
      return { backgroundColor: '#FEF3C7', textColor: '#B45309' };
    case 'walk':
      return { backgroundColor: '#CCFBF1', textColor: '#0F766E' };
    case 'mobility':
      return { backgroundColor: '#FCE7F3', textColor: '#DB2777' };
    default:
      return { backgroundColor: '#E5E7EB', textColor: '#4B5563' };
  }
}

function formatMetricValue(label: 'distance' | 'calories' | 'duration', value: number) {
  if (label === 'distance') {
    return `${value.toFixed(1)} mi`;
  }

  if (label === 'calories') {
    return `${value} cal`;
  }

  const num = Number(value);
  if(Math.floor(num / 60) > 0 && num % 60 > 0){
    return `${Math.floor(num / 60)} hr ${num % 60} min`
  }
  if(Math.floor(num / 60) > 0){
    return `${num / 60} hr`
  }
  return `${value} min`;
}

function parseMetricValue(value?: string | number) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function PostCard({ item, isLikeLoading = false, onToggleLike }: PostCardProps) {
  const theme = useTheme();
  const { author, post } = item;
  const [cardWidth, setCardWidth] = useState(0);
  const distanceValue = parseMetricValue(post.distance);
  const caloriesValue = parseMetricValue(post.calories);
  const durationValue = parseMetricValue(post.duration);

  const metrics = [
    distanceValue !== null
      ? { icon: 'road' as const, label: 'distance' as const, value: distanceValue }
      : null,
    caloriesValue !== null
      ? { icon: 'fire' as const, label: 'calories' as const, value: caloriesValue }
      : null,
    durationValue !== null
      ? { icon: 'clock-o' as const, label: 'duration' as const, value: durationValue }
      : null,
  ].filter((metric): metric is NonNullable<typeof metric> => metric !== null);

  const avatarFallback = author.username.charAt(0).toUpperCase();
  const formattedType = formatWorkoutType(post.type);
  const workoutTypeColors = getWorkoutTypeColors(post.type);

  return (
    <ThemedView
      type="backgroundElement"
      style={styles.card}
      onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        nestedScrollEnabled
        contentContainerStyle={styles.pages}>
        <View style={[styles.page, cardWidth > 0 ? { width: cardWidth } : null]}>
          <View style={styles.header}>
            <View style={styles.headerMain}>
              {author.profilePictureUrl ? (
                <Image source={author.profilePictureUrl} style={styles.avatar} contentFit="cover" />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarFallback,
                    { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <ThemedText type="smallBold">{avatarFallback}</ThemedText>
                </View>
              )}

              <View style={styles.headerText}>
                <View style={styles.authorRow}>
                  <ThemedText type="smallBold">{author.username}</ThemedText>
                  {author.isVerified ? (
                    <FontAwesome name="check-circle" size={14} color="#2F80ED" />
                  ) : null}
                </View>

                <ThemedText type="small" themeColor="textSecondary">
                  {formatPostTime(post.createdAt)}
                </ThemedText>
              </View>
            </View>

            {formattedType ? (
              <View style={[styles.typePill, { backgroundColor: workoutTypeColors.backgroundColor }]}>
                <ThemedText type="smallBold" style={{ color: workoutTypeColors.textColor }}>
                  {formattedType}
                </ThemedText>
              </View>
            ) : null}
          </View>

          {post.imageUrl ? (
            <Image source={post.imageUrl} style={styles.image} contentFit="cover" />
          ) : null}

          {post.caption ? <ThemedText style={styles.caption}>{post.caption}</ThemedText> : null}

          {metrics.length > 0 ? (
            <View style={styles.metricsRow}>
              {metrics.map((metric) => (
                <View key={metric.label} style={styles.metricPill}>
                  <FontAwesome name={metric.icon} size={14} color={theme.textSecondary} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatMetricValue(metric.label, metric.value)}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.likeButton,
                pressed ? styles.actionRowPressed : null,
                isLikeLoading ? styles.actionRowDisabled : null,
              ]}
              onPress={() => onToggleLike?.(item)}
              disabled={isLikeLoading}>
              <FontAwesome
                name={item.isLiked ? 'heart' : 'heart-o'}
                size={18}
                color={item.isLiked ? '#2F80ED' : theme.text}
              />
            </Pressable>
            <ThemedText type="smallBold">{item.likeCount}</ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.page,
            styles.detailsPage,
            cardWidth > 0 ? { width: cardWidth } : null,
          ]}>
          <ThemedText type="small" themeColor="textSecondary">
            Plan Link
          </ThemedText>
          <ThemedText type="subtitle">Linked to Plan</ThemedText>
          <ThemedText style={styles.detailsText} themeColor="textSecondary">
            This text is a placeholder. Working to eventually have Plan details if linked..
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  pages: {
    alignItems: 'stretch',
  },
  page: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  typePill: {
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 1.1,
    borderRadius: Spacing.three,
    backgroundColor: Colors.light.backgroundSelected,
  },
  caption: {
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  likeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowPressed: {
    opacity: 0.7,
  },
  actionRowDisabled: {
    opacity: 0.45,
  },
  detailsPage: {
    justifyContent: 'center',
    minHeight: 240,
  },
  detailsText: {
    lineHeight: 22,
  },
});
