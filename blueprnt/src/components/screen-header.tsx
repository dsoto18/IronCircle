import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, ThemeColor } from '@/constants/theme';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  eyebrowColor?: ThemeColor;
  trailingContent?: React.ReactNode;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  eyebrowColor = 'accent',
  trailingContent,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
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

      {trailingContent ? <View style={styles.trailing}>{trailingContent}</View> : null}
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
});
