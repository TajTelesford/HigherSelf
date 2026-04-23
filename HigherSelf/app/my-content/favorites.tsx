import { MyContentScreenHeader } from '@/components/MyContentScreenHeader';
import { StyleSheet, Text, View } from 'react-native';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <MyContentScreenHeader title="Favorites" />
      <Text style={styles.body}>Your saved content will live here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  body: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 16,
    lineHeight: 24,
  },
});
