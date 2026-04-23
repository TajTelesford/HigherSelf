import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { MoodOption } from './MoodPicker';

type TodaysMoodProps = {
  mood?: MoodOption;
};

export function TodaysMood({ mood }: TodaysMoodProps) {
  return (
    <View style={styles.todayMoodCard}>
      <Text style={styles.sectionLabel}>Today&apos;s mood</Text>

      <View style={styles.todayMoodRow}>
        <View
          style={[
            styles.todayMoodIcon,
            { backgroundColor: `${mood?.accent ?? '#9CA3AF'}26` },
          ]}
        >
          <Ionicons
            color={mood?.accent ?? '#9CA3AF'}
            name={mood?.icon ?? 'help-circle-outline'}
            size={34}
          />
        </View>

        <View style={styles.todayMoodTextWrap}>
          <Text style={styles.todayMoodLabel}>{mood?.label ?? 'Unknown'}</Text>
          <Text style={styles.todayMoodDescription}>
            Saved for{' '}
            {new Date().toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  todayMoodCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionLabel: {
    color: '#C6CDD8',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  todayMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  todayMoodIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayMoodTextWrap: {
    flex: 1,
  },
  todayMoodLabel: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  todayMoodDescription: {
    color: '#D9E1EC',
    fontSize: 15,
    lineHeight: 22,
  },
});
