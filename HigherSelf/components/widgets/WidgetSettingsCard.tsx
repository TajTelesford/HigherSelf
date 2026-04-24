import type { WidgetConfiguration } from '@/context/WidgetsContext';
import { getWidgetTopicLabel } from '@/data/widgetTopics';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { WidgetSettingsTile } from './WidgetSettingsTile';

type WidgetDetailScreen = 'refresh' | 'theme' | 'topics';

export function WidgetSettingsCard({
  activeThemeName,
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
        onSwitchChange={(value) => onUpdateWidget(activeWidget.id, { enabled: value })}
        switchValue={activeWidget.enabled}
        withSwitch
      />
      <WidgetSettingsTile
        label="Topics"
        onPress={() => onOpenDetailScreen('topics')}
        value={getWidgetTopicLabel(activeWidget.topicIds)}
        withChevron
      />
      <WidgetSettingsTile
        label="Theme"
        onPress={() => onOpenDetailScreen('theme')}
        value={activeThemeName}
        withChevron
      />
      <WidgetSettingsTile
        label="Widget border"
        onSwitchChange={(value) => onUpdateWidget(activeWidget.id, { showBorder: value })}
        switchValue={activeWidget.showBorder}
        withSwitch
      />
      <WidgetSettingsTile
        label="Refresh"
        onPress={() => onOpenDetailScreen('refresh')}
        showDivider={false}
        withChevron
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: '#141A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
});
