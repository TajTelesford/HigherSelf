import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

type RecordMicrophoneButtonProps = {
  disabled?: boolean;
  isRecording: boolean;
  onPress: () => void | Promise<void>;
};

export default function RecordMicrophoneButton({
  disabled = false,
  isRecording,
  onPress,
}: RecordMicrophoneButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.recordButton,
        isRecording && styles.recordButtonActive,
        pressed && !disabled && styles.recordButtonPressed,
        disabled && styles.recordButtonDisabled,
      ]}
    >
      <View
        style={[
          styles.recordButtonInner,
          isRecording && styles.recordButtonInnerActive,
        ]}
      >
        <MaterialCommunityIcons
          color="#FFFFFF"
          name={isRecording ? 'stop' : 'microphone'}
          size={32}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  recordButton: {
    width: 118,
    height: 118,
    borderRadius: 59,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.24)',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(251, 113, 133, 0.16)',
    borderColor: 'rgba(253, 164, 175, 0.28)',
  },
  recordButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  recordButtonDisabled: {
    opacity: 0.7,
  },
  recordButtonInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  recordButtonInnerActive: {
    backgroundColor: '#EC4899',
  },
});
