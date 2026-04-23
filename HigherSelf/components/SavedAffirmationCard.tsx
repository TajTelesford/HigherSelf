import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useSavedAffirmations } from '@/context/SavedAffirmationContext';
import type { Affirmation } from '@/types/affirmations';
import HeartButton from './HeartButton';

type SavedAffirmationCardProps = {
  affirmation: Affirmation;
  bookmarked?: boolean;
  onBookmarkPress?: () => void;
};

export function SavedAffirmationCard({
  affirmation,
  bookmarked = false,
  onBookmarkPress,
}: SavedAffirmationCardProps) {
  const { isSaved, toggleSaved } = useSavedAffirmations();
  const saved = isSaved(affirmation.id);

  return (
    <View style={styles.card}>
      <Text style={styles.text}>{affirmation.text}</Text>

      <View style={styles.actionsRow}>
        <HeartButton
          onPress={() => toggleSaved(affirmation)}
          saved={saved}
          size="compact"
          variant="ghost"
        />

        <Pressable
          accessibilityLabel="Add affirmation to collection"
          accessibilityRole="button"
          onPress={onBookmarkPress}
          style={styles.iconButton}
        >
          <Ionicons
            color="#F5F7FA"
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Share affirmation"
          accessibilityRole="button"
          style={styles.iconButton}
        >
          <Ionicons color="#F5F7FA" name="share-outline" size={24} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: '#141A26',
    borderWidth: 1.5,
    borderColor: '#F4C95D',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '500',
    minHeight: 72,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SavedAffirmationCard;
