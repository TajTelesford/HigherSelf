import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useSavedAffirmations } from '@/context/SavedAffirmationContext';
import type { Affirmation } from '@/types/affirmations';
import { Text } from '@/components/ui/text';
import HeartButton from './HeartButton';

type SavedAffirmationCardProps = {
  affirmation: Affirmation;
};

export function SavedAffirmationCard({ affirmation }: SavedAffirmationCardProps) {
  const { isSaved, toggleSaved } = useSavedAffirmations();
  const saved = isSaved(affirmation.id);

  return (
    <View style={styles.card}>
      <View style={styles.leftIcon}>
        <Ionicons color="#FFFFFF" name="play" size={14} />
      </View>

      <Text style={styles.text}>{affirmation.text}</Text>

      <HeartButton
        onPress={() => toggleSaved(affirmation)}
        saved={saved}
        size="compact"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    backgroundColor: '#141A26',
    borderWidth: 1.5,
    borderColor: '#F4C95D',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  leftIcon: {
    height: 26,
    width: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
  },
});

export default SavedAffirmationCard;
