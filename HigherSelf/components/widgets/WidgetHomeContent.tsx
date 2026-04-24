import type { WidgetConfiguration } from '@/context/WidgetsContext';
import type { Affirmation } from '@/types/affirmations';
import type { AffirmationCollection } from '@/types/collections';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import {
  getPreviewAffirmation,
  getThemeById,
  type WidgetPreviewKind,
} from './widgetPreviewUtils';
import { WidgetSettingsCard } from './WidgetSettingsCard';

type WidgetDetailScreen = 'refresh' | 'theme' | 'topics';

function WidgetPreview({
  affirmation,
  kind,
  showBorder,
  themeId,
}: {
  affirmation: string;
  kind: WidgetPreviewKind;
  showBorder: boolean;
  themeId: string;
}) {
  const theme = getThemeById(themeId);
  const isMedium = kind === 'medium';

  return (
    <View
      style={[
        styles.widgetPreview,
        isMedium && styles.widgetPreviewMedium,
        showBorder && styles.widgetPreviewBorder,
      ]}
    >
      <ExpoImage
        contentFit="cover"
        source={theme.image}
        style={StyleSheet.absoluteFillObject}
        transition={0}
      />
      <View style={[StyleSheet.absoluteFillObject, styles.widgetPreviewOverlay]} />
      <Text numberOfLines={2} style={[styles.widgetPreviewText, isMedium && styles.widgetPreviewTextMedium]}>
        {affirmation.toUpperCase()}
      </Text>
    </View>
  );
}

function DevicePreviewCard({
  affirmation,
  pageWidth,
  showBorder,
  themeId,
}: {
  affirmation: string;
  pageWidth: number;
  showBorder: boolean;
  themeId: string;
}) {
  return (
    <View style={[styles.previewPage, { width: pageWidth }]}>
      <View style={styles.phoneShell}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneShellInner}>
          <WidgetPreview
            affirmation={affirmation}
            kind="medium"
            showBorder={showBorder}
            themeId={themeId}
          />
        </View>
        <LinearGradient
          colors={[
            'rgba(139, 124, 255, 0.2)',
            'rgba(139, 124, 255, 0.08)',
            'rgba(139, 124, 255, 0)',
          ]}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          style={styles.phoneShellSideFadeLeft}
        />
        <LinearGradient
          colors={[
            'rgba(139, 124, 255, 0.2)',
            'rgba(139, 124, 255, 0.08)',
            'rgba(139, 124, 255, 0)',
          ]}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          style={styles.phoneShellSideFadeRight}
        />
        <LinearGradient
          colors={[
            'rgba(20, 28, 43, 0)',
            'rgba(20, 28, 43, 0.74)',
            'rgba(18, 24, 38, 0.94)',
          ]}
          pointerEvents="none"
          style={styles.phoneShellBottomFade}
        />
      </View>
    </View>
  );
}

export function WidgetHomeContent({
  activeWidget,
  collections,
  customAffirmations,
  onDeleteWidget,
  onOpenDetailScreen,
  onSelectWidget,
  onUpdateWidget,
  widgetConfigurations,
}: {
  activeWidget: WidgetConfiguration;
  collections: AffirmationCollection[];
  customAffirmations: Affirmation[];
  onDeleteWidget: () => void;
  onOpenDetailScreen: (screen: WidgetDetailScreen) => void;
  onSelectWidget: (id: string) => void;
  onUpdateWidget: (
    id: string,
    updates: Partial<Omit<WidgetConfiguration, 'id'>>
  ) => void;
  widgetConfigurations: WidgetConfiguration[];
}) {
  const { width } = useWindowDimensions();
  const previewViewportWidth = width - 40;
  const previewListRef = useRef<FlatList<WidgetConfiguration> | null>(null);
  const activeWidgetIndex = Math.max(
    0,
    widgetConfigurations.findIndex((configuration) => configuration.id === activeWidget.id)
  );
  const activeTheme = getThemeById(activeWidget.themeId);

  useEffect(() => {
    previewListRef.current?.scrollToOffset({
      animated: true,
      offset: previewViewportWidth * activeWidgetIndex,
    });
  }, [activeWidgetIndex, previewViewportWidth]);

  return (
    <View style={styles.homeContent}>
      <Text style={styles.intro}>Set up your Home Screen widget</Text>

      <View style={styles.previewShell}>
        <FlatList
          ref={previewListRef}
          data={widgetConfigurations}
          decelerationRate="fast"
          disableIntervalMomentum
          getItemLayout={(_, index) => ({
            index,
            length: previewViewportWidth,
            offset: previewViewportWidth * index,
          })}
          horizontal
          pagingEnabled
          contentContainerStyle={styles.previewListContent}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          style={styles.previewList}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / previewViewportWidth
            );
            const nextWidget = widgetConfigurations[nextIndex];

            if (nextWidget) {
              onSelectWidget(nextWidget.id);
            }
          }}
          renderItem={({ item }: ListRenderItemInfo<WidgetConfiguration>) => (
            <DevicePreviewCard
              affirmation={getPreviewAffirmation(item, customAffirmations, collections)}
              pageWidth={previewViewportWidth}
              showBorder={item.showBorder}
              themeId={item.themeId}
            />
          )}
        />
        <LinearGradient
          colors={['rgba(18, 24, 38, 0)', 'rgba(18, 24, 38, 0.94)']}
          pointerEvents="none"
          style={styles.previewFade}
        />
      </View>

      <Text style={styles.previewHelper}>
        Your widget reflects the settings you select below.
      </Text>

      <View style={styles.pagination}>
        {widgetConfigurations.map((configuration, index) => (
          <Pressable
            key={configuration.id}
            onPress={() => onSelectWidget(configuration.id)}
            style={[
              styles.paginationDot,
              index === activeWidgetIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.configurationTitleRow}>
        <Ionicons color="#F6EAE4" name="create-outline" size={28} />
        <Text style={styles.configurationTitle}>{activeWidget.name}</Text>
      </View>

      <WidgetSettingsCard
        activeThemeName={activeTheme.name}
        activeWidget={activeWidget}
        onOpenDetailScreen={onOpenDetailScreen}
        onUpdateWidget={onUpdateWidget}
      />

      {widgetConfigurations.length > 1 ? (
        <Pressable onPress={onDeleteWidget} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Delete Widget</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  homeContent: {
    flex: 1,
  },
  intro: {
    color: '#F5F7FA',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  previewShell: {
    height: 250,
    marginTop: 0,
    overflow: 'hidden',
  },
  previewList: {
    flex: 1,
  },
  previewListContent: {
    alignItems: 'center',
  },
  previewPage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneShell: {
    width: '72%',
    height: 300,
    borderRadius: 48,
    backgroundColor: 'rgba(20, 28, 43, 0.78)',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(139, 124, 255, 0.2)',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  phoneShellInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
  },
  phoneNotch: {
    alignSelf: 'center',
    width: 116,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(11, 15, 26, 0.92)',
    marginBottom: 14,
  },
  phoneShellSideFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },
  phoneShellSideFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },
  phoneShellBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  widgetPreview: {
    width: 210,
    height: 210,
    borderRadius: 34,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  widgetPreviewMedium: {
    width: 220,
    height: 220,
  },
  widgetPreviewBorder: {
    borderWidth: 4,
    borderColor: '#F5F7FA',
  },
  widgetPreviewOverlay: {
    backgroundColor: 'rgba(4, 10, 18, 0.12)',
  },
  widgetPreviewText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.32)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  widgetPreviewTextMedium: {
    maxWidth: '78%',
    fontSize: 16,
    lineHeight: 20,
  },
  previewFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  previewHelper: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: -6,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  paginationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  paginationDotActive: {
    backgroundColor: '#F2C94C',
  },
  configurationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  configurationTitle: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '700',
    flexShrink: 1,
  },
  saveButton: {
    height: 44,
    borderRadius: 39,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  saveButtonText: {
    color: '#0B0F1A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
