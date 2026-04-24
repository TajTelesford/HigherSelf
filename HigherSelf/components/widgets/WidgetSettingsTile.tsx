import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

type WidgetSettingsTileProps = {
  label: string;
  onPress?: () => void;
  showDivider?: boolean;
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
  withChevron = false,
  withSwitch = false,
}: WidgetSettingsTileProps) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      {(withChevron || withSwitch) ? (
        <View style={styles.trailing}>
          {withChevron ? (
            <Ionicons color="#E6D6D0" name="chevron-forward" size={24} />
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
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, showDivider && styles.rowDivider]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        showDivider && styles.rowDivider,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28,
    flexShrink: 1,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
});

export default WidgetSettingsTile;
