import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={22} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.contentText}>Profile</Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '600',
  },
});
