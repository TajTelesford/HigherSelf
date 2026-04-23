import { Ionicons } from '@expo/vector-icons';
import { SavedAffirmationCard } from '@/components/SavedAffirmationCard';
import { Text } from '@/components/ui/text';
import { useSavedAffirmations } from '@/context/SavedAffirmationContext';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const { savedAffirmations, loading } = useSavedAffirmations();

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.message}>Loading saved affirmations...</Text>
        </View>
      );
    }

    if (savedAffirmations.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.message}>No saved affirmations yet.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={savedAffirmations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SavedAffirmationCard affirmation={item} />}
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
          <Text style={styles.title}>Favorites</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={22} />
          </Pressable>
        </View>

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
  content: {
    flex: 1,
    paddingTop: 24,
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
});
