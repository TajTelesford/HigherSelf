import type { Affirmation } from './affirmations';

export type VoiceRecordingEntry = {
  id: string;
  uri: string;
  fileName: string;
  durationMillis: number;
  createdAt: string;
  affirmations: Affirmation[];
};
