import { MyContentCardDisplay } from '@/components/MyContentCardDisplay';
import { ProfileContentCard } from '@/components/ProfileContentCard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LibraryScreen() {
  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Library</Text>

          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons color="#F5F7FA" name="close" size={22} />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <Ionicons color="#F4C95D" name="library-outline" size={28} />
            </View>

            <Text style={styles.heroTitle}>Your saved space</Text>
            <Text style={styles.heroCopy}>
              Keep your favorite affirmations, folders, personal affirmations, and
              recordings all in one place.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>My Content</Text>
          <MyContentCardDisplay />

          <ProfileContentCard text="Go back to your profile hub to see your streak, customization tools, and account shortcuts." />
        </ScrollView>
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: 18,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244,201,93,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,201,93,0.18)',
    marginBottom: 16,
  },
  heroTitle: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroCopy: {
    color: '#C6CDD8',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },
});
