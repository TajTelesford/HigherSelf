import { useSavedAffirmations } from '@/context/SavedAffirmationContext';
import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import type { Affirmation } from '@/types/affirmations';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PracticeTab = 'saved' | 'custom';
type PracticeStep = 'queue' | 'recording';

type StoredAffirmationLike =
  | string
  | {
      id?: string | number;
      text?: string;
      affirmation?: string;
      category?: string;
    };

const PRACTICE_TABS: { id: PracticeTab; label: string }[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'custom', label: 'My Own' },
];

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
  const [activeTab, setActiveTab] = useState<PracticeTab>('saved');
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
    if (activeTab !== 'saved') {
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
  }, [activeTab]);

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

  const affirmationsByTab = useMemo(
    () => ({
      saved: deviceSavedAffirmations,
      custom: customAffirmations,
    }),
    [customAffirmations, deviceSavedAffirmations]
  );

  const visibleAffirmations = affirmationsByTab[activeTab];
  const queuedIds = useMemo(
    () => new Set(queuedAffirmations.map((affirmation) => affirmation.id)),
    [queuedAffirmations]
  );

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

  const renderAffirmationCard = ({ item }: { item: Affirmation }) => {
    const selected = queuedIds.has(item.id);

    return (
      <View
        style={[
          styles.affirmationCard,
          selected && styles.affirmationCardSelected,
        ]}
      >
        <Text style={styles.affirmationCardText}>{item.text}</Text>

        <Pressable
          accessibilityLabel={
            selected ? 'Remove affirmation from queue' : 'Add affirmation to queue'
          }
          onPress={() => toggleQueuedAffirmation(item)}
          style={({ pressed }) => [
            styles.addButton,
            selected && styles.addButtonSelected,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Ionicons
            color="#F5F7FA"
            name={selected ? 'checkmark' : 'add'}
            size={22}
          />
        </Pressable>
      </View>
    );
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
                <Text style={styles.eyebrow}>Today&apos;s Practice</Text>
                <Text style={styles.heroTitle}>Recording Screen</Text>
                <Text style={styles.heroCopy}>
                  Your affirmation queue is ready. This is the handoff state for the
                  recorder flow, and it keeps the selected affirmations visible for
                  the next step.
                </Text>

                <View style={styles.microphoneBadge}>
                  <MaterialCommunityIcons
                    color="#F5F7FA"
                    name="microphone"
                    size={34}
                  />
                </View>

                <Pressable onPress={() => setShowPicker(true)} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Edit Queue</Text>
                </Pressable>
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

        <Modal
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
          transparent
          visible={showPicker}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Choose Affirmations</Text>
                  <Text style={styles.modalSubtitle}>
                    Add the affirmations you want to recite today.
                  </Text>
                </View>

                <Pressable
                  onPress={() => setShowPicker(false)}
                  style={styles.closeButton}
                >
                  <Ionicons color="#F5F7FA" name="close" size={22} />
                </Pressable>
              </View>

              <View style={styles.tabRow}>
                <View style={styles.tabSwitcher}>
                  {PRACTICE_TABS.map((tab) => {
                    const isActive = tab.id === activeTab;

                    return (
                      <Pressable
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        style={[styles.tabButton, isActive && styles.tabButtonActive]}
                      >
                        <Text
                          style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
                        >
                          {tab.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Text style={styles.tabMetaText}>
                {affirmationsByTab[activeTab].length} affirmation
                {affirmationsByTab[activeTab].length === 1 ? '' : 's'}
              </Text>

              <View style={styles.listRegion}>
                {visibleAffirmations.length ? (
                  <FlatList
                    contentContainerStyle={styles.affirmationListContent}
                    data={visibleAffirmations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAffirmationCard}
                    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                    showsVerticalScrollIndicator={false}
                    style={styles.affirmationList}
                  />
                ) : (
                  <View style={styles.emptyTabState}>
                    <Text style={styles.emptyTabTitle}>
                      {activeTab === 'saved'
                        ? 'No saved affirmations yet'
                        : 'No custom affirmations yet'}
                    </Text>
                    <Text style={styles.emptyTabCopy}>
                      {activeTab === 'saved'
                        ? 'Liked affirmations from the home screen will appear here.'
                        : 'Affirmations you create yourself will appear in this tab.'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.modalFooter}>
                <View style={styles.queueCountPill}>
                  <Text style={styles.queueCountText}>
                    {queuedAffirmations.length} Affirmation
                    {queuedAffirmations.length === 1 ? '' : 's'} Ready
                  </Text>
                </View>

                <Pressable
                  disabled={!queuedAffirmations.length}
                  onPress={openRecordingScreen}
                  style={[
                    styles.primaryButton,
                    !queuedAffirmations.length && styles.primaryButtonDisabled,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Go To Recording</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#151C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  eyebrow: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#F5F7FA',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 10,
  },
  heroCopy: {
    color: '#C6CDD8',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  microphoneBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.32)',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    height: '86%',
    borderRadius: 28,
    backgroundColor: '#101726',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  modalTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#C6CDD8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 260,
  },
  tabRow: {
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 4,
  },
  tabButton: {
    minWidth: 116,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
  },
  tabButtonText: {
    color: '#C6CDD8',
    fontSize: 15,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#F5F7FA',
  },
  tabMetaText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  listRegion: {
    flex: 1,
    minHeight: 220,
  },
  affirmationListContent: {
    paddingBottom: 18,
    paddingTop: 2,
  },
  affirmationList: {
    flex: 1,
  },
  affirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  affirmationCardSelected: {
    borderColor: '#F4C95D',
    borderWidth: 1.5,
  },
  affirmationCardText: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  addButtonSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.55)',
    borderColor: 'rgba(167, 139, 250, 0.38)',
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  listSeparator: {
    height: 12,
  },
  emptyTabState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  emptyTabTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyTabCopy: {
    color: '#C6CDD8',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  modalFooter: {
    paddingTop: 16,
    gap: 14,
    alignItems: 'center',
  },
  queueCountPill: {
    minWidth: 210,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  queueCountText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '700',
  },
});
