import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, selected = false, onPress }: FilterChipProps) {
  const theme = useTheme();
  const isInteractive = Boolean(onPress);

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.text : theme.backgroundElement,
          borderColor: selected ? theme.text : theme.backgroundSelected,
        },
        pressed && isInteractive ? styles.pressed : null,
      ]}>
      <ThemedText
        type="smallBold"
        style={{ color: selected ? theme.background : theme.textSecondary }}>
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
