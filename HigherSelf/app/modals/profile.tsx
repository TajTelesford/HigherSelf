import { LibraryContentCard } from '@/components/LibraryContentCard';
import { ProfileCardTile } from '@/components/ProfileCardTile';
import { UnlockAllCardSection } from '@/components/UnlockAllCardSection';
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
    title: 'Widgets',
    icon: 'tablet-dashboard',
    onPress: () => Alert.alert('Widgets', 'Widget setup is coming next.'),
  },
];

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

          <UnlockAllCardSection text='Access all topics, affirmations, themes, and remove ads!' />

          <UserStreak />

          <Text style={styles.sectionTitle}>Customize the app</Text>

          <View style={styles.grid}>
            {PROFILE_CARDS.map((card) => (
              <ProfileCardTile key={card.title} {...card} />
            ))}
          </View>
          <LibraryContentCard content="Jump into your saved content hub and manage everything from one place." />

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
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    gap: 8,
  },
});
