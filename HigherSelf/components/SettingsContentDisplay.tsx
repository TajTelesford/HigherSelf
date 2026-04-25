import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SettingsContentDisplayProps = {
  text?: string;
};

export function SettingsContentDisplay({
  text = 'Open settings to manage reminders, customization tools, and advanced options.',
}: SettingsContentDisplayProps) {
  const handlePress = () => {
    router.dismissAll();
    router.push('/modals/settings');
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.body}>{text}</Text>
        </View>

        <View style={styles.artWrap}>
          <Ionicons name="settings-outline" size={56} color="rgba(188, 220, 255, 0.9)" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 132,
    borderRadius: 26,
    backgroundColor: 'rgba(34, 56, 86, 0.96)',
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(188, 220, 255, 0.24)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 26,
    padding: 15,
  },
  textWrap: {
    flex: 1,
    paddingRight: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  artWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
