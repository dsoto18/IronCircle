import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ScreenHeader
            eyebrow="Blueprnt"
            title="Explore creators and clubs"
            subtitle="Discover workouts, announcements, and featured content from coaches, brands, and communities."
          />

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search creators, clubs, or topics"
          />

          <ThemedView type="backgroundElement" style={styles.placeholderCard}>
            <ThemedText type="smallBold">Explore will be next up.</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.placeholderCopy}>
              First added the shared header and search pattern. Next I can layer in
              featured creators, club posts, and polished content cards.
            </ThemedText>
          </ThemedView>
        </View>
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
    flex: 1,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  placeholderCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  placeholderCopy: {
    lineHeight: 22,
  },
});
