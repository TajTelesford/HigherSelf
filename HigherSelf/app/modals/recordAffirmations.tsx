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
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function RecordAffirmationsScreen() {
  const recordActionProgress = useRef(new Animated.Value(0)).current;
  const [deviceSavedAffirmations, setDeviceSavedAffirmations] = useState<
    Affirmation[]
  >([]);
  const [customAffirmations, setCustomAffirmations] = useState<Affirmation[]>([]);
  const [queuedAffirmations, setQueuedAffirmations] = useState<Affirmation[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [queueExpanded, setQueueExpanded] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [pendingPlaybackStart, setPendingPlaybackStart] = useState(false);
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

  const queueCountLabel = useMemo(() => {
    const count = queuedAffirmations.length;
    return `${count} affirmation${count === 1 ? '' : 's'} in queue`;
  }, [queuedAffirmations]);

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

              <View style={styles.visualizerCard}>
                <View style={styles.visualizerGlow} />

                <Text style={styles.dateText}>
                  {lastSavedRecording
                    ? `Last saved ${formatSessionDate(lastSavedRecording.createdAt)}`
                    : formatSessionDate(new Date().toISOString())}
                </Text>
              </View>

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

            <View style={styles.queuePanel}>
              <Pressable
                onPress={() => setQueueExpanded((current) => !current)}
                style={styles.queueHeader}
              >
                <View>
                  <Text style={styles.queueTitle}>Affirmation Queue</Text>
                  <Text style={styles.queueSubtitle}>
                    {queuedAffirmations.length
                      ? 'These are the affirmations ready for this take.'
                      : 'Add affirmations to give your recording a script.'}
                  </Text>
                </View>

                <View style={styles.queueHeaderRight}>
                  <Text style={styles.queueCountPill}>{queueCountLabel}</Text>
                  <Ionicons
                    color="#F5F7FA"
                    name={queueExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                  />
                </View>
              </Pressable>

              {queueExpanded ? (
                queuedAffirmations.length ? (
                  <View style={styles.queueList}>
                    {queuedAffirmations.map((affirmation, index) => (
                      <View key={affirmation.id} style={styles.queueItem}>
                        <View style={styles.queueIndex}>
                          <Text style={styles.queueIndexText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.queueItemText}>{affirmation.text}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyQueueState}>
                    <Text style={styles.emptyQueueTitle}>Your queue is empty</Text>
                    <Text style={styles.emptyQueueCopy}>
                      Pull in saved or custom affirmations, then start recording when
                      you&apos;re ready.
                    </Text>
                  </View>
                )
              ) : null}
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
  visualizerCard: {
    marginTop: 22,
    borderRadius: 28,
    minHeight: 112,
    paddingHorizontal: 18,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070B14',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.18)',
    overflow: 'hidden',
  },
  visualizerGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.6,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  dateText: {
    color: '#8E99AF',
    fontSize: 13,
    fontWeight: '600',
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
  queuePanel: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: '#0C1220',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  queueTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '700',
  },
  queueSubtitle: {
    color: '#9FA9BC',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 220,
  },
  queueHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  queueCountPill: {
    color: '#DCCEFF',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  queueList: {
    marginTop: 18,
    gap: 12,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    backgroundColor: '#10192C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  queueIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
  },
  queueIndexText: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '700',
  },
  queueItemText: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 15,
    lineHeight: 22,
  },
  emptyQueueState: {
    marginTop: 18,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#10192C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyQueueTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyQueueCopy: {
    color: '#9FA9BC',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
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
