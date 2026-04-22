import UserStreak from '@/components/UserStreak';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileCard = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
};

const PROFILE_CARDS: ProfileCard[] = [
  {
    title: 'Topics you follow',
    icon: 'cards-outline',
    onPress: () => Alert.alert('Topics', 'Topic customization is coming next.'),
  },
  {
    title: 'App icon',
    icon: 'shape-outline',
    onPress: () => Alert.alert('App Icon', 'App icon options are coming next.'),
  },
  {
    title: 'Reminders',
    icon: 'bell-ring-outline',
    onPress: () => Alert.alert('Reminders', 'Reminder settings are coming next.'),
  },
  {
    title: 'Home Screen widgets',
    icon: 'tablet-dashboard',
    onPress: () => Alert.alert('Widgets', 'Widget setup is coming next.'),
  },
];

function ProfileCardTile({ title, icon, onPress }: ProfileCard) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
    >
      <View style={styles.tileArt}>
        <MaterialCommunityIcons color="#F3E8E3" name={icon} size={70} />
        <Ionicons name="sparkles" size={13} color="rgba(243, 232, 227, 0.85)" style={styles.tileSparkleOne} />
        <Ionicons name="sparkles" size={10} color="rgba(243, 232, 227, 0.65)" style={styles.tileSparkleTwo} />
      </View>

      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={() => router.back()} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.circleButton}>
            <Ionicons color="#F5F7FA" name="close" size={22} />
          </Pressable>

          <Pressable
            onPress={() => Alert.alert('Settings', 'Settings are coming next.')}
            style={styles.circleButton}
          >
            <Ionicons color="#F5F7FA" name="settings-outline" size={22} />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Profile</Text>

          <Pressable
            onPress={() => Alert.alert('Unlock all', 'Premium upgrade flow is coming next.')}
            style={({ pressed }) => [styles.upgradeCard, pressed && styles.upgradeCardPressed]}
          >
            <View style={styles.upgradeTextWrap}>
              <Text style={styles.upgradeTitle}>Unlock all</Text>
              <Text style={styles.upgradeBody}>
                Access all topics, affirmations, themes, and remove ads!
              </Text>
            </View>

            <View style={styles.upgradeArtWrap}>
              <MaterialCommunityIcons
                name="diamond-stone"
                size={66}
                color="#4F4146"
              />
              <Ionicons name="sparkles" size={16} color="#4F4146" style={styles.upgradeSparkleTop} />
              <Ionicons name="sparkles" size={12} color="#4F4146" style={styles.upgradeSparkleBottom} />
            </View>
          </Pressable>

          <UserStreak />

          <Text style={styles.sectionTitle}>Customize the app</Text>

          <View style={styles.grid}>
            {PROFILE_CARDS.map((card) => (
              <ProfileCardTile key={card.title} {...card} />
            ))}
          </View>
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
    backgroundColor: '#4A3A39',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 241, 237, 0.4)',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  content: {
    paddingBottom: 44,
  },
  title: {
    color: '#F5EDE8',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 22,
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(238, 193, 180, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeCard: {
    minHeight: 132,
    borderRadius: 26,
    backgroundColor: '#E6D6CC',
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 18,
  },
  upgradeCardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },
  upgradeTextWrap: {
    flex: 1,
    paddingVertical: 22,
    paddingLeft: 20,
    paddingRight: 12,
    justifyContent: 'center',
  },
  upgradeTitle: {
    color: '#241E20',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  upgradeBody: {
    color: '#332C2E',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  upgradeArtWrap: {
    width: 124,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  upgradeSparkleTop: {
    position: 'absolute',
    top: 22,
    right: 18,
  },
  upgradeSparkleBottom: {
    position: 'absolute',
    bottom: 28,
    left: 20,
  },
  sectionTitle: {
    color: '#F5EDE8',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  tile: {
    width: '48%',
    minHeight: 250,
    borderRadius: 30,
    backgroundColor: '#6B5857',
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  tilePressed: {
    opacity: 0.94,
    transform: [{ scale: 0.988 }],
  },
  tileArt: {
    height: 146,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tileSparkleOne: {
    position: 'absolute',
    top: 18,
    left: 18,
  },
  tileSparkleTwo: {
    position: 'absolute',
    top: 34,
    right: 20,
  },
  tileTitle: {
    color: '#F5EDE8',
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 30,
  },
});
