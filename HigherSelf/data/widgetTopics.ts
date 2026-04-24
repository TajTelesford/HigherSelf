import type { Affirmation } from '@/types/affirmations';

import { AFFIRMATIONS } from './affirmation';

export type WidgetTopicId = 'general';

type WidgetAffirmationSource = {
  customAffirmations: Affirmation[];
};

export type WidgetTopicDefinition = {
  description: string;
  id: WidgetTopicId;
  label: string;
  resolveAffirmations: (source: WidgetAffirmationSource) => Affirmation[];
};

const dedupeAffirmations = (affirmations: Affirmation[]) => {
  const seen = new Set<string>();

  return affirmations.filter((affirmation) => {
    const normalized = affirmation.text.trim().toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

export const WIDGET_TOPICS: WidgetTopicDefinition[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Built-in affirmations plus your own affirmations.',
    resolveAffirmations: ({ customAffirmations }) =>
      dedupeAffirmations([...customAffirmations, ...AFFIRMATIONS]),
  },
];

const WIDGET_TOPICS_BY_ID = Object.fromEntries(
  WIDGET_TOPICS.map((topic) => [topic.id, topic])
) as Record<WidgetTopicId, WidgetTopicDefinition>;

export const getWidgetTopicById = (topicId: WidgetTopicId) =>
  WIDGET_TOPICS_BY_ID[topicId];

export const getWidgetTopicLabel = (topicIds: WidgetTopicId[]) =>
  topicIds
    .map((topicId) => getWidgetTopicById(topicId)?.label)
    .filter(Boolean)
    .join(', ');

export const getAffirmationsForWidgetTopics = (
  topicIds: WidgetTopicId[],
  source: WidgetAffirmationSource
) => {
  const topics = topicIds
    .map((topicId) => getWidgetTopicById(topicId))
    .filter(Boolean);

  return dedupeAffirmations(
    topics.flatMap((topic) => topic.resolveAffirmations(source))
  );
};

