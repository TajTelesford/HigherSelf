import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type StreakDay = {
  label: string;
  state?: 'done' | 'missed' | 'upcoming';
};

type UserStreakProps = {
  streakCount?: number;
  days?: StreakDay[];
  onSharePress?: () => void;
  onMorePress?: () => void;
};

const DEFAULT_DAYS: StreakDay[] = [
  { label: 'Sa', state: 'done' },
  { label: 'Su', state: 'missed' },
  { label: 'Mo', state: 'missed' },
  { label: 'Tu', state: 'missed' },
  { label: 'We', state: 'done' },
  { label: 'Th', state: 'upcoming' },
  { label: 'Fr', state: 'upcoming' },
];

function ActionIcon({
  name,
  onPress,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.actionIcon, pressed && styles.actionIconPressed]}
    >
      <Ionicons name={name} size={23} color="#F6EEEA" />
    </Pressable>
  );
}

function DayStatus({ day }: { day: StreakDay }) {
  const isDone = day.state === 'done';
  const isMissed = day.state === 'missed';

  return (
    <View style={styles.dayItem}>
      <Text style={styles.dayLabel}>{day.label}</Text>

      <View
        style={[
          styles.dayBubble,
          isDone && styles.dayBubbleDone,
          isMissed && styles.dayBubbleMissed,
        ]}
      >
        {isDone ? (
          <Ionicons name="checkmark" size={19} color="#FFF8FB" />
        ) : isMissed ? (
          <Ionicons name="snow-outline" size={16} color="rgba(255, 241, 237, 0.45)" />
        ) : null}
      </View>
    </View>
  );
}

export default function UserStreak({
  streakCount = 2,
  days = DEFAULT_DAYS,
  onSharePress,
  onMorePress,
}: UserStreakProps) {
  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.leftColumn}>
          <View style={styles.ring}>
            <Text style={styles.ringValue}>{streakCount}</Text>
          </View>

          <Ionicons name="sparkles" size={19} color="#F4DED8" style={styles.sparkle} />
        </View>

        <View style={styles.mainColumn}>
          <View style={styles.topRow}>
            <Text style={styles.title}>Your streak</Text>

            <View style={styles.actions}>
              <ActionIcon name="share-outline" onPress={onSharePress} />
              <ActionIcon name="ellipsis-vertical" onPress={onMorePress} />
            </View>
          </View>

          <View style={styles.daysRow}>
            {days.map((day) => (
              <DayStatus key={day.label} day={day} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    backgroundColor: 'rgba(18, 24, 38, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 14,
    paddingTop: 16,
    paddingBottom: 18,
  },
  leftColumn: {
    width: 74,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingTop: 16,
  },
  ring: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  ringValue: {
    color: '#F5F7FA',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
  },
  sparkle: {
    position: 'absolute',
    bottom: 4,
    right: 3,
  },
  mainColumn: {
    flex: 1,
    paddingLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
    marginRight: -4,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    minWidth: 34,
  },
  dayLabel: {
    color: 'rgba(245, 247, 250, 0.82)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  dayBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleDone: {
    backgroundColor: 'rgba(216, 157, 185, 0.92)',
  },
  dayBubbleMissed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
