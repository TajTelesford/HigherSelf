import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { WidgetConfiguration } from '../../context/WidgetsContext';
import { THEMES } from '../../data/themes';

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
    <View style={styles.detailContent}>
      <Text style={styles.intro}>Choose the theme shown behind this widget</Text>

      <FlatList
        data={THEMES}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = item.id === activeWidget.themeId;

          return (
            <Pressable
              onPress={() => onUpdateWidget(activeWidget.id, { themeId: item.id })}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <ExpoImage
                cachePolicy="memory-disk"
                contentFit="cover"
                source={item.image}
                style={styles.image}
                transition={0}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  detailContent: {
    flex: 1,
  },
  intro: {
    color: '#F5F7FA',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#1B2233',
    aspectRatio: 0.68,
  },
  cardSelected: {
    borderColor: '#8B7CFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
