import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { STORAGE_KEYS } from '../data/HigherSelf_StorageKeys';

type MoodOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'amazing', label: 'Amazing', icon: 'happy-outline', accent: '#F59E0B' },
  { id: 'good', label: 'Good', icon: 'sunny-outline', accent: '#38BDF8' },
  { id: 'calm', label: 'Calm', icon: 'leaf-outline', accent: '#34D399' },
  { id: 'tired', label: 'Tired', icon: 'moon-outline', accent: '#A78BFA' },
  { id: 'sad', label: 'Sad', icon: 'rainy-outline', accent: '#60A5FA' },
  { id: 'stressed', label: 'Stressed', icon: 'thunderstorm-outline', accent: '#F87171' },
];

const getTodayKey = () => new Date().toISOString().slice(0, 10);
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

export default function MoodScreen() {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [moodsByDate, setMoodsByDate] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayMood = async () => {
      try {
        const storedMoods = await AsyncStorage.getItem(
          STORAGE_KEYS.DAILY_MOOD_SELECTIONS
        );

        if (!storedMoods) {
          return;
        }

        const parsedMoods = JSON.parse(storedMoods) as Record<string, string>;
        setMoodsByDate(parsedMoods);
        const todayMood = parsedMoods[getTodayKey()];

        if (todayMood) {
          setSelectedMoodId(todayMood);
        }
      } catch (error) {
        console.error('Failed to load today mood:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayMood();
  }, []);

  const handleSelectMood = async (moodId: string) => {
    if (selectedMoodId) {
      return;
    }

    try {
      const storedMoods = await AsyncStorage.getItem(
        STORAGE_KEYS.DAILY_MOOD_SELECTIONS
      );
      const parsedMoods = storedMoods
        ? (JSON.parse(storedMoods) as Record<string, string>)
        : {};

      parsedMoods[getTodayKey()] = moodId;

      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_MOOD_SELECTIONS,
        JSON.stringify(parsedMoods)
      );

      setMoodsByDate(parsedMoods);
      setSelectedMoodId(moodId);
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const selectedMood = MOOD_OPTIONS.find((mood) => mood.id === selectedMoodId);
  const isLocked = Boolean(selectedMoodId);
  const { monthLabel, cells } = getCurrentMonthDates();

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Mood</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={22} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.prompt}>How is your mood today?</Text>
          <Text style={styles.helperText}>
            Pick one feeling for today. Once selected, it locks until tomorrow.
          </Text>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#F5F7FA" />
            </View>
          ) : !isLocked ? (
            <>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = mood.id === selectedMoodId;

                  return (
                    <Pressable
                      key={mood.id}
                      accessibilityRole="button"
                      disabled={isLocked}
                      onPress={() => handleSelectMood(mood.id)}
                      style={[
                        styles.moodCard,
                        isSelected && [
                          styles.moodCardSelected,
                          { borderColor: mood.accent, backgroundColor: `${mood.accent}22` },
                        ],
                        isLocked && !isSelected && styles.moodCardDisabled,
                      ]}
                    >
                      <View
                        style={[
                          styles.iconWrap,
                          { backgroundColor: `${mood.accent}26` },
                          isSelected && { backgroundColor: mood.accent },
                        ]}
                      >
                        <Ionicons
                          color={isSelected ? '#0F172A' : mood.accent}
                          name={mood.icon}
                          size={28}
                        />
                      </View>

                      <Text
                        style={[
                          styles.moodLabel,
                          isSelected && styles.moodLabelSelected,
                        ]}
                      >
                        {mood.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <ScrollView
              contentContainerStyle={styles.historyContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.todayMoodCard}>
                <Text style={styles.sectionLabel}>Today&apos;s mood</Text>

                <View style={styles.todayMoodRow}>
                  <View
                    style={[
                      styles.todayMoodIcon,
                      { backgroundColor: `${selectedMood?.accent ?? '#9CA3AF'}26` },
                    ]}
                  >
                    <Ionicons
                      color={selectedMood?.accent ?? '#9CA3AF'}
                      name={selectedMood?.icon ?? 'help-circle-outline'}
                      size={34}
                    />
                  </View>

                  <View style={styles.todayMoodTextWrap}>
                    <Text style={styles.todayMoodLabel}>{selectedMood?.label}</Text>
                    <Text style={styles.todayMoodDescription}>
                      Saved for {new Date().toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </View>

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
                    const mood = MOOD_OPTIONS.find((option) => option.id === moodId);
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
                          style={[
                            styles.dayNumber,
                            isToday && styles.todayDayNumber,
                          ]}
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
                              <Ionicons
                                color={mood.accent}
                                name={mood.icon}
                                size={16}
                              />
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
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    minHeight: '55%',
    height: '90%',
    maxHeight: '90%',
    backgroundColor: '#121826',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#9CA3AF',
    opacity: 0.55,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
  prompt: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  helperText: {
    color: '#C6CDD8',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 28,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  moodCard: {
    width: '47%',
    minHeight: 138,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCardSelected: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  moodCardDisabled: {
    opacity: 0.48,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  moodLabel: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
  },
  moodLabelSelected: {
    color: '#FFFFFF',
  },
  historyContent: {
    paddingBottom: 24,
    gap: 18,
  },
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
