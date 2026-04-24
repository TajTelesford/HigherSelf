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
      <View style={styles.optionTextWrap}>
        <Text style={styles.optionTitle}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
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
    color: '#F5F7FA',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  optionList: {
    gap: 18,
    marginTop: 6,
  },
  optionCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.18)',
    paddingHorizontal: 22,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(139, 124, 255, 0.18)',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
  },
  optionDescription: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 18,
    marginTop: 8,
  },
  radioOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: 'rgba(245, 247, 250, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#F2C94C',
  },
  radioInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F2C94C',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
