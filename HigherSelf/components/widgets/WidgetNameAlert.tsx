import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

type WidgetNameAlertProps = {
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  visible: boolean;
};

export function WidgetNameAlert({
  initialName,
  onClose,
  onSave,
  visible,
}: WidgetNameAlertProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [initialName, visible]);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(trimmedName);
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable onPress={onClose} style={styles.dismissArea} />

        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.backButton}
            >
              <Ionicons color="#F5F7FA" name="chevron-back" size={32} />
            </Pressable>

            <Text style={styles.title}>Rename widget</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              Choose a new name for this widget configuration.
            </Text>

            <TextInput
              autoFocus
              onChangeText={setName}
              placeholder="Widget configuration"
              placeholderTextColor="rgba(245, 247, 250, 0.48)"
              returnKeyType="done"
              selectionColor="#F5F7FA"
              style={styles.input}
              value={name}
              onSubmitEditing={handleSave}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={handleSave}
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
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
    minHeight: '72%',
    backgroundColor: '#121826',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    paddingTop: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  content: {
    paddingTop: 84,
  },
  description: {
    color: 'rgba(245, 247, 250, 0.82)',
    fontSize: 24,
    lineHeight: 34,
  },
  input: {
    minHeight: 78,
    borderRadius: 16,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '500',
    marginTop: 34,
    paddingHorizontal: 28,
  },
  saveButton: {
    height: 50,
    borderRadius: 39,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  saveButtonDisabled: {
    opacity: 0.56,
  },
  saveButtonText: {
    color: '#0B0F1A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default WidgetNameAlert;
