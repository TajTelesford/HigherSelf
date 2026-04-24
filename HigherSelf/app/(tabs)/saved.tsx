import { useSavedAffirmations } from '@/context/SavedAffirmationContext';
import { SavedAffirmationCard } from '@/components/SavedAffirmationCard';
import { Text } from '@/components/ui/text';
import { FlatList, StyleSheet, View } from 'react-native';

export default function SavedScreen() {
  const { savedAffirmations, loading } = useSavedAffirmations();

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Loading saved affirmations...</Text>
      </View>
    );
  }

  if (savedAffirmations.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No saved affirmations yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Library</Text>

      <FlatList
        data={savedAffirmations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SavedAffirmationCard affirmation={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  separator: {
    height: 12,
  },
  center: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});
