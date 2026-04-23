export type AffirmationCategory =
  | 'confidence'
  | 'discipline'
  | 'growth'
  | 'peace'
  | 'wealth';

export type Affirmation = {
  id: string;
  text: string;
  category: AffirmationCategory | string;
};
