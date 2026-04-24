import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import type { VoiceRecordingEntry } from '@/types/recordings';

type RecordedAffirmationCardProps = {
  isDeleting?: boolean;
  isPlaying: boolean;
  onDelete: () => void;
  onPlayPause: () => void;
  recording: VoiceRecordingEntry;
};

const formatDuration = (durationMillis: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
};

const formatRecordedDate = (createdAt: string) => {
  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown date';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function RecordedAffirmationCard({
  isDeleting = false,
  isPlaying,
  onDelete,
  onPlayPause,
  recording,
}: RecordedAffirmationCardProps) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!isDeleting) {
      return;
    }

    translateY.value = withTiming(760, {
      duration: 360,
      easing: Easing.in(Easing.cubic),
    });
    rotate.value = withTiming(10, {
      duration: 320,
      easing: Easing.in(Easing.quad),
    });
    scale.value = withTiming(0.92, {
      duration: 240,
      easing: Easing.out(Easing.quad),
    });
    opacity.value = withTiming(0, {
      duration: 240,
      easing: Easing.in(Easing.quad),
    });
  }, [isDeleting, opacity, rotate, scale, translateY]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const affirmationPreview = recording.affirmations.length
    ? recording.affirmations.map((affirmation) => affirmation.text).join(' ')
    : 'Untitled recording';

  return (
    <Animated.View style={[styles.card, animatedCardStyle]}>
      <Text numberOfLines={3} style={styles.text}>
        {affirmationPreview}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.meta}>
          {formatRecordedDate(recording.createdAt)} ·{' '}
          {formatDuration(recording.durationMillis)}
        </Text>

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityLabel={isPlaying ? 'Pause recording' : 'Play recording'}
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={onPlayPause}
            style={styles.iconButton}
          >
            <Ionicons
              color="#F5F7FA"
              name={isPlaying ? 'pause' : 'play'}
              size={20}
            />
          </Pressable>

          <Pressable
            accessibilityLabel="Delete recording"
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={onDelete}
            style={styles.iconButton}
          >
            <Ionicons color="#F87171" name="trash-outline" size={20} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  meta: {
    flex: 1,
    color: 'rgba(245, 247, 250, 0.58)',
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecordedAffirmationCard;
