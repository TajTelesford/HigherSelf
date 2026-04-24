import type { ExpoConfig } from 'expo/config';

const appJson = require('./app.json') as { expo: ExpoConfig };

const APP_ICON_PLUGIN_OPTIONS = [
  {
    id: 'HigherSelfGlow',
    assetPath: './assets/Logos/Glow.png',
  },
] as const;

const baseConfig = appJson.expo;
const defaultIconPath = APP_ICON_PLUGIN_OPTIONS[0]?.assetPath ?? './assets/Logos/Glow.png';

const dynamicIconPluginConfig = Object.fromEntries(
  APP_ICON_PLUGIN_OPTIONS.map((icon) => [
    icon.id,
    {
      image: icon.assetPath,
      prerendered: true,
    },
  ])
);

const plugins = [
  ...(baseConfig.plugins ?? []).filter((plugin) => {
    if (typeof plugin === 'string') {
      return plugin !== '@variant-systems/expo-dynamic-app-icon';
    }

    return plugin[0] !== '@variant-systems/expo-dynamic-app-icon';
  }),
  ['@variant-systems/expo-dynamic-app-icon', dynamicIconPluginConfig],
] as ExpoConfig['plugins'];

const config: ExpoConfig = {
  ...baseConfig,
  icon: defaultIconPath,
  ios: {
    ...baseConfig.ios,
    deploymentTarget: '15.1',
    icon: defaultIconPath,
  } as ExpoConfig['ios'],
  android: {
    ...baseConfig.android,
    icon: defaultIconPath,
  },
  plugins,
};

export default config;
