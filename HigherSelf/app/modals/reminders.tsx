import { useReminders } from '@/context/RemindersContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RemindersScreen() {
  const { isLoaded, reminders, toggleReminder } = useReminders();

  return (
    <View style={styles.backdrop}>
      <Pressable onPress={() => router.back()} style={styles.dismissArea} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.circleButton}>
            <Ionicons color="#F5F7FA" name="chevron-back" size={24} />
          </Pressable>

          <Text style={styles.title}>Reminders</Text>

          <Pressable
            onPress={() => Alert.alert('COMING SOON')}
            style={[styles.circleButton, styles.addButton]}
          >
            <Ionicons color="#0B0F1A" name="add" size={28} />
          </Pressable>
        </View>

        <Text style={styles.intro}>
          Set up your daily reminders to make your affirmations fit your routine.
        </Text>

        {!isLoaded ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color="#8B7CFF" size="small" />
          </View>
        ) : (
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {reminders.map((reminder) => (
              <View
                key={reminder.id}
                style={[styles.card, reminder.locked && styles.cardLocked]}
              >
                <View style={styles.cardTopRow}>
                  <Text style={[styles.cardTitle, reminder.locked && styles.cardTitleLocked]}>
                    {reminder.title}
                  </Text>

                  <Text style={[styles.cardTime, reminder.locked && styles.metaLocked]}>
                    {reminder.scheduleLabel}
                  </Text>
                </View>

                <View style={styles.cardBottomRow}>
                  <Text style={[styles.cardMeta, reminder.locked && styles.metaLocked]}>
                    {reminder.frequencyLabel}
                  </Text>

                  <Switch
                    ios_backgroundColor="rgba(255,255,255,0.16)"
                    onValueChange={(value) => {
                      void toggleReminder(reminder.id, value);
                    }}
                    style={styles.switch}
                    thumbColor="#FFFFFF"
                    trackColor={{
                      false: 'rgba(255,255,255,0.16)',
                      true: 'rgba(120, 227, 187, 0.82)',
                    }}
                    value={reminder.enabled}
                    disabled={reminder.locked}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <Pressable
          onPress={() => Alert.alert('COMING SOON')}
          style={({ pressed }) => [styles.footerButton, pressed && styles.footerButtonPressed]}
        >
          <Text style={styles.footerButtonText}>Unlock more reminders</Text>
        </Pressable>
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
    minHeight: '70%',
    height: '92%',
    maxHeight: '92%',
    backgroundColor: '#121826',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#9CA3AF',
    opacity: 0.45,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 29,
    fontWeight: '700',
  },
  intro: {
    color: 'rgba(245, 247, 250, 0.86)',
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  circleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#F6EEEA',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 22,
    gap: 16,
  },
  card: {
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLocked: {
    opacity: 0.45,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    color: '#F5F7FA',
    fontSize: 23,
    fontWeight: '700',
    flex: 1,
  },
  cardTitleLocked: {
    color: 'rgba(245, 247, 250, 0.76)',
  },
  cardTime: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '700',
  },
  cardMeta: {
    color: 'rgba(245, 247, 250, 0.68)',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  metaLocked: {
    color: 'rgba(245, 247, 250, 0.54)',
  },
  switch: {
    transform: [{ scaleX: 1.05 }, { scaleY: 1.05 }],
  },
  footerButton: {
    minHeight: 72,
    borderRadius: 999,
    backgroundColor: '#F6EEEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  footerButtonText: {
    color: '#0B0F1A',
    fontSize: 17,
    fontWeight: '800',
  },
});
