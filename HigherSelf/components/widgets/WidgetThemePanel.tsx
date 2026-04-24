import type { WidgetConfiguration } from '@/context/WidgetsContext';
import { THEMES } from '@/data/themes';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';

export function WidgetThemePanel({
  activeWidget,
  onUpdateWidget,
}: {
  activeWidget: WidgetConfiguration;
  onUpdateWidget: (
    id: string,
    updates: Partial<Omit<WidgetConfiguration, 'id'>>
  ) => void;
}) {
  return (
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
                onPress={() => onUpdateWidget(activeWidget.id, { themeId: theme.id })}
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
                  <View style={styles.selectedPill}>
                    <Text style={styles.selectedPillText}>Selected</Text>
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
}

const styles = StyleSheet.create({
  detailContent: {
    flexGrow: 1,
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
  selectedPill: {
    backgroundColor: 'rgba(242, 201, 76, 0.18)',
    borderColor: '#F2C94C',
    minWidth: 112,
    height: 52,
    borderRadius: 999,
    paddingHorizontal: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPillText: {
    color: '#F2C94C',
    fontSize: 18,
    fontWeight: '700',
  },
  topicDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
  },
  rowPressed: {
    opacity: 0.88,
  },
});
