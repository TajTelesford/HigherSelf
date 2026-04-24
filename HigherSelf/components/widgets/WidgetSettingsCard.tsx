import type { WidgetConfiguration } from '@/context/WidgetsContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { WidgetSettingsTile } from './WidgetSettingsTile';

type WidgetDetailScreen = 'refresh' | 'theme' | 'topics';

export function WidgetSettingsCard({
  activeWidget: _activeWidget,
  onOpenDetailScreen,
  onUpdateWidget: _onUpdateWidget,
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
        showDivider={true}
      />
      <WidgetSettingsTile
        label="Topics"
        onPress={() => onOpenDetailScreen('topics')}
        showDivider={true}
      />
      <WidgetSettingsTile
        label="Theme"
        onPress={() => onOpenDetailScreen('theme')}
        showDivider={true}
      />
      <WidgetSettingsTile
        label="Widget border"
        onPress={() => null}
        showDivider={true}
      />
      <WidgetSettingsTile
        label="Refresh"
        onPress={() => onOpenDetailScreen('refresh')}
        showDivider={true}
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
