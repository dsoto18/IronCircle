import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { User } from '@/types';

type ProfileScreenProps = {
  user: User;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  isFollowLoading?: boolean;
  followerCount?: number;
  followingCount?: number;
  statusMessage?: string | null;
  onBackPress?: () => void;
  onEditPress?: () => void;
  onFollowPress?: () => void;
};

type ProfileStateScreenProps = {
  message: string;
  detail?: string;
  isLoading?: boolean;
  onBackPress?: () => void;
};

function getInitials(user: User) {
  const firstInitial = user.firstName.trim().charAt(0);
  const lastInitial = user.lastName.trim().charAt(0);
  const initials = `${firstInitial}${lastInitial}`.trim();

  return initials ? initials.toUpperCase() : user.username.charAt(0).toUpperCase();
}

function ProfileTopBar({
  onBackPress,
  onEditPress,
}: {
  onBackPress?: () => void;
  onEditPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.topBar}>
      {onBackPress ? (
        <Pressable
          onPress={onBackPress}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundSelected,
            },
            pressed ? styles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <FontAwesome name="chevron-left" size={16} color={theme.text} />
        </Pressable>
      ) : (
        <View style={styles.iconButtonPlaceholder} />
      )}

      <ThemedText type="smallBold" themeColor="textSecondary">
        Profile
      </ThemedText>

      {onEditPress ? (
        <Pressable
          onPress={onEditPress}
          style={({ pressed }) => [
            styles.editButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundSelected,
            },
            pressed ? styles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Edit profile">
          <FontAwesome name="pencil" size={14} color={theme.accent} />
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Edit
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.iconButtonPlaceholder} />
      )}
    </View>
  );
}

export function ProfileStateScreen({
  message,
  detail,
  isLoading = false,
  onBackPress,
}: ProfileStateScreenProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ProfileTopBar onBackPress={onBackPress} />

          <ThemedView type="backgroundElement" style={styles.stateCard}>
            {isLoading ? <ActivityIndicator color={theme.accent} /> : null}
            <ThemedText type="smallBold">{message}</ThemedText>
            {detail ? (
              <ThemedText style={styles.stateDetail} themeColor="textSecondary">
                {detail}
              </ThemedText>
            ) : null}
          </ThemedView>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

export function ProfileScreen({
  user,
  isOwnProfile = false,
  isFollowing = false,
  isFollowLoading = false,
  followerCount,
  followingCount,
  statusMessage,
  onBackPress,
  onEditPress,
  onFollowPress,
}: ProfileScreenProps) {
  const theme = useTheme();
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const followButtonLabel = isFollowLoading
    ? 'Working...'
    : isFollowing
      ? 'Following'
      : 'Follow';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileTopBar onBackPress={onBackPress} onEditPress={onEditPress} />

          <ThemedView type="backgroundElement" style={styles.profileCard}>
            <View style={styles.heroRow}>
              {user.profilePictureUrl ? (
                <Image source={user.profilePictureUrl} style={styles.avatar} contentFit="cover" />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarFallback,
                    { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <ThemedText type="subtitle">{getInitials(user)}</ThemedText>
                </View>
              )}

              <View style={styles.identity}>
                <View style={styles.nameRow}>
                  <ThemedText
                    type="subtitle"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}>
                    {fullName || user.username}
                  </ThemedText>
                  {user.isVerified ? (
                    <FontAwesome name="check-circle" size={18} color="#2F80ED" />
                  ) : null}
                </View>

                <ThemedText type="smallBold" themeColor="textSecondary">
                  @{user.username}
                </ThemedText>
              </View>
            </View>

            {user.bio ? (
              <ThemedText style={styles.bio} themeColor="textSecondary">
                {user.bio}
              </ThemedText>
            ) : (
              <ThemedText style={styles.bio} themeColor="textSecondary">
                No bio yet.
              </ThemedText>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText type="smallBold">{followerCount ?? '-'}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Followers
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="smallBold">{followingCount ?? '-'}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Following
                </ThemedText>
              </View>
            </View>

            {!isOwnProfile && onFollowPress ? (
              <Pressable
                onPress={onFollowPress}
                disabled={isFollowLoading}
                style={({ pressed }) => [
                  styles.followButton,
                  {
                    backgroundColor: isFollowing ? theme.backgroundSelected : theme.accent,
                    borderColor: isFollowing ? theme.backgroundSelected : theme.accent,
                  },
                  pressed ? styles.pressed : null,
                  isFollowLoading ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={isFollowing ? `Unfollow ${user.username}` : `Follow ${user.username}`}>
                <FontAwesome
                  name={isFollowing ? 'check' : 'plus'}
                  size={14}
                  color={isFollowing ? theme.text : '#FFFFFF'}
                />
                <ThemedText
                  type="smallBold"
                  style={{ color: isFollowing ? theme.text : '#FFFFFF' }}>
                  {followButtonLabel}
                </ThemedText>
              </Pressable>
            ) : null}

            {statusMessage ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.statusMessage}>
                {statusMessage}
              </ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <FontAwesome name="user" size={16} color={theme.textSecondary} />
              <View style={styles.detailText}>
                <ThemedText type="small" themeColor="textSecondary">
                  Name
                </ThemedText>
                <ThemedText>{fullName || 'Not set'}</ThemedText>
              </View>
            </View>

            <View style={styles.detailRow}>
              <FontAwesome name="at" size={16} color={theme.textSecondary} />
              <View style={styles.detailText}>
                <ThemedText type="small" themeColor="textSecondary">
                  Username
                </ThemedText>
                <ThemedText>@{user.username}</ThemedText>
              </View>
            </View>

            <View style={styles.detailRow}>
              <FontAwesome name="envelope-o" size={16} color={theme.textSecondary} />
              <View style={styles.detailText}>
                <ThemedText type="small" themeColor="textSecondary">
                  Email
                </ThemedText>
                <ThemedText>{user.email}</ThemedText>
              </View>
            </View>
          </ThemedView>
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
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  topBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  editButton: {
    minHeight: 36,
    borderRadius: Spacing.five,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  profileCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flex: 1,
    gap: Spacing.one,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  bio: {
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statItem: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    backgroundColor: 'rgba(47, 128, 237, 0.08)',
    gap: Spacing.half,
  },
  followButton: {
    minHeight: 44,
    borderRadius: Spacing.five,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  detailsCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  detailText: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.55,
  },
  stateCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  stateDetail: {
    textAlign: 'center',
    lineHeight: 22,
  },
  statusMessage: {
    textAlign: 'center',
  },
});
