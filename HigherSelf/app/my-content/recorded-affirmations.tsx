import { Ionicons } from '@expo/vector-icons';
import { RecordedAffirmationCard } from '@/components/RecordedAffirmationCard';
import { Text } from '@/components/ui/text';
import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
import type { VoiceRecordingEntry } from '@/types/recordings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

export default function RecordedAffirmationsScreen() {
  const [recordings, setRecordings] = useState<VoiceRecordingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [deletingRecordingId, setDeletingRecordingId] = useState<string | null>(null);
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const playerStatus = useAudioPlayerStatus(player);

  const recentRecordings = useMemo(() => {
    const cutoff = Date.now() - THIRTY_DAYS_IN_MS;

    return recordings.filter((recording) => {
      const createdAt = new Date(recording.createdAt).getTime();
      return Number.isFinite(createdAt) && createdAt >= cutoff;
    });
  }, [recordings]);

  const loadRecordings = useCallback(async () => {
    try {
      const storedRecordings = await AsyncStorage.getItem(STORAGE_KEYS.VOICE_RECORDINGS);
      const parsed = storedRecordings
        ? (JSON.parse(storedRecordings) as VoiceRecordingEntry[])
        : [];

      setRecordings(parsed);
    } catch (error) {
      console.error('Failed to load voice recordings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  useEffect(() => {
    if (!playerStatus.playing) {
      setActiveRecordingId((current) => (current ? null : current));
    }
  }, [playerStatus.playing]);

  const handlePlayPause = (recording: VoiceRecordingEntry) => {
    const isActive = activeRecordingId === recording.id;

    if (isActive && playerStatus.playing) {
      player.pause();
      setActiveRecordingId(null);
      return;
    }

    if (!isActive) {
      player.replace(recording.uri);
      setActiveRecordingId(recording.id);
    }

    player.play();
  };

  const handleDelete = (recording: VoiceRecordingEntry) => {
    Alert.alert(
      'Delete recording?',
      'This recorded affirmation will be removed from the app.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingRecordingId(recording.id);

              if (activeRecordingId === recording.id) {
                player.pause();
                setActiveRecordingId(null);
              }

              await new Promise((resolve) => setTimeout(resolve, 360));

              const recordingFile = new File(recording.uri);
              if (recordingFile.exists) {
                recordingFile.delete();
              }

              const updated = recordings.filter((item) => item.id !== recording.id);
              setRecordings(updated);
              await AsyncStorage.setItem(
                STORAGE_KEYS.VOICE_RECORDINGS,
                JSON.stringify(updated)
              );
            } catch (error) {
              console.error('Failed to delete voice recording:', error);
            } finally {
              setDeletingRecordingId((current) =>
                current === recording.id ? null : current
              );
            }
          },
        },
      ]
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.message}>Loading recorded affirmations...</Text>
        </View>
      );
    }

    if (recentRecordings.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>No recordings in the last 30 days.</Text>
          <Text style={styles.emptyMessage}>
            Record your affirmations and they&apos;ll appear here for quick playback.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={recentRecordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordedAffirmationCard
            isDeleting={deletingRecordingId === item.id}
            isPlaying={activeRecordingId === item.id && playerStatus.playing}
            onDelete={() => handleDelete(item)}
            onPlayPause={() => handlePlayPause(item)}
            recording={item}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Recorded Affirmations</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={22} />
          </Pressable>
        </View>

        <Text style={styles.subtitle}>Past 30 days</Text>

        <View style={styles.content}>{renderContent()}</View>
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
  subtitle: {
    color: 'rgba(245, 247, 250, 0.58)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  message: {
    color: '#F5F7FA',
    fontSize: 18,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyMessage: {
    color: 'rgba(245, 247, 250, 0.68)',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    textAlign: 'center',
  },
});
