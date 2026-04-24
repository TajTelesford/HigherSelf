import { WidgetFrequencyOptions } from '@/components/widgets/WidgetFrequencyOptions';
import { WidgetHomeContent } from '@/components/widgets/WidgetHomeContent';
import { WidgetIconCircleButton } from '@/components/widgets/WidgetIconCircleButton';
import { WidgetThemePanel } from '@/components/widgets/WidgetThemePanel';
import { WidgetTopicsPanel } from '@/components/widgets/WidgetTopicsPanel';
import { useAffirmationCollections } from '@/context/AffirmationCollectionsContext';
import { useCustomAffirmations } from '@/context/CustomAffirmationsContext';
import { useWidgets } from '@/context/WidgetsContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WidgetDetailScreen = 'home' | 'refresh' | 'theme' | 'topics';

export default function WidgetsScreen() {
  const { customAffirmations } = useCustomAffirmations();
  const { collections } = useAffirmationCollections();
  const {
    activeWidgetId,
    createWidgetConfiguration,
    deleteWidgetConfiguration,
    selectWidgetConfiguration,
    updateWidgetConfiguration,
    widgetConfigurations,
  } = useWidgets();
  const [detailScreen, setDetailScreen] = useState<WidgetDetailScreen>('home');

  const activeWidget =
    widgetConfigurations.find((configuration) => configuration.id === activeWidgetId) ??
    widgetConfigurations[0];

  const handleBack = () => {
    if (detailScreen !== 'home') {
      setDetailScreen('home');
      return;
    }

    router.back();
  };

  const handleDeleteWidget = () => {
    if (!activeWidget) {
      return;
    }

    if (widgetConfigurations.length <= 1) {
      Alert.alert('Keep one widget', 'Create another widget before deleting this one.');
      return;
    }

    Alert.alert(
      'Delete widget?',
      `${activeWidget.name} will be removed from this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWidgetConfiguration(activeWidget.id),
        },
      ]
    );
  };

  let title = 'Widgets';
  if (detailScreen === 'topics') {
    title = 'Topics';
  } else if (detailScreen === 'theme') {
    title = 'Theme';
  } else if (detailScreen === 'refresh') {
    title = 'Refresh frequency';
  }

  const content =
    detailScreen === 'topics' ? (
      <WidgetTopicsPanel
        activeWidget={activeWidget}
        onUpdateWidget={updateWidgetConfiguration}
      />
    ) : detailScreen === 'theme' ? (
      <WidgetThemePanel
        activeWidget={activeWidget}
        onUpdateWidget={updateWidgetConfiguration}
      />
    ) : detailScreen === 'refresh' ? (
      <WidgetFrequencyOptions
        activeWidget={activeWidget}
        onUpdateWidget={updateWidgetConfiguration}
      />
    ) : (
      <WidgetHomeContent
        activeWidget={activeWidget}
        collections={collections}
        customAffirmations={customAffirmations}
        onDeleteWidget={handleDeleteWidget}
        onOpenDetailScreen={setDetailScreen}
        onSelectWidget={selectWidgetConfiguration}
        onUpdateWidget={updateWidgetConfiguration}
        widgetConfigurations={widgetConfigurations}
      />
    );

  return (
    <View style={styles.backdrop}>
      <Pressable onPress={() => router.back()} style={styles.dismissArea} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.panel}>
          <View style={styles.header}>
            <WidgetIconCircleButton icon="chevron-back" onPress={handleBack} />
            <Text style={styles.title}>{title}</Text>
            <WidgetIconCircleButton
              icon="add"
              onPress={() => {
                createWidgetConfiguration();
                setDetailScreen('home');
              }}
            />
          </View>

          {content}
        </View>
      </SafeAreaView>
    </View>
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
    minHeight: '70%',
    height: '92%',
    maxHeight: '92%',
    backgroundColor: '#121826',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#9CA3AF',
    opacity: 0.45,
    marginBottom: 18,
  },
  panel: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 29,
    fontWeight: '700',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
