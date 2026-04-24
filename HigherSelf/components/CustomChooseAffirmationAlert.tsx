import type { Affirmation } from '@/types/affirmations';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type PracticeTab = 'saved' | 'custom';

type CustomChooseAffirmationAlertProps = {
  customAffirmations: Affirmation[];
  onClose: () => void;
  onGoToRecording: () => void;
  onToggleAffirmation: (affirmation: Affirmation) => void;
  queuedAffirmations: Affirmation[];
  savedAffirmations: Affirmation[];
  visible: boolean;
};

const PRACTICE_TABS: { id: PracticeTab; label: string }[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'custom', label: 'My Own' },
];

export default function CustomChooseAffirmationAlert({
  customAffirmations,
  onClose,
  onGoToRecording,
  onToggleAffirmation,
  queuedAffirmations,
  savedAffirmations,
  visible,
}: CustomChooseAffirmationAlertProps) {
  const [activeTab, setActiveTab] = useState<PracticeTab>('saved');

  useEffect(() => {
    if (visible) {
      setActiveTab('saved');
    }
  }, [visible]);

  const affirmationsByTab = useMemo(
    () => ({
      saved: savedAffirmations,
      custom: customAffirmations,
    }),
    [customAffirmations, savedAffirmations]
  );

  const visibleAffirmations = affirmationsByTab[activeTab];
  const queuedIds = useMemo(
    () => new Set(queuedAffirmations.map((affirmation) => affirmation.id)),
    [queuedAffirmations]
  );

  const renderAffirmationCard = ({ item }: { item: Affirmation }) => {
    const selected = queuedIds.has(item.id);
    const isCustomTab = activeTab === 'custom';

    return (
      <View
        style={[
          styles.affirmationCard,
          isCustomTab && styles.affirmationCardCustom,
          selected && styles.affirmationCardSelected,
        ]}
      >
        <Text style={styles.affirmationCardText}>{item.text}</Text>

        <Pressable
          accessibilityLabel={
            selected ? 'Remove affirmation from queue' : 'Add affirmation to queue'
          }
          onPress={() => onToggleAffirmation(item)}
          style={({ pressed }) => [
            styles.addButton,
            selected && styles.addButtonSelected,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Ionicons
            color="#F5F7FA"
            name={selected ? 'checkmark' : 'add'}
            size={22}
          />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Choose Affirmations</Text>
              <Text style={styles.modalSubtitle}>
                Add the affirmations you want to recite today.
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons color="#F5F7FA" name="close" size={22} />
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            <View style={styles.tabSwitcher}>
              {PRACTICE_TABS.map((tab) => {
                const isActive = tab.id === activeTab;

                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  >
                    <Text
                      style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={styles.tabMetaText}>
            {affirmationsByTab[activeTab].length} affirmation
            {affirmationsByTab[activeTab].length === 1 ? '' : 's'}
          </Text>

          <View style={styles.listRegion}>
            {visibleAffirmations.length ? (
              <FlatList
                contentContainerStyle={styles.affirmationListContent}
                data={visibleAffirmations}
                keyExtractor={(item) => item.id}
                renderItem={renderAffirmationCard}
                ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                showsVerticalScrollIndicator={false}
                style={styles.affirmationList}
              />
            ) : (
              <View style={styles.emptyTabState}>
                <Text style={styles.emptyTabTitle}>
                  {activeTab === 'saved'
                    ? 'No saved affirmations yet'
                    : 'No custom affirmations yet'}
                </Text>
                <Text style={styles.emptyTabCopy}>
                  {activeTab === 'saved'
                    ? 'Liked affirmations from the home screen will appear here.'
                    : 'Affirmations you create yourself will appear in this tab.'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <View style={styles.queueCountPill}>
              <Text style={styles.queueCountText}>
                {queuedAffirmations.length} Affirmation
                {queuedAffirmations.length === 1 ? '' : 's'} Ready
              </Text>
            </View>

            <Pressable
              disabled={!queuedAffirmations.length}
              onPress={onGoToRecording}
              style={[
                styles.primaryButton,
                !queuedAffirmations.length && styles.primaryButtonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>Go To Recording</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    height: '86%',
    borderRadius: 28,
    backgroundColor: '#101726',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  modalTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#C6CDD8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 260,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 4,
  },
  tabButton: {
    minWidth: 116,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
  },
  tabButtonText: {
    color: '#C6CDD8',
    fontSize: 15,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#F5F7FA',
  },
  tabMetaText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  listRegion: {
    flex: 1,
    minHeight: 220,
  },
  affirmationListContent: {
    paddingBottom: 18,
    paddingTop: 2,
  },
  affirmationList: {
    flex: 1,
  },
  affirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  affirmationCardCustom: {
    borderColor: '#F4C95D',
    borderWidth: 1.5,
  },
  affirmationCardSelected: {
    borderColor: '#F4C95D',
    borderWidth: 1.5,
  },
  affirmationCardText: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  addButtonSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.55)',
    borderColor: 'rgba(167, 139, 250, 0.38)',
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  listSeparator: {
    height: 12,
  },
  emptyTabState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  emptyTabTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyTabCopy: {
    color: '#C6CDD8',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  modalFooter: {
    paddingTop: 16,
    gap: 14,
    alignItems: 'center',
  },
  queueCountPill: {
    minWidth: 210,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  queueCountText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    minWidth: 220,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
  },
});
