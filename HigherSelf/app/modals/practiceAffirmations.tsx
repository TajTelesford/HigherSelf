import CustomChooseAffirmationAlert from '@/components/CustomChooseAffirmationAlert';
import { useSavedAffirmations } from '@/context/SavedAffirmationContext';
import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import type { Affirmation } from '@/types/affirmations';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

type PracticeStep = 'queue' | 'recording';

type StoredAffirmationLike =
  | string
  | {
      id?: string | number;
      text?: string;
      affirmation?: string;
      category?: string;
    };

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const normalizeCustomAffirmations = (
  value: string | null
): Affirmation[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as StoredAffirmationLike[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item, index) => {
        if (typeof item === 'string') {
          const text = item.trim();

          if (!text) {
            return null;
          }

          return {
            id: `custom-${index}-${text}`,
            text,
            category: 'custom',
          } satisfies Affirmation;
        }

        const text = item.text?.trim() || item.affirmation?.trim();

        if (!text) {
          return null;
        }

        return {
          id: String(item.id ?? `custom-${index}-${text}`),
          text,
          category: item.category ?? 'custom',
        } satisfies Affirmation;
      })
      .filter((item): item is Affirmation => Boolean(item));
  } catch (error) {
    console.error('Failed to parse custom affirmations:', error);
    return [];
  }
};

export default function PracticeAffirmationsScreen() {
  const { loading: savedLoading } = useSavedAffirmations();
  const [deviceSavedAffirmations, setDeviceSavedAffirmations] = useState<
    Affirmation[]
  >([]);
  const [customAffirmations, setCustomAffirmations] = useState<Affirmation[]>([]);
  const [queuedAffirmations, setQueuedAffirmations] = useState<Affirmation[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [screenStep, setScreenStep] = useState<PracticeStep>('queue');
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapPracticeScreen = async () => {
      try {
        const [
          storedSavedAffirmations,
          storedCustomAffirmations,
          storedQueuedAffirmations,
          storedPromptDate,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_AFFIRMATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_AFFIRMATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_AFFIRMATION_QUEUE),
          AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_AFFIRMATION_PROMPT_DATE),
        ]);

        if (storedSavedAffirmations) {
          setDeviceSavedAffirmations(
            JSON.parse(storedSavedAffirmations) as Affirmation[]
          );
        } else {
          setDeviceSavedAffirmations([]);
        }

        setCustomAffirmations(normalizeCustomAffirmations(storedCustomAffirmations));

        if (storedQueuedAffirmations) {
          setQueuedAffirmations(JSON.parse(storedQueuedAffirmations) as Affirmation[]);
        }

        const todayKey = getTodayKey();

        if (storedPromptDate !== todayKey) {
          setShowPicker(true);
          await AsyncStorage.setItem(
            STORAGE_KEYS.PRACTICE_AFFIRMATION_PROMPT_DATE,
            todayKey
          );
        }
      } catch (error) {
        console.error('Failed to load practice affirmations:', error);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapPracticeScreen();
  }, []);

  useEffect(() => {
    if (!showPicker) {
      return;
    }

    const loadSavedAffirmationsFromDevice = async () => {
      try {
        const storedSavedAffirmations = await AsyncStorage.getItem(
          STORAGE_KEYS.SAVED_AFFIRMATIONS
        );

        if (storedSavedAffirmations) {
          setDeviceSavedAffirmations(
            JSON.parse(storedSavedAffirmations) as Affirmation[]
          );
          return;
        }

        setDeviceSavedAffirmations([]);
      } catch (error) {
        console.error('Failed to load saved affirmations from device:', error);
      }
    };

    loadSavedAffirmationsFromDevice();
  }, [showPicker]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const persistQueue = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.PRACTICE_AFFIRMATION_QUEUE,
          JSON.stringify(queuedAffirmations)
        );
      } catch (error) {
        console.error('Failed to persist queued affirmations:', error);
      }
    };

    persistQueue();
  }, [isBootstrapping, queuedAffirmations]);

  const toggleQueuedAffirmation = (affirmation: Affirmation) => {
    setQueuedAffirmations((currentQueue) => {
      if (currentQueue.some((item) => item.id === affirmation.id)) {
        return currentQueue.filter((item) => item.id !== affirmation.id);
      }

      return [...currentQueue, affirmation];
    });
  };

  const openRecordingScreen = () => {
    if (!queuedAffirmations.length) {
      return;
    }

    setShowPicker(false);
    setScreenStep('recording');
  };

  const goToRecordAffirmations = () => {
    if (!queuedAffirmations.length) {
      return;
    }

    router.push('/modals/recordAffirmations');
  };

  const isLoading = savedLoading || isBootstrapping;

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Practice Affirmations</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={22} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#F5F7FA" />
            </View>
          ) : screenStep === 'recording' ? (
            <ScrollView
              contentContainerStyle={styles.recordingContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.eyebrowPill}>
                    <View style={styles.eyebrowDot} />
                    <Text style={styles.eyebrow}>Today&apos;s Practice</Text>
                  </View>

                  <View style={styles.queueReadyBadge}>
                    <Ionicons color="#F6C453" name="sparkles" size={14} />
                    <Text style={styles.queueReadyBadgeText}>Queue Ready</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>Ready To Record</Text>
                <Text style={styles.heroCopy}>
                  Your affirmation queue is ready. Tap the mic to open the recorder
                  and capture these affirmations in your own voice.
                </Text>

                <Pressable
                  onPress={goToRecordAffirmations}
                  style={({ pressed }) => [
                    styles.microphoneBadgeOuter,
                    pressed && styles.microphoneBadgePressed,
                  ]}
                >
                  <View style={styles.microphoneBadgeMiddle}>
                    <View style={styles.microphoneBadge}>
                      <MaterialCommunityIcons
                        color="#F5F7FA"
                        name="microphone"
                        size={34}
                      />
                    </View>
                  </View>
                </Pressable>

                <View style={styles.heroActionRow}>
                  <Pressable
                    onPress={goToRecordAffirmations}
                    style={styles.heroPrimaryButton}
                  >
                    <MaterialCommunityIcons
                      color="#FFF8E7"
                      name="microphone-outline"
                      size={18}
                    />
                    <Text style={styles.heroPrimaryButtonText}>Open Recorder</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setShowPicker(true)}
                    style={styles.heroSecondaryButton}
                  >
                    <Ionicons color="#F6C453" name="create-outline" size={17} />
                    <Text style={styles.heroSecondaryButtonText}>Edit Queue</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {queuedAffirmations.length} Affirmation
                  {queuedAffirmations.length === 1 ? '' : 's'} Ready
                </Text>
                <Text style={styles.sectionCaption}>
                  Recite these in order during your session.
                </Text>
              </View>

              {queuedAffirmations.map((affirmation, index) => (
                <View key={affirmation.id} style={styles.queueCard}>
                  <View style={styles.queueIndex}>
                    <Text style={styles.queueIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.queueText}>{affirmation.text}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  color="#F5F7FA"
                  name="meditation"
                  size={34}
                />
              </View>
              <Text style={styles.emptyTitle}>Build today&apos;s affirmation queue</Text>
              <Text style={styles.emptyCopy}>
                Choose from your liked affirmations and your own affirmations, then
                move into the recording flow.
              </Text>

              <Pressable onPress={() => setShowPicker(true)} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  {queuedAffirmations.length
                    ? "Edit Today's Queue"
                    : 'Choose Affirmations'}
                </Text>
              </Pressable>

              {queuedAffirmations.length ? (
                <Pressable
                  onPress={openRecordingScreen}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    {queuedAffirmations.length} Affirmation
                    {queuedAffirmations.length === 1 ? '' : 's'} Ready
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>

        <CustomChooseAffirmationAlert
          customAffirmations={customAffirmations}
          onClose={() => setShowPicker(false)}
          onGoToRecording={openRecordingScreen}
          onToggleAffirmation={toggleQueuedAffirmation}
          queuedAffirmations={queuedAffirmations}
          savedAffirmations={deviceSavedAffirmations}
          visible={showPicker}
        />
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
    paddingTop: 28,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 124, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
  },
  emptyCopy: {
    color: '#C6CDD8',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 28,
    maxWidth: 320,
  },
  primaryButton: {
    minWidth: 220,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 14,
    minWidth: 220,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
  },
  recordingContent: {
    paddingBottom: 28,
    gap: 18,
  },
  heroCard: {
    borderRadius: 30,
    padding: 24,
    backgroundColor: '#141B2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F6C453',
    shadowColor: '#F6C453',
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  queueReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(246, 196, 83, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 83, 0.24)',
  },
  queueReadyBadgeText: {
    color: '#F6D27A',
    fontSize: 12,
    fontWeight: '700',
  },
  eyebrow: {
    color: '#D8DEEA',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: '#F5F7FA',
    fontSize: 31,
    fontWeight: '700',
    marginTop: 16,
    lineHeight: 37,
  },
  heroCopy: {
    color: '#BAC4D3',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 310,
  },
  microphoneBadgeOuter: {
    width: 128,
    height: 128,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 26,
    marginBottom: 22,
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 83, 0.14)',
  },
  microphoneBadgeMiddle: {
    width: 98,
    height: 98,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  microphoneBadge: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 83, 0.34)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  microphoneBadgePressed: {
    transform: [{ scale: 0.96 }],
  },
  heroActionRow: {
    gap: 12,
  },
  heroPrimaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 83, 0.26)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  heroPrimaryButtonText: {
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '700',
  },
  heroSecondaryButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(246, 196, 83, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  heroSecondaryButtonText: {
    color: '#F3E7BF',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionCaption: {
    color: '#C6CDD8',
    fontSize: 14,
    marginTop: 6,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    backgroundColor: '#151C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  queueIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  queueIndexText: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '700',
  },
  queueText: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
});
