import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'accent';
};

export function FilterChip({
  label,
  selected = false,
  onPress,
  variant = 'default',
}: FilterChipProps) {
  const theme = useTheme();
  const isInteractive = Boolean(onPress);
  const isAccentVariant = variant === 'accent';

  const backgroundColor = selected
    ? theme.text
    : isAccentVariant
      ? `${theme.accent}1A`
      : theme.backgroundElement;
  const borderColor = selected
    ? theme.text
    : isAccentVariant
      ? `${theme.accent}33`
      : theme.backgroundSelected;
  const textColor = selected
    ? theme.background
    : isAccentVariant
      ? theme.accent
      : theme.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor,
          borderColor,
        },
        pressed && isInteractive ? styles.pressed : null,
      ]}>
      <ThemedText type="smallBold" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
