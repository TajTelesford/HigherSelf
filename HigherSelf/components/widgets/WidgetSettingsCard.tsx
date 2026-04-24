import type { WidgetConfiguration } from '@/context/WidgetsContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { WidgetSettingsTile } from './WidgetSettingsTile';

type WidgetDetailScreen = 'refresh' | 'theme' | 'topics';

export function WidgetSettingsCard({
  activeThemeName: _activeThemeName,
  activeWidget,
  onOpenDetailScreen,
  onUpdateWidget,
}: {
  activeThemeName: string;
  activeWidget: WidgetConfiguration;
  onOpenDetailScreen: (screen: WidgetDetailScreen) => void;
  onUpdateWidget: (
    id: string,
    updates: Partial<Omit<WidgetConfiguration, 'id'>>
  ) => void;
}) {
  return (
    <View style={styles.card}>
      <WidgetSettingsTile
        label="Customize"
        onPress={() => null}
        onSwitchChange={(value) => onUpdateWidget(activeWidget.id, { enabled: value })}
        showDivider={true}
        switchValue={activeWidget.enabled}
        withSwitch
      />
      <WidgetSettingsTile
        label="Topics"
        onPress={() => onOpenDetailScreen('topics')}
        showDivider={true}
        withChevron
      />
      <WidgetSettingsTile
        label="Theme"
        onPress={() => onOpenDetailScreen('theme')}
        showDivider={true}
        withChevron
      />
      <WidgetSettingsTile
        label="Widget border"
        onPress={() => null}
        onSwitchChange={(value) => onUpdateWidget(activeWidget.id, { showBorder: value })}
        showDivider={true}
        switchValue={activeWidget.showBorder}
        withSwitch
      />
      <WidgetSettingsTile
        label="Refresh"
        onPress={() => onOpenDetailScreen('refresh')}
        showDivider={true}
        withChevron
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 280,
    borderRadius: 24,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
});
