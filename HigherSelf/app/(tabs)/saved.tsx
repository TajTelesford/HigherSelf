import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0F1A',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
  },
});
