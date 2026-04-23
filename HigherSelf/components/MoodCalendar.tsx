import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { MoodOption } from './MoodPicker';

type MoodCalendarProps = {
  moodOptions: MoodOption[];
  moodsByDate: Record<string, string>;
};

const CALENDAR_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getCurrentMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = firstDay.getDay();

  const calendarCells: (string | null)[] = Array.from(
    { length: leadingEmptyDays },
    () => null
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = date.toISOString().slice(0, 10);
    calendarCells.push(dateKey);
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  return {
    monthLabel: now.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    }),
    cells: calendarCells,
  };
};

export function MoodCalendar({
  moodOptions,
  moodsByDate,
}: MoodCalendarProps) {
  const { monthLabel, cells } = getCurrentMonthDates();

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>Mood calendar</Text>
        <Text style={styles.calendarMonth}>{monthLabel}</Text>
      </View>

      <View style={styles.weekdayRow}>
        {CALENDAR_DAYS.map((day) => (
          <Text key={day} style={styles.weekdayLabel}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {cells.map((dateKey, index) => {
          if (!dateKey) {
            return <View key={`empty-${index}`} style={styles.emptyDayCell} />;
          }

          const moodId = moodsByDate[dateKey];
          const mood = moodOptions.find((option) => option.id === moodId);
          const dayNumber = Number(dateKey.slice(-2));
          const isToday = dateKey === getTodayKey();

          return (
            <View
              key={dateKey}
              style={[
                styles.dayCell,
                isToday && styles.todayCell,
                mood && {
                  borderColor: `${mood.accent}66`,
                  backgroundColor: `${mood.accent}14`,
                },
              ]}
            >
              <Text
                style={[styles.dayNumber, isToday && styles.todayDayNumber]}
              >
                {dayNumber}
              </Text>

              {mood ? (
                <>
                  <View
                    style={[
                      styles.calendarIconWrap,
                      { backgroundColor: `${mood.accent}22` },
                    ]}
                  >
                    <Ionicons color={mood.accent} name={mood.icon} size={16} />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.calendarMoodLabel, { color: mood.accent }]}
                  >
                    {mood.label}
                  </Text>
                </>
              ) : (
                <Text style={styles.noMoodLabel}>No mood</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  calendarHeader: {
    marginBottom: 16,
  },
  calendarTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '700',
  },
  calendarMonth: {
    color: '#AAB4C3',
    fontSize: 14,
    marginTop: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayLabel: {
    flex: 1,
    color: '#8D98A8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyDayCell: {
    width: '13.7%',
    aspectRatio: 0.8,
  },
  dayCell: {
    width: '13.7%',
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
    marginBottom: 4,
  },
  calendarMoodLabel: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  noMoodLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
});
