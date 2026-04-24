import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

type WidgetSettingsTileProps = {
  label: string;
  onPress?: () => void;
  showDivider?: boolean;
  value?: string;
  valueMode?: 'accent' | 'muted';
  withChevron?: boolean;
  withSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

export function WidgetSettingsTile({
  label,
  onPress,
  onSwitchChange,
  showDivider = true,
  switchValue = false,
  value,
  valueMode = 'muted',
  withChevron = false,
  withSwitch = false,
}: WidgetSettingsTileProps) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.trailing}>
        {typeof value === 'string' ? (
          <Text style={[styles.value, valueMode === 'accent' && styles.valueAccent]}>
            {value}
          </Text>
        ) : null}

        {withChevron ? (
          <Ionicons
            color="#E6D6D0"
            name="chevron-forward"
            size={24}
            style={styles.chevron}
          />
        ) : null}

        {withSwitch ? (
          <Switch
            ios_backgroundColor="rgba(255,255,255,0.16)"
            onValueChange={onSwitchChange}
            thumbColor="#FFFFFF"
            trackColor={{
              false: 'rgba(255,255,255,0.16)',
              true: 'rgba(126, 205, 176, 0.92)',
            }}
            value={switchValue}
          />
        ) : null}
      </View>
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, showDivider && styles.rowDivider]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 92,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flexShrink: 1,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 180,
    marginLeft: 16,
  },
  value: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 20,
    fontWeight: '500',
  },
  valueAccent: {
    color: '#F5F7FA',
  },
  chevron: {
    marginLeft: 12,
  },
});

export default WidgetSettingsTile;
