import type { Affirmation } from './affirmations';

export type AffirmationCollection = {
  id: string;
  name: string;
  affirmations: Affirmation[];
  createdAt: string;
};
