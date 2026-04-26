import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/filter-chip';
import { PlanBuilderShell } from '@/components/plan-builder-shell';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getUserPlans } from '@/services/plans';
import type { UserPlan } from '@/types';

const TEST_USER_ID = 'ddffe73e-73b8-4bf0-8b3d-ac86a7583ce2';
type BuilderView = 'builder' | 'dashboard';

export default function PlanBuilderScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedView, setSelectedView] = useState<BuilderView>('builder');
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [isUserPlansLoading, setIsUserPlansLoading] = useState(false);
  const [userPlansError, setUserPlansError] = useState<string | null>(null);

  function handleBackToPlans() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/plans');
  }

  useEffect(() => {
    if (selectedView !== 'dashboard') {
      return;
    }

    let isActive = true;

    async function loadUserPlans() {
      try {
        setIsUserPlansLoading(true);
        setUserPlansError(null);

        const nextPlans = await getUserPlans(TEST_USER_ID);

        if (!isActive) {
          return;
        }

        setUserPlans(nextPlans);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setUserPlansError(
          error instanceof Error ? error.message : 'Unable to load your plans right now.'
        );
      } finally {
        if (isActive) {
          setIsUserPlansLoading(false);
        }
      }
    }

    loadUserPlans();

    return () => {
      isActive = false;
    };
  }, [selectedView]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <ScreenHeader
            eyebrow="Blueprnt"
            title="Build a plan"
            subtitle="Create a draft plan with nested weeks, days, blocks, and items on a dedicated builder page."
            trailingContent={
              <Pressable
                onPress={handleBackToPlans}
                style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  Back to Plans
                </ThemedText>
              </Pressable>
            }
          />

          <View style={styles.viewTabs}>
            <FilterChip
              label="Builder"
              selected={selectedView === 'builder'}
              onPress={() => setSelectedView('builder')}
            />
            <FilterChip
              label="My Plans"
              selected={selectedView === 'dashboard'}
              onPress={() => setSelectedView('dashboard')}
            />
          </View>

          {selectedView === 'builder' ? (
            <PlanBuilderShell
              userId={TEST_USER_ID}
              onPlanPublished={() => router.replace('/plans')}
            />
          ) : (
            <ThemedView type="backgroundElement" style={styles.dashboardCard}>
              <View style={styles.dashboardHeader}>
                <ThemedText type="smallBold">Your Plans</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Draft and published plans
                </ThemedText>
              </View>

              {isUserPlansLoading ? (
                <View style={styles.statusRow}>
                  <ActivityIndicator />
                  <ThemedText themeColor="textSecondary">Loading your plans...</ThemedText>
                </View>
              ) : null}

              {userPlansError ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {userPlansError}
                </ThemedText>
              ) : null}

              {!isUserPlansLoading && !userPlansError && userPlans.length === 0 ? (
                <ThemedText themeColor="textSecondary">
                  No plans yet. Create your first draft in the builder tab.
                </ThemedText>
              ) : null}

              {!isUserPlansLoading && !userPlansError && userPlans.length > 0 ? (
                <View style={styles.planList}>
                  {userPlans.map((plan) => (
                    <ThemedView
                      key={`${plan.planId}-${plan.createdAt}`}
                      type="background"
                      style={styles.planRow}>
                      <ThemedText type="smallBold">{plan.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {plan.status}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </View>
              ) : null}
            </ThemedView>
          )}
        </ScrollView>
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
  viewTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  backButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  dashboardCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  dashboardHeader: {
    gap: Spacing.one,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  planList: {
    gap: Spacing.two,
  },
  planRow: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.8,
  },
});
