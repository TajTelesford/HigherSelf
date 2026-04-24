import { useCustomAffirmations } from '@/context/CustomAffirmationsContext';
import {
  useWidgets,
  type WidgetConfiguration,
  type WidgetRefreshFrequency,
} from '@/context/WidgetsContext';
import {
  getAffirmationsForWidgetTopics,
  getWidgetTopicLabel,
  WIDGET_TOPICS,
} from '@/data/widgetTopics';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEMES, type ThemeItem } from '../../data/themes';

type WidgetDetailScreen = 'home' | 'refresh' | 'theme' | 'topics';
type WidgetPreviewKind = 'medium';

const REFRESH_OPTIONS: {
  description: string;
  id: WidgetRefreshFrequency;
  label: string;
}[] = [
  { id: 'hourly', label: 'Hourly', description: '24 affirmations a day' },
  { id: 'frequently', label: 'Frequently', description: '12 affirmations a day' },
  { id: 'occasionally', label: 'Occasionally', description: '6 affirmations a day' },
  { id: 'daily', label: 'Affirmation of the day', description: '1 affirmation a day' },
];

function getPreviewAffirmation(
  configuration: WidgetConfiguration,
  customAffirmations: ReturnType<typeof useCustomAffirmations>['customAffirmations']
) {
  const affirmations = getAffirmationsForWidgetTopics(configuration.topicIds, {
    customAffirmations,
  });

  if (affirmations.length === 0) {
    return 'Your affirmations will appear here.';
  }

  const date = new Date();
  const hourBucket =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate() +
    date.getHours();

  const dayBucket =
    date.getFullYear() * 1000 +
    Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

  const seed =
    configuration.refreshFrequency === 'daily'
      ? dayBucket
      : configuration.refreshFrequency === 'occasionally'
        ? Math.floor(hourBucket / 4)
        : configuration.refreshFrequency === 'frequently'
          ? Math.floor(hourBucket / 2)
          : hourBucket;

  return affirmations[seed % affirmations.length]?.text ?? affirmations[0].text;
}

function getThemeById(themeId: string) {
  return THEMES.find((theme) => theme.id === themeId) ?? THEMES[0];
}

function IconCircleButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}>
      <Ionicons color="#F8F0EB" name={icon} size={28} />
    </Pressable>
  );
}

function SectionRow({
  label,
  onPress,
  trailing,
}: {
  label: string;
  onPress?: () => void;
  trailing: React.ReactNode;
}) {
  const content = (
    <>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowTrailing}>{trailing}</View>
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      {content}
    </Pressable>
  );
}

function WidgetPreview({
  affirmation,
  kind,
  showBorder,
  theme,
}: {
  affirmation: string;
  kind: WidgetPreviewKind;
  showBorder: boolean;
  theme: ThemeItem;
}) {
  const isMedium = kind === 'medium';

  return (
    <View
      style={[
        styles.widgetPreview,
        isMedium && styles.widgetPreviewMedium,
        showBorder && styles.widgetPreviewBorder,
      ]}
    >
      <ExpoImage contentFit="cover" source={theme.image} style={StyleSheet.absoluteFillObject} transition={0} />
      <View style={[StyleSheet.absoluteFillObject, styles.widgetPreviewOverlay]} />
      <Text
        numberOfLines={2}
        style={[
          styles.widgetPreviewText,
          isMedium && styles.widgetPreviewTextMedium,
        ]}
      >
        {affirmation.toUpperCase()}
      </Text>
    </View>
  );
}

function DevicePreviewCard({
  affirmation,
  kind,
  theme,
  showBorder,
  pageWidth,
}: {
  affirmation: string;
  kind: WidgetPreviewKind;
  theme: ThemeItem;
  showBorder: boolean;
  pageWidth: number;
}) {
  return (
    <View style={[styles.previewPage, { width: pageWidth }]}>
      <View style={styles.phoneShell}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneShellInner}>
          <WidgetPreview
            affirmation={affirmation}
            kind={kind}
            showBorder={showBorder}
            theme={theme}
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

function FrequencyOption({
  description,
  label,
  onPress,
  selected,
}: {
  description: string;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        selected && styles.optionCardSelected,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.optionTextWrap}>
        <Text style={styles.optionTitle}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

export default function WidgetsScreen() {
  const { width } = useWindowDimensions();
  const previewViewportWidth = width - 40;
  const previewListRef = useRef<FlatList<WidgetConfiguration> | null>(null);
  const { customAffirmations, loading } = useCustomAffirmations();
  const {
    activeWidgetId,
    createWidgetConfiguration,
    deleteWidgetConfiguration,
    isLoaded,
    selectWidgetConfiguration,
    updateWidgetConfiguration,
    widgetConfigurations,
  } = useWidgets();
  const [detailScreen, setDetailScreen] = useState<WidgetDetailScreen>('home');

  const activeWidget =
    widgetConfigurations.find((configuration) => configuration.id === activeWidgetId) ??
    widgetConfigurations[0];
  const activeWidgetIndex = Math.max(
    0,
    widgetConfigurations.findIndex((configuration) => configuration.id === activeWidget?.id)
  );

  const activeTheme = getThemeById(activeWidget?.themeId ?? THEMES[0].id);

  useEffect(() => {
    if (detailScreen !== 'home') {
      return;
    }

    previewListRef.current?.scrollToOffset({
      animated: true,
      offset: previewViewportWidth * activeWidgetIndex,
    });
  }, [activeWidgetIndex, detailScreen, previewViewportWidth]);

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

  const renderHomeScreen = () => (
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
              selectWidgetConfiguration(nextWidget.id);
            }
          }}
          renderItem={({ item }: ListRenderItemInfo<WidgetConfiguration>) => (
            <DevicePreviewCard
              affirmation={getPreviewAffirmation(item, customAffirmations)}
              kind="medium"
              pageWidth={previewViewportWidth}
              showBorder={item.showBorder}
              theme={getThemeById(item.themeId)}
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
            onPress={() => {
              selectWidgetConfiguration(configuration.id);
            }}
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

      <View style={styles.settingsCard}>
        <SectionRow
          label="Customize"
          trailing={
            <Switch
              ios_backgroundColor="rgba(255,255,255,0.16)"
              onValueChange={(value) =>
                updateWidgetConfiguration(activeWidget.id, { enabled: value })
              }
              thumbColor="#FFFFFF"
              trackColor={{
                false: 'rgba(255,255,255,0.16)',
                true: 'rgba(126, 205, 176, 0.92)',
              }}
              value={activeWidget.enabled}
            />
          }
        />
        <SectionRow
          label="Topics"
          onPress={() => setDetailScreen('topics')}
          trailing={
            <>
              <Text style={styles.rowValue}>{getWidgetTopicLabel(activeWidget.topicIds)}</Text>
              <Ionicons color="#E6D6D0" name="chevron-forward" size={24} />
            </>
          }
        />
        <SectionRow
          label="Theme"
          onPress={() => setDetailScreen('theme')}
          trailing={
            <>
              <Text style={styles.rowValue}>{activeTheme.name}</Text>
              <Ionicons color="#E6D6D0" name="chevron-forward" size={24} />
            </>
          }
        />
        <SectionRow
          label="Widget border"
          trailing={
            <Switch
              ios_backgroundColor="rgba(255,255,255,0.16)"
              onValueChange={(value) =>
                updateWidgetConfiguration(activeWidget.id, { showBorder: value })
              }
              thumbColor="#FFFFFF"
              trackColor={{
                false: 'rgba(255,255,255,0.16)',
                true: 'rgba(126, 205, 176, 0.92)',
              }}
              value={activeWidget.showBorder}
            />
          }
        />
        <SectionRow
          label="Refresh"
          onPress={() => setDetailScreen('refresh')}
          trailing={
            <>
              <Text style={styles.rowValue}>
                {REFRESH_OPTIONS.find((option) => option.id === activeWidget.refreshFrequency)
                  ?.label ?? 'Hourly'}
              </Text>
              <Ionicons color="#E6D6D0" name="chevron-forward" size={24} />
            </>
          }
        />
      </View>

      {widgetConfigurations.length > 1 ? (
        <Pressable
          onPress={handleDeleteWidget}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Delete Widget</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const renderRefreshScreen = () => (
    <View style={styles.detailContent}>
      <Text style={styles.intro}>Set how often your widget refreshes</Text>

      <View style={styles.optionList}>
        {REFRESH_OPTIONS.map((option) => (
          <FrequencyOption
            key={option.id}
            description={option.description}
            label={option.label}
            onPress={() =>
              updateWidgetConfiguration(activeWidget.id, {
                refreshFrequency: option.id,
              })
            }
            selected={activeWidget.refreshFrequency === option.id}
          />
        ))}
      </View>
    </View>
  );

  const renderTopicsScreen = () => (
    <View style={styles.detailContent}>
      <Text style={styles.intro}>Choose which affirmation topics feed this widget</Text>

      <View style={styles.topicCard}>
        {WIDGET_TOPICS.map((topic, index) => {
          const selected = activeWidget.topicIds.includes(topic.id);

          return (
            <View key={topic.id}>
              <Pressable
                onPress={() =>
                  updateWidgetConfiguration(activeWidget.id, {
                    topicIds: [topic.id],
                  })
                }
                style={({ pressed }) => [styles.topicRow, pressed && styles.rowPressed]}
              >
                <View style={styles.topicTextWrap}>
                  <Text style={styles.topicTitle}>{topic.label}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
                <View
                  style={[
                    styles.followPill,
                    selected && styles.followPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.followPillText,
                      selected && styles.followPillTextSelected,
                    ]}
                  >
                    {selected ? 'Following' : 'Follow'}
                  </Text>
                </View>
              </Pressable>
              {index < WIDGET_TOPICS.length - 1 ? <View style={styles.topicDivider} /> : null}
            </View>
          );
        })}
      </View>

      <Text style={styles.helperCopy}>
        General currently pulls from the built-in affirmations in your data folder and any
        custom affirmations you have created.
      </Text>
    </View>
  );

  const renderThemeScreen = () => (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.detailContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.intro}>Choose the theme shown behind this widget</Text>

      <View style={styles.themeListCard}>
        {THEMES.map((theme, index) => {
          const selected = theme.id === activeWidget.themeId;

          return (
            <View key={theme.id}>
              <Pressable
                onPress={() => updateWidgetConfiguration(activeWidget.id, { themeId: theme.id })}
                style={({ pressed }) => [styles.themeRow, pressed && styles.rowPressed]}
              >
                <View style={styles.themeRowLeft}>
                  <ExpoImage
                    contentFit="cover"
                    source={theme.image}
                    style={styles.themeThumbnail}
                    transition={0}
                  />
                  <Text style={styles.themeRowLabel}>{theme.name}</Text>
                </View>

                {selected ? (
                  <View style={styles.followPillSelected}>
                    <Text style={styles.followPillTextSelected}>Selected</Text>
                  </View>
                ) : (
                  <Ionicons color="#E6D6D0" name="chevron-forward" size={24} />
                )}
              </Pressable>
              {index < THEMES.length - 1 ? <View style={styles.topicDivider} /> : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  let title = 'Widgets';
  let content = renderHomeScreen();

  if (detailScreen === 'refresh') {
    title = 'Refresh frequency';
    content = renderRefreshScreen();
  } else if (detailScreen === 'topics') {
    title = 'Topics you follow';
    content = renderTopicsScreen();
  } else if (detailScreen === 'theme') {
    title = 'Choose theme';
    content = renderThemeScreen();
  }

  return (
    <View style={styles.backdrop}>
      <Pressable onPress={() => router.back()} style={styles.dismissArea} />

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.panel}>
          <View style={styles.header}>
            <IconCircleButton icon="chevron-back" onPress={handleBack} />
            <Text style={styles.title}>{title}</Text>
            <IconCircleButton
              icon="add"
              onPress={() => {
                createWidgetConfiguration();
                setDetailScreen('home');
              }}
            />
          </View>

          {!isLoaded || loading || !activeWidget ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color="#F6EAE4" size="small" />
            </View>
          ) : (
            content
          )}
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
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 29,
    fontWeight: '700',
  },
  homeContent: {
    flex: 1,
  },
  detailContent: {
    flex: 1,
    paddingBottom: 24,
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
  widgetPreviewLarge: {
    width: 440,
    maxWidth: '100%',
    height: 212,
    borderRadius: 28,
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
  widgetPreviewTextLarge: {
    maxWidth: '82%',
    fontSize: 20,
    lineHeight: 26,
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
  settingsCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  row: {
    minHeight: 58,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rowPressed: {
    opacity: 0.88,
  },
  rowLabel: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '500',
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
  },
  rowValue: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    height: 74,
    borderRadius: 999,
    backgroundColor: '#F6EEEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  primaryButtonText: {
    color: '#0B0F1A',
    fontSize: 20,
    fontWeight: '800',
  },
  optionList: {
    gap: 18,
    marginTop: 6,
  },
  optionCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.18)',
    paddingHorizontal: 22,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(139, 124, 255, 0.18)',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '700',
  },
  optionDescription: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 18,
    marginTop: 8,
  },
  radioOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: 'rgba(245, 247, 250, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#F2C94C',
  },
  radioInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F2C94C',
  },
  topicCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
  },
  topicRow: {
    minHeight: 100,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  topicTextWrap: {
    flex: 1,
  },
  topicTitle: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '600',
  },
  topicDescription: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  followPill: {
    minWidth: 112,
    height: 52,
    borderRadius: 999,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: 'rgba(245, 247, 250, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followPillSelected: {
    backgroundColor: 'rgba(242, 201, 76, 0.18)',
    borderColor: '#F2C94C',
  },
  followPillText: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '700',
  },
  followPillTextSelected: {
    color: '#F2C94C',
  },
  topicDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
  },
  helperCopy: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 18,
  },
  themeListCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
  },
  themeRow: {
    minHeight: 82,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  themeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  themeThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  themeRowLabel: {
    color: '#F5F7FA',
    fontSize: 19,
    fontWeight: '600',
    flex: 1,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
