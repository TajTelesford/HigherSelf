import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type MoodOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
};

type MoodPickerProps = {
  isLocked: boolean;
  moods: MoodOption[];
  onSelectMood: (moodId: string) => void;
  selectedMoodId: string | null;
};

export function MoodPicker({
  isLocked,
  moods,
  onSelectMood,
  selectedMoodId,
}: MoodPickerProps) {
  return (
    <View style={styles.moodGrid}>
      {moods.map((mood) => {
        const isSelected = mood.id === selectedMoodId;

        return (
          <Pressable
            key={mood.id}
            accessibilityRole="button"
            disabled={isLocked}
            onPress={() => onSelectMood(mood.id)}
            style={[
              styles.moodCard,
              isSelected && [
                styles.moodCardSelected,
                {
                  borderColor: mood.accent,
                  backgroundColor: `${mood.accent}22`,
                },
              ],
              isLocked && !isSelected && styles.moodCardDisabled,
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: `${mood.accent}26` },
                isSelected && { backgroundColor: mood.accent },
              ]}
            >
              <Ionicons
                color={isSelected ? '#0F172A' : mood.accent}
                name={mood.icon}
                size={28}
              />
            </View>

            <Text
              style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}
            >
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  moodCard: {
    width: '47%',
    minHeight: 138,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCardSelected: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  moodCardDisabled: {
    opacity: 0.48,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  moodLabel: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
  },
  moodLabelSelected: {
    color: '#FFFFFF',
  },
});
