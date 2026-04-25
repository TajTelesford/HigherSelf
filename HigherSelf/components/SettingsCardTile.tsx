import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SettingsCard = {
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  title: string;
};

export const SettingsCardTile = ({ description, icon, onPress, title }: SettingsCard) => {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{description}</Text>
        </View>

        <View style={styles.iconWrap}>
          <MaterialCommunityIcons color="rgba(220, 112, 234, 0.82)" name={icon} size={34} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 120,
    borderRadius: 26,
    backgroundColor: 'rgba(34, 56, 86, 0.96)',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(188, 220, 255, 0.18)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
