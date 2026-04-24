import { StyleSheet, Text, View } from 'react-native';

import { getLocalDateKey } from '@/lib/mood-date';
import { DailyCalendarCell } from './DailyCalendarCell';
import type { MoodOption } from './MoodPicker';

type MoodCalendarProps = {
  moodOptions: MoodOption[];
  moodsByDate: Record<string, string>;
};

const CALENDAR_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    const dateKey = getLocalDateKey(date);
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
            return <DailyCalendarCell key={`empty-${index}`} />;
          }

          const moodId = moodsByDate[dateKey];
          const mood = moodOptions.find((option) => option.id === moodId);
          const dayNumber = Number(dateKey.slice(-2));
          const isToday = dateKey === getLocalDateKey();

          return (
            <DailyCalendarCell
              key={dateKey}
              dayNumber={dayNumber}
              isToday={isToday}
              mood={mood}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    height: 485,
    borderRadius: 22,
    padding: 20,
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
    justifyContent: 'space-between',
    rowGap: 8,
  },
});
