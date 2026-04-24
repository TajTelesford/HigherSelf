import { MoodCalendar } from '@/components/MoodCalendar';
import { MoodPicker, type MoodOption } from '@/components/MoodPicker';
import { TodaysMood } from '@/components/TodaysMood';
import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import {
  MOOD_PICKER_START_HOUR,
  canSelectMoodForCurrentDate,
  getLocalDateKey,
  pruneFutureMoodEntries,
} from '@/lib/mood-date';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'amazing', label: 'Amazing', icon: 'happy-outline', accent: '#F59E0B' },
  { id: 'good', label: 'Good', icon: 'sunny-outline', accent: '#38BDF8' },
  { id: 'calm', label: 'Calm', icon: 'leaf-outline', accent: '#34D399' },
  { id: 'tired', label: 'Tired', icon: 'moon-outline', accent: '#A78BFA' },
  { id: 'sad', label: 'Sad', icon: 'rainy-outline', accent: '#60A5FA' },
  { id: 'stressed', label: 'Stressed', icon: 'thunderstorm-outline', accent: '#F87171' },
];

export default function MoodScreen() {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [moodsByDate, setMoodsByDate] = useState<Record<string, string>>({});
  const [isEditingMood, setIsEditingMood] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayMood = async () => {
      try {
        const todayKey = getLocalDateKey();
        const storedMoods = await AsyncStorage.getItem(
          STORAGE_KEYS.DAILY_MOOD_SELECTIONS
        );

        if (!storedMoods) {
          return;
        }

        const parsedMoods = JSON.parse(storedMoods) as Record<string, string>;
        const sanitizedMoods = pruneFutureMoodEntries(parsedMoods, todayKey);
        setMoodsByDate(sanitizedMoods);
        const todayMood = sanitizedMoods[todayKey];

        if (todayMood) {
          setSelectedMoodId(todayMood);
        }

        if (JSON.stringify(sanitizedMoods) !== JSON.stringify(parsedMoods)) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.DAILY_MOOD_SELECTIONS,
            JSON.stringify(sanitizedMoods)
          );
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
    if (selectedMoodId && !isEditingMood) {
      return;
    }

    if (!canSelectMoodForCurrentDate()) {
      return;
    }

    try {
      const todayKey = getLocalDateKey();
      const storedMoods = await AsyncStorage.getItem(
        STORAGE_KEYS.DAILY_MOOD_SELECTIONS
      );
      const parsedMoods = storedMoods
        ? (JSON.parse(storedMoods) as Record<string, string>)
        : {};
      const sanitizedMoods = pruneFutureMoodEntries(parsedMoods, todayKey);

      sanitizedMoods[todayKey] = moodId;

      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_MOOD_SELECTIONS,
        JSON.stringify(sanitizedMoods)
      );

      setMoodsByDate(sanitizedMoods);
      setSelectedMoodId(moodId);
      setIsEditingMood(false);
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const selectedMood = MOOD_OPTIONS.find((mood) => mood.id === selectedMoodId);
  const isLocked = Boolean(selectedMoodId);
  const canPickMoodToday = canSelectMoodForCurrentDate();
  const shouldShowPicker = canPickMoodToday && (!isLocked || isEditingMood);

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
          {shouldShowPicker ? (
            <Text style={styles.prompt}>How is your mood today?</Text>
          ) : null}

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#F5F7FA" />
            </View>
          ) : shouldShowPicker ? (
            <>
              <MoodPicker
                isLocked={false}
                moods={MOOD_OPTIONS}
                onSelectMood={handleSelectMood}
                selectedMoodId={selectedMoodId}
              />
            </>
          ) : (
            <ScrollView
              contentContainerStyle={styles.historyContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedMood ? (
                <TodaysMood
                  mood={selectedMood}
                  onConfirmUpdate={() => setIsEditingMood(true)}
                />
              ) : !canPickMoodToday ? (
                <View style={styles.noticeCard}>
                  <Text style={styles.noticeTitle}>Mood check-in opens at 6:00 AM</Text>
                  <Text style={styles.noticeText}>
                    You can log your mood after {MOOD_PICKER_START_HOUR}:00 AM on your
                    current local date.
                  </Text>
                </View>
              ) : null}
              <MoodCalendar moodOptions={MOOD_OPTIONS} moodsByDate={moodsByDate} />
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
    paddingBottom: 28,
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
  historyContent: {
    paddingBottom: 24,
    gap: 18,
  },
  noticeCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  noticeTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  noticeText: {
    color: '#D9E1EC',
    fontSize: 15,
    lineHeight: 22,
  },
});
