import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { AffirmationCollection } from '@/types/collections';

type CollectionFolderCardProps = {
  collection: AffirmationCollection;
  isFirst?: boolean;
  isLast?: boolean;
  onPress: () => void;
};

export function CollectionFolderCard({
  collection,
  isFirst = false,
  isLast = false,
  onPress,
}: CollectionFolderCardProps) {
  const affirmationCount = collection.affirmations.length;
  const countLabel = `${affirmationCount} affirmation${
    affirmationCount === 1 ? '' : 's'
  }`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        isFirst && styles.firstCard,
        isLast && styles.lastCard,
        !isLast && styles.cardDivider,
      ]}
    >
      <View style={styles.textBlock}>
        <Text style={styles.name}>{collection.name}</Text>
        <Text style={styles.count}>{countLabel}</Text>
      </View>

      <Ionicons color="rgba(245, 247, 250, 0.48)" name="chevron-forward" size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 132,
    backgroundColor: '#141A26',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  firstCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  lastCard: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  cardDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  textBlock: {
    flex: 1,
    paddingRight: 18,
  },
  name: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  count: {
    color: 'rgba(245, 247, 250, 0.68)',
    fontSize: 17,
    fontWeight: '500',
    marginTop: 18,
  },
});

export default CollectionFolderCard;
