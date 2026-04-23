import { useStreak } from '@/context/StreakContext';
import { colors } from '@/assets/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Switch, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatLastCheckIn(dateKey: string | null) {
  if (!dateKey) {
    return 'Not started yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`));
}

export default function StreakScreen() {
  const { lastCheckInDate, longestStreak, streakCount, trackingEnabled, toggleTracking } =
    useStreak();

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons color={colors.text.primary} name="chevron-back" size={36} />
            </Pressable>

            <Text style={styles.title}>Streak</Text>
          </View>

          <Text style={styles.description}>
            Practicing affirmations every day can significantly improve your mood.
          </Text>

          <View style={styles.preferenceCard}>
            <Text style={styles.preferenceLabel}>Track streak</Text>

            <Switch
              ios_backgroundColor="rgba(139, 124, 255, 0.35)"
              onValueChange={toggleTracking}
              thumbColor="#FFFFFF"
              trackColor={{
                false: 'rgba(139, 124, 255, 0.38)',
                true: colors.accent.gold,
              }}
              value={trackingEnabled}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{streakCount}</Text>
              <Text style={styles.statLabel}>Current streak</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Best streak</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Last check-in</Text>
            <Text style={styles.infoValue}>{formatLastCheckIn(lastCheckInDate)}</Text>
            <Text style={styles.infoHint}>
              Missing a full day resets the counter back to zero.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
  },
  panel: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 34,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(139, 124, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    color: colors.text.primary,
    fontSize: 29,
    lineHeight: 42,
    marginTop: 76,
    marginBottom: 34,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(139, 124, 255, 0.14)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.22)',
  },
  preferenceLabel: {
    color: colors.text.primary,
    fontSize: 21,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(139, 124, 255, 0.11)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.2)',
  },
  statValue: {
    color: colors.accent.gold,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 20,
  },
  infoCard: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 201, 76, 0.08)',
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(242, 201, 76, 0.22)',
  },
  infoTitle: {
    color: colors.accent.gold,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  infoHint: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 12,
  },
});
