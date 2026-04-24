import type { ImageSourcePropType } from 'react-native';

export type AppIconOption = {
  id: string;
  label: string;
  preview: ImageSourcePropType;
  assetPath: string;
};

export const APP_ICON_OPTIONS: AppIconOption[] = [
  {
    id: 'HigherSelfGlow',
    label: 'HigherSelf',
    preview: require('../assets/Logos/Glow.png'),
    assetPath: './assets/Logos/Glow.png',
  },
];

export const DEFAULT_APP_ICON_ID = APP_ICON_OPTIONS[0]?.id ?? 'HigherSelfGlow';
