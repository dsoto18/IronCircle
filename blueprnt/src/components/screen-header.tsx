import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, ThemeColor } from '@/constants/theme';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  eyebrowColor?: ThemeColor;
  trailingContent?: React.ReactNode;
  alignTrailingToTop?: boolean;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  eyebrowColor = 'accent',
  trailingContent,
  alignTrailingToTop = false,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.container, alignTrailingToTop ? styles.containerTopAligned : null]}>
      <View style={styles.copy}>
        {eyebrow ? (
          <ThemedText type="small" themeColor={eyebrowColor}>
            {eyebrow}
          </ThemedText>
        ) : null}
        <ThemedText type="subtitle">{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      {trailingContent ? (
        <View style={[styles.trailing, alignTrailingToTop ? styles.trailingTopAligned : null]}>
          {trailingContent}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  containerTopAligned: {
    alignItems: 'flex-start',
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
  subtitle: {
    maxWidth: 520,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  trailingTopAligned: {
    justifyContent: 'flex-start',
  },
});
