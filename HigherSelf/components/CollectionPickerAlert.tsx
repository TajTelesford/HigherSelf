import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import type { Affirmation } from '@/types/affirmations';
import type { AffirmationCollection } from '@/types/collections';

type CollectionPickerAlertProps = {
  affirmation: Affirmation | null;
  collections: AffirmationCollection[];
  isVisible: boolean;
  isAffirmationInCollection: (collectionId: string, affirmationId: string) => boolean;
  onClose: () => void;
  onToggleCollection: (collectionId: string, affirmation: Affirmation) => void;
};

export function CollectionPickerAlert({
  affirmation,
  collections,
  isVisible,
  isAffirmationInCollection,
  onClose,
  onToggleCollection,
}: CollectionPickerAlertProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />

        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Add to collection</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons color="#F5F7FA" name="close" size={20} />
            </Pressable>
          </View>

          {affirmation ? (
            <Text numberOfLines={2} style={styles.subtitle}>
              {affirmation.text}
            </Text>
          ) : null}

          {collections.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No collections yet.</Text>
              <Text style={styles.emptyMessage}>
                Create a collection first, then you can bookmark affirmations into it.
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {affirmation
                ? collections.map((collection) => {
                    const selected = isAffirmationInCollection(
                      collection.id,
                      affirmation.id
                    );

                    return (
                      <Pressable
                        key={collection.id}
                        onPress={() => onToggleCollection(collection.id, affirmation)}
                        style={[
                          styles.collectionRow,
                          selected && styles.collectionRowSelected,
                        ]}
                      >
                        <View style={styles.collectionText}>
                          <Text style={styles.collectionName}>{collection.name}</Text>
                          <Text style={styles.collectionCount}>
                            {collection.affirmations.length} affirmation
                            {collection.affirmations.length === 1 ? '' : 's'}
                          </Text>
                        </View>

                        <Ionicons
                          color={selected ? '#F4C95D' : 'rgba(245, 247, 250, 0.42)'}
                          name={selected ? 'bookmark' : 'bookmark-outline'}
                          size={22}
                        />
                      </Pressable>
                    );
                  })
                : null}
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
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
    maxHeight: '72%',
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: 'rgba(245, 247, 250, 0.7)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
  listContent: {
    gap: 12,
    paddingTop: 22,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  collectionRowSelected: {
    borderColor: '#F4C95D',
  },
  collectionText: {
    flex: 1,
    paddingRight: 16,
  },
  collectionName: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  collectionCount: {
    color: 'rgba(245, 247, 250, 0.58)',
    fontSize: 14,
    marginTop: 6,
  },
  emptyState: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyMessage: {
    color: 'rgba(245, 247, 250, 0.68)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CollectionPickerAlert;
