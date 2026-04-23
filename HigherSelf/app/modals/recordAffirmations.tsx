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
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

const formatSessionDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
  });

const AFFIRMATION_CARD_WIDTH = Dimensions.get('window').width - 84;

export default function RecordAffirmationsScreen() {
  const recordActionProgress = useRef(new Animated.Value(0)).current;
  const affirmationCarouselRef = useRef<FlatList<Affirmation> | null>(null);
  const currentAffirmationIndexRef = useRef(0);
  const [deviceSavedAffirmations, setDeviceSavedAffirmations] = useState<
    Affirmation[]
  >([]);
  const [customAffirmations, setCustomAffirmations] = useState<Affirmation[]>([]);
  const [queuedAffirmations, setQueuedAffirmations] = useState<Affirmation[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [pendingPlaybackStart, setPendingPlaybackStart] = useState(false);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    'Tap the mic to start recording in your own voice.'
  );
  const [lastSavedRecording, setLastSavedRecording] =
    useState<VoiceRecordingEntry | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    const bootstrapRecorder = async () => {
      try {
        const [
          storedSavedAffirmations,
          storedCustomAffirmations,
          storedQueuedAffirmations,
          storedVoiceRecordings,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_AFFIRMATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_AFFIRMATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_AFFIRMATION_QUEUE),
          AsyncStorage.getItem(STORAGE_KEYS.VOICE_RECORDINGS),
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

        if (storedVoiceRecordings) {
          const parsed = JSON.parse(storedVoiceRecordings) as VoiceRecordingEntry[];
          setLastSavedRecording(parsed[0] ?? null);
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
    if (!playerStatus.isLoaded || !playerStatus.didJustFinish) {
      return;
    }

    player.seekTo(0).catch((error: unknown) => {
      console.error('Failed to reset playback position:', error);
    });
  }, [player, playerStatus.didJustFinish, playerStatus.isLoaded]);

  useEffect(() => {
    if (!lastSavedRecording) {
      return;
    }

    player.replace({ uri: lastSavedRecording.uri });
    setPendingPlaybackStart(false);
  }, [lastSavedRecording, player]);

  useEffect(() => {
    if (!pendingPlaybackStart || !playerStatus.isLoaded) {
      return;
    }

    player.play();
    setPendingPlaybackStart(false);
  }, [pendingPlaybackStart, player, playerStatus.isLoaded]);

  useEffect(() => {
    Animated.timing(recordActionProgress, {
      toValue: recorderState.isRecording ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [recordActionProgress, recorderState.isRecording]);

  const playbackDurationMs = Math.round(playerStatus.duration * 1000);
  const playbackPositionMs = Math.round(playerStatus.currentTime * 1000);
  const playbackProgress = playbackDurationMs
    ? Math.min(1, playbackPositionMs / playbackDurationMs)
    : 0;
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
  const activeAffirmation =
    queuedAffirmations[currentAffirmationIndex] ?? queuedAffirmations[0] ?? null;

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
    setLastSavedRecording(entry);
  };

  const stopPlayback = async () => {
    if (!playerStatus.isLoaded) {
      return;
    }

    try {
      player.pause();
      await player.seekTo(0);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const startRecording = async () => {
    if (isWorking) {
      return;
    }

    setIsWorking(true);
    setStatusMessage('Requesting microphone access...');

    try {
      await stopPlayback();

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
    setStatusMessage('Saving your recording to this device...');

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
      setStatusMessage('Saved to your device. Tap again anytime for another take.');
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

  const handlePlaybackPress = async () => {
    if (!lastSavedRecording || recorderState.isRecording || isWorking) {
      return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });

      if (!playerStatus.isLoaded) {
        player.replace({ uri: lastSavedRecording.uri });
        setPendingPlaybackStart(true);
        return;
      }

      if (playerStatus.playing) {
        player.pause();
        return;
      }

      if (
        playerStatus.didJustFinish ||
        (playerStatus.duration > 0 &&
          playerStatus.currentTime >= playerStatus.duration - 0.05)
      ) {
        await player.seekTo(0);
      }

      player.play();
    } catch (error) {
      console.error('Failed to play recording:', error);
      setStatusMessage('Playback could not start. Please try again.');
    }
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
      Math.min(nextIndex, queuedAffirmations.length - 1)
    );
    const previousIndex = currentAffirmationIndexRef.current;

    currentAffirmationIndexRef.current = clampedIndex;
    setCurrentAffirmationIndex(clampedIndex);

    if (
      recorderState.isRecording &&
      queuedAffirmations.length > 1 &&
      clampedIndex === queuedAffirmations.length - 1 &&
      previousIndex !== clampedIndex
    ) {
      await stopRecording();
    }
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
              <Text style={styles.heroEyebrow}>Your Voice</Text>
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
                    data={queuedAffirmations}
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
                        <View
                          style={[
                            styles.affirmationCard,
                            index === currentAffirmationIndex && styles.affirmationCardActive,
                          ]}
                        >
                          <View style={styles.affirmationCardGlowPrimary} />
                          <View style={styles.affirmationCardGlowAccent} />
                          <View style={styles.affirmationCardNoise} />

                          <View style={styles.affirmationCardTopRow}>
                            <View style={styles.affirmationQuoteBadge}>
                              <FontAwesome name="quote-left" size={18} color="white" />
                            </View>
                            <View style={styles.affirmationArrowBadge}>
                              <Ionicons
                                color="#F5F7FA"
                                name="chevron-forward"
                                size={16}
                              />
                            </View>
                          </View>

                          <Text style={styles.affirmationCardText}>{item.text}</Text>

                          <View style={styles.affirmationCardBottomRow}>
                            <Text style={styles.affirmationCardCategory}>
                              {item.category ? item.category.replace(/^\w/, (char) => char.toUpperCase()) : 'Affirmation'}
                            </Text>

                            <View style={styles.affirmationHeartBadge}>
                              <FontAwesome name="quote-right" size={18} color="white" />
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                    scrollEnabled={!isWorking && queuedAffirmations.length > 1}
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="center"
                  />

                  <Text style={styles.carouselHint}>
                    {recorderState.isRecording
                      ? 'Swipe through each affirmation. Reaching the final card ends the take.'
                      : activeAffirmation
                        ? `Start from: "${activeAffirmation.text}"`
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

                <Pressable onPress={() => setShowPicker(true)} style={styles.editQueueButton}>
                  <Ionicons color="#D8CCFF" name="sparkles" size={16} />
                  <Text style={styles.editQueueButtonText}>Edit Queue</Text>
                </Pressable>
              </View>
            </View>

            {lastSavedRecording ? (
              <View style={styles.savedCard}>
                <Text style={styles.savedLabel}>Saved To Device</Text>
                <Text style={styles.savedFileName}>{lastSavedRecording.fileName}</Text>
                <Text style={styles.savedMeta}>
                  {formatElapsed(lastSavedRecording.durationMillis)} recorded on{' '}
                  {formatSessionDate(lastSavedRecording.createdAt)}
                </Text>
                <View style={styles.playbackRow}>
                  <Pressable
                    disabled={recorderState.isRecording || isWorking}
                    onPress={handlePlaybackPress}
                    style={({ pressed }) => [
                      styles.playbackButton,
                      pressed &&
                        !recorderState.isRecording &&
                        !isWorking &&
                        styles.playbackButtonPressed,
                      (recorderState.isRecording || isWorking) &&
                        styles.playbackButtonDisabled,
                    ]}
                  >
                    <Ionicons
                      color="#F5F7FA"
                      name={playerStatus.playing ? 'pause' : 'play'}
                      size={18}
                    />
                    <Text style={styles.playbackButtonText}>
                      {playerStatus.playing ? 'Pause Replay' : 'Replay Recording'}
                    </Text>
                  </Pressable>

                  <Text style={styles.playbackTime}>
                    {formatElapsed(playbackPositionMs)} /{' '}
                    {formatElapsed(
                      playbackDurationMs || lastSavedRecording.durationMillis
                    )}
                  </Text>
                </View>
                <View style={styles.playbackTrack}>
                  <View
                    style={[
                      styles.playbackFill,
                      { width: `${Math.max(6, playbackProgress * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ) : null}
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
  },
  affirmationCard: {
    minHeight: 208,
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
  carouselListContent: {
    paddingHorizontal: 6,
  },
  affirmationCardActive: {
    borderColor: 'rgba(245, 224, 255, 0.34)',
    backgroundColor: '#1A1330',
  },
  affirmationCardGlowPrimary: {
    position: 'absolute',
    top: -18,
    left: -24,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(136, 84, 255, 0.26)',
    opacity: 0.95,
  },
  affirmationCardGlowAccent: {
    position: 'absolute',
    right: -26,
    bottom: -18,
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 184, 108, 0.28)',
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
  affirmationArrowBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
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
  savedCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(16, 25, 44, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  savedLabel: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  savedFileName: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  savedMeta: {
    color: '#A7B1C5',
    fontSize: 14,
    marginTop: 8,
  },
  playbackRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  playbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  playbackButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  playbackButtonDisabled: {
    opacity: 0.55,
  },
  playbackButtonText: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '700',
  },
  playbackTime: {
    color: '#C7D1E0',
    fontSize: 13,
    fontWeight: '600',
  },
  playbackTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  playbackFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#A855F7',
  },
});
