import CustomChooseAffirmationAlert from '@/components/CustomChooseAffirmationAlert';
import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import type { Affirmation } from '@/types/affirmations';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Directory, File, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

const WAVE_BAR_COUNT = 27;
const DEFAULT_WAVE = Array.from({ length: WAVE_BAR_COUNT }, (_, index) => {
  const distance = Math.abs(index - (WAVE_BAR_COUNT - 1) / 2);
  return 10 + Math.max(0, 16 - distance * 1.15);
});

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

const buildWaveHeights = (level: number, tick: number) =>
  DEFAULT_WAVE.map((base, index) => {
    const swing =
      Math.sin(tick / 2 + index * 0.8) * 7 +
      Math.cos(tick / 3 + index * 0.35) * 4;

    return Math.max(8, Math.min(64, base + level * 34 + swing));
  });

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  web: {
    mimeType: 'audio/mp4',
    bitsPerSecond: 128000,
  },
};

export default function RecordAffirmationsScreen() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const idleWaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveTickRef = useRef(0);
  const [deviceSavedAffirmations, setDeviceSavedAffirmations] = useState<
    Affirmation[]
  >([]);
  const [customAffirmations, setCustomAffirmations] = useState<Affirmation[]>([]);
  const [queuedAffirmations, setQueuedAffirmations] = useState<Affirmation[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [queueExpanded, setQueueExpanded] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(DEFAULT_WAVE);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    'Tap the mic to start recording in your own voice.'
  );
  const [lastSavedRecording, setLastSavedRecording] =
    useState<VoiceRecordingEntry | null>(null);

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
    if (isRecording) {
      if (idleWaveIntervalRef.current) {
        clearInterval(idleWaveIntervalRef.current);
        idleWaveIntervalRef.current = null;
      }

      return;
    }

    let tick = 0;
    idleWaveIntervalRef.current = setInterval(() => {
      tick += 1;
      waveTickRef.current = tick;
      setWaveHeights(buildWaveHeights(0.08, tick));
    }, 180);

    return () => {
      if (idleWaveIntervalRef.current) {
        clearInterval(idleWaveIntervalRef.current);
        idleWaveIntervalRef.current = null;
      }
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      const releaseRecording = async () => {
        try {
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
          }
        } catch {
          // Ignore cleanup errors when the modal is dismissed mid-session.
        } finally {
          recordingRef.current = null;
        }
      };

      releaseRecording();
    };
  }, []);

  const queueCountLabel = useMemo(() => {
    const count = queuedAffirmations.length;
    return `${count} affirmation${count === 1 ? '' : 's'} in queue`;
  }, [queuedAffirmations]);

  const toggleQueuedAffirmation = (affirmation: Affirmation) => {
    setQueuedAffirmations((currentQueue) => {
      if (currentQueue.some((item) => item.id === affirmation.id)) {
        return currentQueue.filter((item) => item.id !== affirmation.id);
      }

      return [...currentQueue, affirmation];
    });
  };

  const handleRecordingStatus = (status: Audio.RecordingStatus) => {
    if (!status.canRecord) {
      return;
    }

    setElapsedMs(status.durationMillis ?? 0);

    const normalizedLevel = Math.max(
      0,
      Math.min(1, ((status.metering ?? -160) + 160) / 160)
    );

    setVoiceLevel(normalizedLevel);
    waveTickRef.current += 1;
    setWaveHeights(buildWaveHeights(normalizedLevel, waveTickRef.current));
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

  const startRecording = async () => {
    if (isWorking) {
      return;
    }

    setIsWorking(true);
    setStatusMessage('Requesting microphone access...');

    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        setStatusMessage('Microphone permission is required to record.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      recording.setProgressUpdateInterval(100);
      recording.setOnRecordingStatusUpdate(handleRecordingStatus);
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();

      recordingRef.current = recording;
      waveTickRef.current = 0;
      setElapsedMs(0);
      setVoiceLevel(0);
      setIsRecording(true);
      setStatusMessage('Recording now. Speak your affirmations clearly and confidently.');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setStatusMessage('Recording could not start. Please try again.');
    } finally {
      setIsWorking(false);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current || isWorking) {
      return;
    }

    setIsWorking(true);
    setStatusMessage('Saving your recording to this device...');

    try {
      const currentRecording = recordingRef.current;
      await currentRecording.stopAndUnloadAsync();

      const sourceUri = currentRecording.getURI();

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
        durationMillis: elapsedMs,
        createdAt,
        affirmations: queuedAffirmations,
      };

      await saveRecordingMetadata(entry);

      setStatusMessage('Saved to your device. Tap again anytime for another take.');
      setWaveHeights(DEFAULT_WAVE);
    } catch (error) {
      console.error('Failed to save recording:', error);
      setStatusMessage('We could not save that take. Please try again.');
    } finally {
      recordingRef.current = null;
      setIsRecording(false);
      setIsWorking(false);
      setVoiceLevel(0);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      }).catch(() => {
        // Ignore mode-reset errors; recording has already ended.
      });
    }
  };

  const handleMainButtonPress = async () => {
    if (isRecording) {
      await stopRecording();
      return;
    }

    await startRecording();
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

                <View style={styles.waveRow}>
                  {waveHeights.map((height, index) => (
                    <View
                      key={`wave-${index}`}
                      style={[
                        styles.waveBar,
                        {
                          height,
                          opacity: isRecording ? 0.65 + voiceLevel * 0.35 : 0.55,
                        },
                      ]}
                    />
                  ))}
                </View>

                <Text style={styles.timerText}>{formatElapsed(elapsedMs)}</Text>
                <Text style={styles.dateText}>
                  {lastSavedRecording
                    ? `Last saved ${formatSessionDate(lastSavedRecording.createdAt)}`
                    : formatSessionDate(new Date().toISOString())}
                </Text>
              </View>

              <Pressable
                disabled={isWorking}
                onPress={handleMainButtonPress}
                style={({ pressed }) => [
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                  pressed && !isWorking && styles.recordButtonPressed,
                  isWorking && styles.recordButtonDisabled,
                ]}
              >
                <View
                  style={[
                    styles.recordButtonInner,
                    isRecording && styles.recordButtonInnerActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    color="#FFFFFF"
                    name={isRecording ? 'stop' : 'microphone'}
                    size={32}
                  />
                </View>
              </Pressable>

              <View style={styles.heroFooter}>
                <Text style={styles.heroFooterText}>
                  {isRecording ? 'Tap to stop and save' : 'Tap to begin recording'}
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
    minHeight: 230,
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
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 90,
    marginBottom: 22,
  },
  waveBar: {
    width: 6,
    borderRadius: 999,
    backgroundColor: '#A855F7',
  },
  timerText: {
    color: '#F5F7FA',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  dateText: {
    color: '#8E99AF',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
  },
  recordButton: {
    alignSelf: 'center',
    marginTop: 24,
    width: 118,
    height: 118,
    borderRadius: 59,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.24)',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(251, 113, 133, 0.16)',
    borderColor: 'rgba(253, 164, 175, 0.28)',
  },
  recordButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  recordButtonDisabled: {
    opacity: 0.7,
  },
  recordButtonInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  recordButtonInnerActive: {
    backgroundColor: '#EC4899',
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
});
