import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type WidgetSettingsTileProps = {
  label: string;
  onPress?: () => void;
  showDivider?: boolean;
};

export function WidgetSettingsTile({
  label,
  onPress,
  showDivider = true,
}: WidgetSettingsTileProps) {
  const content = <Text style={styles.label}>{label}</Text>;

  if (!onPress) {
    return <View style={[styles.row, showDivider && styles.rowDivider]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        styles.rowDivider,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rowPressed: {
    opacity: 0.88,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28,
  },
});

export default WidgetSettingsTile;
