import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { FilterChip } from '@/components/filter-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExploreContentType, ExploreItem, ExploreSourceType } from '@/types';

type ExploreCardProps = {
  item: ExploreItem;
};

const SOURCE_LABELS: Record<ExploreSourceType, string> = {
  influencer: 'Influencer',
  club: 'Club',
  brand: 'Brand',
};

const CONTENT_LABELS: Record<ExploreContentType, string> = {
  post: 'Post',
  announcement: 'Announcement',
  challenge: 'Challenge',
  ad: 'Sponsored',
};

function getContentAccent(contentType: ExploreContentType) {
  switch (contentType) {
    case 'post':
      return { hero: '#DBEAFE', pill: '#1D4ED8' };
    case 'announcement':
      return { hero: '#DCFCE7', pill: '#15803D' };
    case 'challenge':
      return { hero: '#FDE68A', pill: '#92400E' };
    case 'ad':
      return { hero: '#FCE7F3', pill: '#BE185D' };
    default:
      return { hero: '#E5E7EB', pill: '#4B5563' };
  }
}

export function ExploreCard({ item }: ExploreCardProps) {
  const theme = useTheme();
  const accent = getContentAccent(item.contentType);

  return (
    <Pressable style={({ pressed }) => [pressed ? styles.pressed : null]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={[styles.hero, { backgroundColor: accent.hero }]}>
          <View style={styles.heroTopRow}>
            <View style={[styles.contentPill, { backgroundColor: theme.background }]}>
              <ThemedText type="smallBold" style={{ color: accent.pill }}>
                {CONTENT_LABELS[item.contentType]}
              </ThemedText>
            </View>

            {item.metadataLabel ? (
              <ThemedText type="smallBold" style={{ color: accent.pill }}>
                {item.metadataLabel}
              </ThemedText>
            ) : null}
          </View>

          <ThemedText style={styles.heroTitle}>{item.title}</ThemedText>
        </View>

        <View style={styles.body}>
          <View style={styles.sourceRow}>
            <View style={styles.sourceIdentity}>
              <ThemedText type="smallBold">{item.sourceName}</ThemedText>
              {item.isVerified ? (
                <FontAwesome name="check-circle" size={14} color={theme.accent} />
              ) : null}
            </View>

            <ThemedText type="small" themeColor="textSecondary">
              {SOURCE_LABELS[item.sourceType]}
            </ThemedText>
          </View>

          <ThemedText themeColor="textSecondary" style={styles.summary}>
            {item.summary}
          </ThemedText>

          <View style={styles.footer}>
            {item.tags?.length ? (
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 2).map((tag) => (
                  <FilterChip key={tag} label={tag} variant="accent" />
                ))}
              </View>
            ) : null}

            {item.ctaLabel ? (
              <View style={styles.ctaRow}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {item.ctaLabel}
                </ThemedText>
                <FontAwesome name="arrow-right" size={12} color={theme.accent} />
              </View>
            ) : null}
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.88,
  },
  hero: {
    padding: Spacing.three,
    gap: Spacing.three,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  contentPill: {
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sourceIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  summary: {
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    flex: 1,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
