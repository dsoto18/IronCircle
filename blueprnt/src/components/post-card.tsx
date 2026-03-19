import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { FeedPost } from '@/types';

type PostCardProps = {
  item: FeedPost;
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
  switch (type) {
    case 'lift':
      return { backgroundColor: '#DBEAFE', textColor: '#1D4ED8' };
    case 'run':
      return { backgroundColor: '#E0F2FE', textColor: '#0369A1' };
    case 'swim':
      return { backgroundColor: '#DBEAFE', textColor: '#1E40AF' };
    case 'yoga':
      return { backgroundColor: '#F3E8FF', textColor: '#7E22CE' };
    case 'hiit':
      return { backgroundColor: '#FEE2E2', textColor: '#B91C1C' };
    case 'cycle':
      return { backgroundColor: '#FEF3C7', textColor: '#B45309' };
    case 'walk':
      return { backgroundColor: '#E0F2FE', textColor: '#0F766E' };
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

  return `${value} min`;
}

export function PostCard({ item }: PostCardProps) {
  const theme = useTheme();
  const { author, post } = item;

  const metrics = [
    post.distanceMiles !== undefined
      ? { icon: 'road' as const, label: 'distance' as const, value: post.distanceMiles }
      : null,
    post.calories !== undefined
      ? { icon: 'fire' as const, label: 'calories' as const, value: post.calories }
      : null,
    post.durationMinutes !== undefined
      ? { icon: 'clock-o' as const, label: 'duration' as const, value: post.durationMinutes }
      : null,
  ].filter((metric): metric is NonNullable<typeof metric> => metric !== null);

  const avatarFallback = author.username.charAt(0).toUpperCase();
  const formattedType = formatWorkoutType(post.type);
  const workoutTypeColors = getWorkoutTypeColors(post.type);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
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

      <Pressable style={styles.actionRow}>
        <FontAwesome
          name={item.isLiked ? 'heart' : 'heart-o'}
          size={18}
          color={item.isLiked ? '#2F80ED' : theme.text}
        />
        <ThemedText type="smallBold">{item.likeCount ?? 0}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
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
});
