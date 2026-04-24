import type { WidgetConfiguration } from '@/context/WidgetsContext';
import { WIDGET_TOPICS } from '@/data/widgetTopics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  return (
    <View style={styles.detailContent}>
      <Text style={styles.intro}>Choose which affirmation topics feed this widget</Text>

      <View style={styles.topicCard}>
        {WIDGET_TOPICS.map((topic, index) => {
          const selected = activeWidget.topicIds.includes(topic.id);

          return (
            <View key={topic.id}>
              <Pressable
                onPress={() =>
                  onUpdateWidget(activeWidget.id, {
                    topicIds: [topic.id],
                  })
                }
                style={({ pressed }) => [styles.topicRow, pressed && styles.rowPressed]}
              >
                <View style={styles.topicTextWrap}>
                  <Text style={styles.topicTitle}>{topic.label}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
                <View style={[styles.followPill, selected && styles.followPillSelected]}>
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
}

const styles = StyleSheet.create({
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
  rowPressed: {
    opacity: 0.88,
  },
});
