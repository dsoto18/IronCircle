import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { FilterChip } from '@/components/filter-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Plan, PlanDifficulty, PlanGoal, PlanType } from '@/types';

type PlanCardProps = {
  plan: Plan;
};

const GOAL_LABELS: Record<PlanGoal, string> = {
  'marathon-training': 'Marathon',
  'muscle-building': 'Muscle',
  'strength-training': 'Strength',
  'weight-loss': 'Weight Loss',
  'flexibility-mindfulness': 'Mobility',
  'hiit': 'HIIT',
  'general-fitness': 'General Fitness',
};

const DIFFICULTY_LABELS: Record<PlanDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TYPE_LABELS: Record<PlanType, string> = {
  workout: 'Workout',
  meal: 'Meal',
  hybrid: 'Hybrid',
};

function getTypeAccent(type: PlanType) {
  switch (type) {
    case 'workout':
      return { backgroundColor: '#DBEAFE', textColor: '#1D4ED8' };
    case 'meal':
      return { backgroundColor: '#DCFCE7', textColor: '#15803D' };
    case 'hybrid':
      return { backgroundColor: '#FDE68A', textColor: '#92400E' };
    default:
      return { backgroundColor: '#E5E7EB', textColor: '#4B5563' };
  }
}

export function PlanCard({ plan }: PlanCardProps) {
  const theme = useTheme();
  const accent = getTypeAccent(plan.type);

  return (
    <Pressable style={({ pressed }) => [pressed ? styles.pressed : null]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <View style={[styles.typePill, { backgroundColor: accent.backgroundColor }]}>
              <ThemedText type="smallBold" style={{ color: accent.textColor }}>
                {TYPE_LABELS[plan.type]}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {GOAL_LABELS[plan.goal]}
            </ThemedText>
          </View>

          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color="#EAB308" />
            <ThemedText type="smallBold">{plan.rating.toFixed(1)}</ThemedText>
          </View>
        </View>

        <View style={styles.body}>
          <ThemedText type="smallBold" style={styles.creator}>
            {plan.creatorName}
          </ThemedText>
          <ThemedText style={styles.title}>{plan.title}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.summary}>
            {plan.summary}
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <FontAwesome name="calendar-o" size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {plan.durationWeeks} weeks
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <FontAwesome name="signal" size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {DIFFICULTY_LABELS[plan.difficulty]}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <FontAwesome name="users" size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {plan.enrollmentCount} joined
            </ThemedText>
          </View>
        </View>

        {plan.tags?.length ? (
          <View style={styles.tagsRow}>
            {plan.tags.slice(0, 3).map((tag) => (
              <FilterChip key={tag} label={tag} />
            ))}
          </View>
        ) : null}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerCopy: {
    flex: 1,
    gap: Spacing.two,
  },
  typePill: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  body: {
    gap: Spacing.one,
  },
  creator: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 700,
  },
  summary: {
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
