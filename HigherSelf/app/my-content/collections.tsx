import { Ionicons } from '@expo/vector-icons';
import { CollectionFolderCard } from '@/components/CollectionFolderCard';
import { CustomNameCollectionAlert } from '@/components/CustomNameCollectionAlert';
import { Text } from '@/components/ui/text';
import { useAffirmationCollections } from '@/context/AffirmationCollectionsContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollectionsScreen() {
  const { addCollection, collections, loading } = useAffirmationCollections();
  const [showNameAlert, setShowNameAlert] = useState(false);

  const openCollection = (collectionId: string) => {
    router.push({
      pathname: '/my-content/collection-detail',
      params: { collectionId },
    });
  };

  const handleSaveCollection = (name: string) => {
    const collection = addCollection(name);
    setShowNameAlert(false);
    openCollection(collection.id);
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons color="#F5F7FA" name="chevron-back" size={30} />
          </Pressable>

          <Text style={styles.title}>Collections</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowNameAlert(true)}
            style={styles.addButton}
          >
            <Ionicons color="#F5F7FA" name="add" size={30} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.centerContent}>
              <Text style={styles.message}>Loading collections...</Text>
            </View>
          ) : collections.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyTitle}>No collections yet.</Text>
              <Text style={styles.emptyMessage}>
                Tap the plus button to create your first affirmation folder.
              </Text>
            </View>
          ) : (
            <FlatList
              data={collections}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <CollectionFolderCard
                  collection={item}
                  isFirst={index === 0}
                  isLast={index === collections.length - 1}
                  onPress={() => openCollection(item.id)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>

      <CustomNameCollectionAlert
        onClose={() => setShowNameAlert(false)}
        onSave={handleSaveCollection}
        visible={showNameAlert}
      />
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 62,
  },
  listContent: {
    paddingBottom: 32,
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
