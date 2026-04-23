import CustomChooseAffirmationAlert from '@/components/CustomChooseAffirmationAlert';
import RecordMicrophoneButton from '@/components/RecordMicrophoneButton';
import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import type { Affirmation } from '@/types/affirmations';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FontAwesome from '@expo/vector-icons/FontAwesome';

type StoredAffirmationLike =
  | string
  | {
      id?: string | number;
      text?: string;
      affirmation?: string;
      category?: string;
    };

type VoiceRecordingEntry = {
  id: string;
  uri: string;
  fileName: string;
  durationMillis: number;
  createdAt: string;
  affirmations: Affirmation[];
};

type CarouselItem =
  | {
      type: 'affirmation';
      id: string;
      affirmation: Affirmation;
    }
  | {
      type: 'completion';
      id: 'completion-sentinel';
    };

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

const formatElapsed = (durationMillis: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
};

const AFFIRMATION_CARD_WIDTH = Dimensions.get('window').width - 96;

export default function RecordAffirmationsScreen() {
  const recordActionProgress = useRef(new Animated.Value(0)).current;
  const saveConfirmationProgress = useRef(new Animated.Value(0)).current;
  const affirmationCarouselRef = useRef<FlatList<CarouselItem> | null>(null);
  const currentAffirmationIndexRef = useRef(0);
  const saveConfirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deviceSavedAffirmations, setDeviceSavedAffirmations] = useState<
    Affirmation[]
  >([]);
  const [customAffirmations, setCustomAffirmations] = useState<Affirmation[]>([]);
  const [queuedAffirmations, setQueuedAffirmations] = useState<Affirmation[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Tap the mic to start recording in your own voice.'
  );

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);

  useEffect(() => {
    const bootstrapRecorder = async () => {
      try {
        const [
          storedSavedAffirmations,
          storedCustomAffirmations,
          storedQueuedAffirmations,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_AFFIRMATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_AFFIRMATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_AFFIRMATION_QUEUE),
        ]);

        if (storedSavedAffirmations) {
          setDeviceSavedAffirmations(
            JSON.parse(storedSavedAffirmations) as Affirmation[]
          );
        }

        setCustomAffirmations(normalizeCustomAffirmations(storedCustomAffirmations));

        if (storedQueuedAffirmations) {
          setQueuedAffirmations(JSON.parse(storedQueuedAffirmations) as Affirmation[]);
        }
      } catch (error) {
        console.error('Failed to load record affirmations state:', error);
        setStatusMessage('We hit a problem loading your affirmations.');
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapRecorder();
  }, []);

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
        console.error('Failed to persist affirmation queue:', error);
      }
    };

    persistQueue();
  }, [isBootstrapping, queuedAffirmations]);

  useEffect(() => {
    if (!showSaveConfirmation) {
      return;
    }

    Animated.timing(saveConfirmationProgress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    saveConfirmationTimeoutRef.current = setTimeout(() => {
      Animated.timing(saveConfirmationProgress, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setShowSaveConfirmation(false);
        }
      });
    }, 2400);

    return () => {
      if (saveConfirmationTimeoutRef.current) {
        clearTimeout(saveConfirmationTimeoutRef.current);
        saveConfirmationTimeoutRef.current = null;
      }
    };
  }, [saveConfirmationProgress, showSaveConfirmation]);

  useEffect(() => {
    Animated.timing(recordActionProgress, {
      toValue: recorderState.isRecording ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [recordActionProgress, recorderState.isRecording]);
  const recordButtonShift = recordActionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -54],
  });
  const recordTimerOpacity = recordActionProgress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0, 1],
  });
  const recordTimerWidth = recordActionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 94],
  });
  const recordTimerMargin = recordActionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });
  const carouselItems = useMemo<CarouselItem[]>(
    () => [
      ...queuedAffirmations.map((affirmation) => ({
        type: 'affirmation' as const,
        id: affirmation.id,
        affirmation,
      })),
      ...(recorderState.isRecording && queuedAffirmations.length
        ? [{ type: 'completion' as const, id: 'completion-sentinel' as const }]
        : []),
    ],
    [queuedAffirmations, recorderState.isRecording]
  );

  useEffect(() => {
    if (!queuedAffirmations.length) {
      currentAffirmationIndexRef.current = 0;
      setCurrentAffirmationIndex(0);
      return;
    }

    const nextIndex = Math.min(
      currentAffirmationIndexRef.current,
      queuedAffirmations.length - 1
    );

    currentAffirmationIndexRef.current = nextIndex;
    setCurrentAffirmationIndex(nextIndex);

    affirmationCarouselRef.current?.scrollToIndex({
      index: nextIndex,
      animated: false,
    });
  }, [queuedAffirmations]);

  const toggleQueuedAffirmation = (affirmation: Affirmation) => {
    setQueuedAffirmations((currentQueue) => {
      if (currentQueue.some((item) => item.id === affirmation.id)) {
        return currentQueue.filter((item) => item.id !== affirmation.id);
      }

      return [...currentQueue, affirmation];
    });
  };

  const saveRecordingMetadata = async (entry: VoiceRecordingEntry) => {
    const storedRecordings = await AsyncStorage.getItem(STORAGE_KEYS.VOICE_RECORDINGS);
    const parsed = storedRecordings
      ? (JSON.parse(storedRecordings) as VoiceRecordingEntry[])
      : [];

    const updated = [entry, ...parsed];
    await AsyncStorage.setItem(
      STORAGE_KEYS.VOICE_RECORDINGS,
      JSON.stringify(updated)
    );
  };

  const startRecording = async () => {
    if (isWorking) {
      return;
    }

    setIsWorking(true);
    setStatusMessage('Requesting microphone access...');

    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        setStatusMessage('Microphone permission is required to record.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatusMessage('Recording now. Speak your affirmations clearly and confidently.');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setStatusMessage('Recording could not start. Please try again.');
    } finally {
      setIsWorking(false);
    }
  };

  const stopRecording = async () => {
    if (!recorderState.isRecording || isWorking) {
      return;
    }

    setIsWorking(true);
    setStatusMessage('Saving your recording in the app...');

    try {
      await recorder.stop();
      const finalRecorderState = recorder.getStatus();
      const sourceUri = recorder.uri ?? finalRecorderState.url;

      if (!sourceUri) {
        throw new Error('Recording URI was unavailable after stopping.');
      }

      const recordingsDirectory = new Directory(Paths.document, 'recordings');

      if (!recordingsDirectory.exists) {
        recordingsDirectory.create({ idempotent: true, intermediates: true });
      }

      const createdAt = new Date().toISOString();
      const fileName = `affirmation-${createdAt.replace(/[:.]/g, '-')}.m4a`;
      const destinationFile = new File(recordingsDirectory, fileName);
      const sourceFile = new File(sourceUri);
      sourceFile.move(destinationFile);

      const entry: VoiceRecordingEntry = {
        id: createdAt,
        uri: destinationFile.uri,
        fileName,
        durationMillis: finalRecorderState.durationMillis,
        createdAt,
        affirmations: queuedAffirmations,
      };

      await saveRecordingMetadata(entry);
      setStatusMessage('Saved in the app. Tap again anytime for another take.');
      setShowSaveConfirmation(true);
    } catch (error) {
      console.error('Failed to save recording:', error);
      setStatusMessage('We could not save that take. Please try again.');
    } finally {
      setIsWorking(false);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      }).catch((error: unknown) => {
        console.error('Failed to reset audio mode:', error);
      });
    }
  };

  const handleMainButtonPress = async () => {
    if (recorderState.isRecording) {
      await stopRecording();
      return;
    }

    await startRecording();
  };

  const handleAffirmationSwipeEnd = async (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const cardWidth = event.nativeEvent.layoutMeasurement.width;

    if (!cardWidth || !queuedAffirmations.length) {
      return;
    }

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    const clampedIndex = Math.max(
      0,
      Math.min(nextIndex, carouselItems.length - 1)
    );
    const previousIndex = currentAffirmationIndexRef.current;

    if (recorderState.isRecording && clampedIndex < previousIndex) {
      affirmationCarouselRef.current?.scrollToIndex({
        index: previousIndex,
        animated: true,
      });
      return;
    }

    if (recorderState.isRecording && clampedIndex === queuedAffirmations.length) {
      const lastAffirmationIndex = Math.max(queuedAffirmations.length - 1, 0);
      currentAffirmationIndexRef.current = lastAffirmationIndex;
      setCurrentAffirmationIndex(lastAffirmationIndex);
      await stopRecording();
      return;
    }

    currentAffirmationIndexRef.current = clampedIndex;
    setCurrentAffirmationIndex(clampedIndex);
  };

  const isLoading = isBootstrapping;

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Record Affirmation</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={22} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#F5F7FA" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <Text style={styles.heroEyebrow}>Your Voice</Text>

                <Pressable onPress={() => setShowPicker(true)} style={styles.editQueueButton}>
                  <Ionicons color="#D8CCFF" name="sparkles" size={16} />
                  <Text style={styles.editQueueButtonText}>Edit Queue</Text>
                </Pressable>
              </View>
              <Text style={styles.heroTitle}>Speak your affirmations with conviction.</Text>
              <Text style={styles.heroCopy}>{statusMessage}</Text>

              {queuedAffirmations.length ? (
                <View style={styles.carouselSection}>
                  <View style={styles.carouselHeader}>
                    <Text style={styles.carouselLabel}>Affirmation Flow</Text>
                    <Text style={styles.carouselCounter}>
                      {currentAffirmationIndex + 1} / {queuedAffirmations.length}
                    </Text>
                  </View>

                  <FlatList
                    ref={affirmationCarouselRef}
                    contentContainerStyle={styles.carouselListContent}
                    data={carouselItems}
                    horizontal
                    keyExtractor={(item) => item.id}
                    getItemLayout={(_, index) => ({
                      index,
                      length: AFFIRMATION_CARD_WIDTH,
                      offset: AFFIRMATION_CARD_WIDTH * index,
                    })}
                    onMomentumScrollEnd={handleAffirmationSwipeEnd}
                    pagingEnabled
                    renderItem={({ index, item }) => (
                      <View style={styles.affirmationCardFrame}>
                        {item.type === 'completion' ? (
                          <View style={styles.affirmationCompletionCard} />
                        ) : (
                          <View
                            style={[
                              styles.affirmationCard,
                              index === currentAffirmationIndex &&
                                styles.affirmationCardActive,
                            ]}
                          >
                            <View style={styles.affirmationCardNoise} />

                            <View style={styles.affirmationCardTopRow}>
                              <View style={styles.affirmationQuoteBadge}>
                                <FontAwesome name="quote-left" size={18} color="white" />
                              </View>
                            </View>

                            <Text style={styles.affirmationCardText}>
                              {item.affirmation.text}
                            </Text>

                            <View style={styles.affirmationCardBottomRow}>
                              <Text style={styles.affirmationCardCategory}>
                                {item.affirmation.category
                                  ? item.affirmation.category.replace(
                                      /^\w/,
                                      (char) => char.toUpperCase()
                                    )
                                  : 'Affirmation'}
                              </Text>

                              <View style={styles.affirmationHeartBadge}>
                                <FontAwesome name="quote-right" size={18} color="white" />
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                    scrollEnabled={!isWorking && queuedAffirmations.length > 1}
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="center"
                    style={styles.carouselList}
                  />

                  <Text style={styles.carouselHint}>
                    {recorderState.isRecording
                      ? 'Swipe forward through each affirmation. Swiping past the last card ends the take.'
                      : 'Swipe to preview your affirmations.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyCarouselState}>
                  <Text style={styles.emptyCarouselTitle}>Your queue is empty</Text>
                  <Text style={styles.emptyCarouselCopy}>
                    Add affirmations to build a swipeable recording flow for this take.
                  </Text>
                </View>
              )}

              <View style={styles.recordButtonWrap}>
                <Animated.View
                  style={[
                    styles.recordActionRow,
                    { transform: [{ translateX: recordButtonShift }] },
                  ]}
                >
                  <RecordMicrophoneButton
                    disabled={isWorking}
                    isRecording={recorderState.isRecording}
                    onPress={handleMainButtonPress}
                  />

                  <Animated.View
                    style={[
                      styles.recordTimerWrap,
                      {
                        opacity: recordTimerOpacity,
                        width: recordTimerWidth,
                        marginLeft: recordTimerMargin,
                      },
                    ]}
                  >
                    <Text style={styles.recordTimerText}>
                      {formatElapsed(recorderState.durationMillis)}
                    </Text>
                  </Animated.View>
                </Animated.View>
              </View>

              <View style={styles.heroFooter}>
                <Text style={styles.heroFooterText}>
                  {recorderState.isRecording
                    ? 'Tap to stop and save'
                    : 'Tap to begin recording'}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        <CustomChooseAffirmationAlert
          customAffirmations={customAffirmations}
          onClose={() => setShowPicker(false)}
          onGoToRecording={() => setShowPicker(false)}
          onToggleAffirmation={toggleQueuedAffirmation}
          queuedAffirmations={queuedAffirmations}
          savedAffirmations={deviceSavedAffirmations}
          visible={showPicker}
        />

        {showSaveConfirmation ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.saveConfirmationSheet,
              {
                opacity: saveConfirmationProgress,
                transform: [
                  {
                    translateY: saveConfirmationProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [120, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.saveConfirmationIconWrap}>
              <Ionicons color="#F5F7FA" name="checkmark" size={22} />
            </View>
            <View style={styles.saveConfirmationCopy}>
              <Text style={styles.saveConfirmationTitle}>Recording Saved</Text>
              <Text style={styles.saveConfirmationText}>
                Your affirmation recording is now saved in the app.
              </Text>
            </View>
          </Animated.View>
        ) : null}
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
    height: '92%',
    maxHeight: '92%',
    backgroundColor: '#070B14',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#A3AED0',
    opacity: 0.45,
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 28,
    paddingBottom: 28,
    gap: 18,
  },
  heroCard: {
    borderRadius: 32,
    padding: 22,
    backgroundColor: '#0C1220',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    shadowColor: '#5B21B6',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  heroEyebrow: {
    color: '#BFA6FF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginTop: 10,
  },
  heroCopy: {
    color: '#C7D1E0',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  carouselSection: {
    marginTop: 22,
    gap: 12,
  },
  carouselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  carouselLabel: {
    color: '#BFA6FF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  carouselCounter: {
    color: '#DCCEFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  affirmationCardFrame: {
    width: AFFIRMATION_CARD_WIDTH,
    alignItems: 'center',
  },
  affirmationCard: {
    width: '100%',
    height: 300,
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 26,
    backgroundColor: '#171229',
    borderWidth: 1,
    borderColor: 'rgba(202, 177, 255, 0.18)',
    shadowColor: '#4C1D95',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  affirmationCompletionCard: {
    width: '100%',
    height: 300,
    opacity: 0,
  },
  carouselListContent: {
    paddingHorizontal: 6,
  },
  carouselList: {
    alignSelf: 'center',
  },
  affirmationCardActive: {
    borderColor: 'rgba(245, 224, 255, 0.34)',
    backgroundColor: '#1A1330',
  },
  affirmationCardNoise: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  affirmationCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  affirmationQuoteBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(137, 92, 246, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(232, 219, 255, 0.18)',
  },
  affirmationCardText: {
    color: '#F5F7FA',
    fontSize: 21,
    lineHeight: 31,
    fontWeight: '700',
    textAlign: 'left',
    letterSpacing: 0.3,
    zIndex: 1,
    marginTop: 18,
    marginBottom: 20,
    maxWidth: '88%',
  },
  affirmationCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  affirmationCardCategory: {
    color: '#E8DBFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  affirmationHeartBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 196, 132, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 236, 218, 0.18)',
  },
  carouselHint: {
    color: '#A7B1C5',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  emptyCarouselState: {
    marginTop: 22,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 28,
    backgroundColor: '#070B14',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.16)',
    alignItems: 'center',
  },
  emptyCarouselTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyCarouselCopy: {
    color: '#9FA9BC',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },
  recordButtonWrap: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  recordActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordTimerWrap: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  recordTimerText: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroFooter: {
    marginTop: 18,
    alignItems: 'center',
    gap: 12,
  },
  heroFooterText: {
    color: '#D7DCE7',
    fontSize: 14,
    fontWeight: '600',
  },
  editQueueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  editQueueButtonText: {
    color: '#EFE9FF',
    fontSize: 14,
    fontWeight: '700',
  },
  saveConfirmationSheet: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'rgba(12, 18, 32, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  saveConfirmationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
  },
  saveConfirmationCopy: {
    flex: 1,
    gap: 4,
  },
  saveConfirmationTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
  },
  saveConfirmationText: {
    color: '#C7D1E0',
    fontSize: 14,
    lineHeight: 20,
  },
});
