import type {
  WidgetConfiguration,
  WidgetRefreshFrequency,
} from '@/context/WidgetsContext';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const REFRESH_OPTIONS: {
  description: string;
  id: WidgetRefreshFrequency;
  label: string;
}[] = [
  { id: 'hourly', label: 'Hourly', description: '24 affirmations a day' },
  { id: 'frequently', label: 'Frequently', description: '12 affirmations a day' },
  { id: 'occasionally', label: 'Occasionally', description: '6 affirmations a day' },
  { id: 'daily', label: 'Affirmation of the day', description: '1 affirmation a day' },
];

function FrequencyOption({
  description,
  label,
  onPress,
  selected,
}: {
  description: string;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        selected && styles.optionCardSelected,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionTopRow}>
          <Text style={styles.optionTitle}>{label}</Text>
          <View style={[styles.radioOuter, selected && styles.radioOuterSelected]} />
        </View>
        <View style={styles.optionBottomRow}>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function WidgetFrequencyOptions({
  activeWidget,
  onUpdateWidget,
}: {
  activeWidget: WidgetConfiguration;
  onUpdateWidget: (
    id: string,
    updates: Partial<Omit<WidgetConfiguration, 'id'>>
  ) => void;
}) {
  return (
    <View style={styles.detailContent}>
      <Text style={styles.intro}>Set how often your widget refreshes</Text>

      <View style={styles.optionList}>
        {REFRESH_OPTIONS.map((option) => (
          <FrequencyOption
            key={option.id}
            description={option.description}
            label={option.label}
            onPress={() =>
              onUpdateWidget(activeWidget.id, {
                refreshFrequency: option.id,
              })
            }
            selected={activeWidget.refreshFrequency === option.id}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailContent: {
    flex: 1,
    paddingBottom: 24,
  },
  intro: {
    color: 'rgba(245, 247, 250, 0.86)',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  optionList: {
    gap: 50,
    marginTop: 75,
  },
  optionCard: {
    minHeight: 118,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  optionContent: {
    gap: 14,
  },
  optionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  optionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(245, 247, 250, 0.28)',
  },
  optionTitle: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 23,
    fontWeight: '700',
  },
  optionDescription: {
    flex: 1,
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 16,
    fontWeight: '600',
  },
  radioOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(245, 247, 250, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 5,
    borderColor: '#F5F7FA',
  },
  buttonPressed: {
    opacity: 0.92,
  },
});
