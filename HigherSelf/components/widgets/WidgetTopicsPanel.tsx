import type { WidgetConfiguration } from '@/context/WidgetsContext';
import { useAffirmationCollections } from '@/context/AffirmationCollectionsContext';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function WidgetTopicsPanel({
  activeWidget,
  onUpdateWidget,
}: {
  activeWidget: WidgetConfiguration;
  onUpdateWidget: (
    id: string,
    updates: Partial<Omit<WidgetConfiguration, 'id'>>
  ) => void;
}) {
  const { collections, loading } = useAffirmationCollections();

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.detailContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.intro}>Choose a collection for this widget to pull affirmations from</Text>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Loading collections...</Text>
        </View>
      ) : collections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No collections yet.</Text>
          <Text style={styles.emptyMessage}>
            Create a collection in My Content, add affirmations to it, then select it here.
          </Text>
        </View>
      ) : (
        <View style={styles.topicCard}>
          {collections.map((collection, index) => {
            const selected = activeWidget.collectionIds.includes(collection.id);
            const affirmationCount = collection.affirmations.length;

            return (
              <View key={collection.id}>
                <Pressable
                  onPress={() =>
                    onUpdateWidget(activeWidget.id, {
                      collectionIds: [collection.id],
                    })
                  }
                  style={({ pressed }) => [styles.topicRow, pressed && styles.rowPressed]}
                >
                  <View style={styles.topicTextWrap}>
                    <Text style={styles.topicTitle}>{collection.name}</Text>
                    <Text style={styles.topicDescription}>
                      {affirmationCount} affirmation{affirmationCount === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <View style={[styles.followPill, selected && styles.followPillSelected]}>
                    <Text
                      style={[
                        styles.followPillText,
                        selected && styles.followPillTextSelected,
                      ]}
                    >
                      {selected ? 'Selected' : 'Choose'}
                    </Text>
                  </View>
                </Pressable>
                {index < collections.length - 1 ? <View style={styles.topicDivider} /> : null}
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.helperCopy}>
        The widget will refresh with a random affirmation from the collection you select.
      </Text>
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
  emptyState: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyMessage: {
    color: 'rgba(245, 247, 250, 0.72)',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
    textAlign: 'center',
  },
  rowPressed: {
    opacity: 0.88,
  },
});
