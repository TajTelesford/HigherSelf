import type { WidgetConfiguration } from '@/context/WidgetsContext';
import { getAffirmationsForWidgetTopics } from '@/data/widgetTopics';
import type { Affirmation } from '@/types/affirmations';
import type { AffirmationCollection } from '@/types/collections';
import { THEMES } from '../../data/themes';

export type WidgetPreviewKind = 'medium';

export function getPreviewAffirmation(
  configuration: WidgetConfiguration,
  customAffirmations: Affirmation[],
  collections: AffirmationCollection[]
) {
  const selectedCollections = configuration.collectionIds.length
    ? collections.filter((collection) => configuration.collectionIds.includes(collection.id))
    : [];
  const selectedCollectionAffirmations = selectedCollections.flatMap(
    (collection) => collection.affirmations
  );
  const affirmations = selectedCollectionAffirmations.length
    ? selectedCollectionAffirmations
    : getAffirmationsForWidgetTopics(configuration.topicIds, {
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

export function getThemeById(themeId: string) {
  return THEMES.find((theme) => theme.id === themeId) ?? THEMES[0];
}
