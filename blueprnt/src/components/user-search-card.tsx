import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { UserSearchResult } from '@/services/user';

type UserSearchCardProps = {
  user: UserSearchResult;
  onPress: () => void;
};

function getDisplayName(user: UserSearchResult) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.username;
}

function getInitials(user: UserSearchResult) {
  const source = [user.firstName, user.lastName].filter(Boolean);

  if (!source.length) {
    return user.username.slice(0, 2).toUpperCase();
  }

  return source
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function UserSearchCard({ user, onPress }: UserSearchCardProps) {
  const theme = useTheme();
  const displayName = getDisplayName(user);
  const profilePictureUrl = user.profilePictureUrl?.trim();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${displayName}'s profile`}
      style={({ pressed }) => [pressed ? styles.pressed : null]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        {profilePictureUrl ? (
          <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatar,
              styles.initialsAvatar,
              {
                backgroundColor: theme.backgroundSelected,
              },
            ]}>
            <ThemedText type="smallBold">{getInitials(user)}</ThemedText>
          </View>
        )}

        <View style={styles.identity}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {displayName}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            @{user.username}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.88,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  initialsAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
});
