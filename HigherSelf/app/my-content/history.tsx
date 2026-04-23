import { MyContentScreenHeader } from '@/components/MyContentScreenHeader';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <MyContentScreenHeader title="History" />
      <Text style={styles.body}>Your recent content history will live here.</Text>
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
