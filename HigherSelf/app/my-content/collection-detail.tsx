import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useAffirmationCollections } from '@/context/AffirmationCollectionsContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollectionDetailScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId?: string }>();
  const { deleteCollection, getCollectionById, loading } =
    useAffirmationCollections();
  const collection = collectionId ? getCollectionById(collectionId) : undefined;

  const handleDeleteCollection = () => {
    if (!collection) return;

    Alert.alert(
      'Delete collection?',
      `Remove "${collection.name}" and everything inside it?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCollection(collection.id);
            router.replace('/my-content/collections');
          },
        },
      ]
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.message}>Loading collection...</Text>
        </View>
      );
    }

    if (!collection) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>Collection not found.</Text>
          <Text style={styles.emptyMessage}>
            This collection may have been removed.
          </Text>
        </View>
      );
    }

    if (collection.affirmations.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>No affirmations yet.</Text>
          <Text style={styles.emptyMessage}>
            Affirmations you add to this folder will show up here.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={collection.affirmations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.affirmationCard}>
            <Text style={styles.affirmationText}>{item.text}</Text>
            <View style={styles.affirmationFooter}>
              <Text style={styles.affirmationCategory}>{item.category}</Text>
              <Ionicons color="#F5F7FA" name="bookmark" size={24} />
            </View>
          </View>
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
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <Ionicons color="#F5F7FA" name="chevron-back" size={30} />
            </Pressable>

            <Text numberOfLines={1} style={styles.title}>
              {collection?.name ?? 'Collection'}
            </Text>
          </View>

          {collection ? (
            <Pressable
              accessibilityLabel="Delete collection"
              accessibilityRole="button"
              onPress={handleDeleteCollection}
              style={styles.deleteButton}
            >
              <View pointerEvents="none" style={styles.deleteGradientBase} />
              <View pointerEvents="none" style={styles.deleteGradientPurple} />
              <View pointerEvents="none" style={styles.deleteGradientGold} />
              <Ionicons color="#F5F7FA" name="trash-outline" size={20} />
            </Pressable>
          ) : null}
        </View>

        <Pressable accessibilityRole="button" style={styles.feedButton}>
          <Text style={styles.feedButtonText}>Show all in feed</Text>
        </Pressable>

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
    marginBottom: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingRight: 16,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#11182A',
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.28)',
  },
  deleteGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#11182A',
  },
  deleteGradientPurple: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(139, 124, 255, 0.48)',
    top: -5,
    left: -3,
  },
  deleteGradientGold: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(242, 201, 76, 0.7)',
    right: -2,
    bottom: -1,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 26,
    fontWeight: '800',
    flexShrink: 1,
  },
  feedButton: {
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  feedButtonText: {
    color: '#0B0F1A',
    fontSize: 24,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
  listContent: {
    paddingBottom: 32,
  },
  separator: {
    height: 18,
  },
  affirmationCard: {
    borderRadius: 24,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  affirmationText: {
    color: '#F5F7FA',
    fontSize: 24,
    lineHeight: 33,
    fontWeight: '500',
  },
  affirmationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  affirmationCategory: {
    color: 'rgba(245, 247, 250, 0.58)',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  message: {
    color: '#F5F7FA',
    fontSize: 18,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyMessage: {
    color: 'rgba(245, 247, 250, 0.68)',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 10,
    textAlign: 'center',
  },
});
