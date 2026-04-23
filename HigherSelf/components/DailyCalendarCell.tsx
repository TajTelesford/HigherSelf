import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { MoodOption } from './MoodPicker';

type DailyCalendarCellProps = {
  dayNumber?: number;
  isToday?: boolean;
  mood?: MoodOption;
};

export function DailyCalendarCell({
  dayNumber,
  isToday = false,
  mood,
}: DailyCalendarCellProps) {
  const isEmpty = dayNumber === undefined;

  return (
    <View
      style={[
        styles.dayCell,
        isToday && styles.todayCell,
        mood && {
          borderColor: `${mood.accent}66`,
          backgroundColor: `${mood.accent}14`,
        },
      ]}
    >
      {!isEmpty ? (
        <>
          <Text style={[styles.dayNumber, isToday && styles.todayDayNumber]}>
            {dayNumber}
          </Text>

          {mood ? (
            <View
              style={[
                styles.calendarIconWrap,
                { backgroundColor: `${mood.accent}22` },
              ]}
            >
              <Ionicons color={mood.accent} name={mood.icon} size={16} />
            </View>
          ) : (
            <View style={styles.calendarIconSpacer} />
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dayCell: {
    width: '13.5%',
    aspectRatio: 0.8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  todayCell: {
    borderColor: '#F5F7FA',
  },
  dayNumber: {
    color: '#E5EAF1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  todayDayNumber: {
    color: '#FFFFFF',
  },
  calendarIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIconSpacer: {
    width: 26,
    height: 26,
  },
});
