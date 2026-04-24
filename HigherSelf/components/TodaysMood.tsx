import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MoodOption } from './MoodPicker';

type TodaysMoodProps = {
  mood?: MoodOption;
  onConfirmUpdate: () => void;
};

export function TodaysMood({ mood, onConfirmUpdate }: TodaysMoodProps) {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const handleCardPress = () => {
    setShowUpdatePrompt(true);
  };

  const handleDismissPrompt = () => {
    setShowUpdatePrompt(false);
  };

  const handleConfirmUpdate = () => {
    setShowUpdatePrompt(false);
    onConfirmUpdate();
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        onRequestClose={handleDismissPrompt}
        transparent
        visible={showUpdatePrompt}
      >
        <View style={styles.modalOverlay}>
          <Pressable onPress={handleDismissPrompt} style={styles.modalBackdrop} />

          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Update today&apos;s mood?</Text>
            <Text style={styles.alertText}>
              You already saved a mood for today. Do you want to change it?
            </Text>

            <View style={styles.alertActions}>
              <Pressable onPress={handleDismissPrompt} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Not now</Text>
              </Pressable>

              <Pressable onPress={handleConfirmUpdate} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Update mood</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Pressable onPress={handleCardPress} style={styles.todayMoodCard}>
        <Text style={styles.sectionLabel}>Today&apos;s mood</Text>

        <View style={styles.todayMoodRow}>
          <View
            style={[
              styles.todayMoodIcon,
              { backgroundColor: `${mood?.accent ?? '#9CA3AF'}26` },
            ]}
          >
            <Ionicons
              color={mood?.accent ?? '#9CA3AF'}
              name={mood?.icon ?? 'help-circle-outline'}
              size={34}
            />
          </View>

          <View style={styles.todayMoodTextWrap}>
            <Text style={styles.todayMoodLabel}>{mood?.label ?? 'Unknown'}</Text>
            <Text style={styles.todayMoodDescription}>
              Saved for{' '}
              {new Date().toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.todayMoodHint}>Tap to update today&apos;s mood.</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 220,
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 11, 20, 0.45)',
  },
  alertCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1A2334',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  alertTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  alertText: {
    color: '#D9E1EC',
    fontSize: 14,
    lineHeight: 20,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryButtonText: {
    color: '#D9E1EC',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
  },
  primaryButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  todayMoodCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionLabel: {
    color: '#C6CDD8',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  todayMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  todayMoodIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayMoodTextWrap: {
    flex: 1,
  },
  todayMoodLabel: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  todayMoodDescription: {
    color: '#D9E1EC',
    fontSize: 15,
    lineHeight: 22,
  },
  todayMoodHint: {
    color: '#AAB4C3',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
});
