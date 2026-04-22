import { ProfileCardTile } from '@/components/ProfileCardTile';
import UserStreak from '@/components/UserStreak';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
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

const PROFILE_CARD_ROWS = PROFILE_CARDS.reduce<ProfileCard[][]>((rows, card, index) => {
  if (index % 2 === 0) {
    rows.push([card]);
  } else {
    rows[rows.length - 1].push(card);
  }

  return rows;
}, []);



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
            style={styles.upgradeCard}
          >
            <View style={styles.upgradeContentRow}>
              <View style={styles.upgradeTextWrap}>
                <Text style={styles.upgradeTitle}>Unlock all</Text>
                <Text style={styles.upgradeBody}>
                  Access all topics, affirmations, themes, and remove ads!
                </Text>
              </View>

              <View style={styles.upgradeArtWrap}>
                <MaterialCommunityIcons
                  name="diamond-stone"
                  size={54}
                  color="rgba(220, 112, 234, 0.72)"
                />
                <Ionicons
                  name="sparkles"
                  size={14}
                  color="rgba(31, 24, 32, 0.65)"
                  style={styles.upgradeSparkleTop}
                />
                <Ionicons
                  name="sparkles"
                  size={10}
                  color="rgba(31, 24, 32, 0.55)"
                  style={styles.upgradeSparkleBottom}
                />
              </View>
            </View>
          </Pressable>

          <UserStreak />

          <Text style={styles.sectionTitle}>Customize the app</Text>

          <View style={styles.grid}>
            {PROFILE_CARD_ROWS.map((row, index) => (
              <View key={`profile-row-${index}`} style={styles.gridRow}>
                {row.map((card) => (
                  <ProfileCardTile key={card.title} {...card} />
                ))}
              </View>
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
    backgroundColor: '#121826',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#9CA3AF',
    opacity: 0.45,
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
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 18,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeCard: {
    minHeight: 132,
    borderRadius: 26,
    backgroundColor: 'rgba(216, 157, 185, 0.92)',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  upgradeCardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },
  upgradeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 26,
    padding: 15,
  },
  upgradeTextWrap: {
    flex: 1,
    paddingRight: 20,
    justifyContent: 'center',
  },
  upgradeTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  upgradeBody: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  upgradeArtWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  upgradeSparkleTop: {
    position: 'absolute',
    top: 10,
    right: 6,
  },
  upgradeSparkleBottom: {
    position: 'absolute',
    bottom: 10,
    left: 8,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 14,
  },
  grid: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },



});
