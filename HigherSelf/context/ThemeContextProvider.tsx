import { Asset } from 'expo-asset';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { THEMES } from '../data/themes';

type ThemeContextType = {
  selectedThemeId: string;
  setSelectedThemeId: (id: string) => void;
  selectedTheme: (typeof THEMES)[number];
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEMES_BY_ID = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme])
) as Record<string, (typeof THEMES)[number]>;

export function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedThemeId, setSelectedThemeId] = useState(THEMES[0]?.id ?? '');

  useEffect(() => {
    Asset.loadAsync(THEMES.map((theme) => theme.image as number)).catch((error) => {
      console.error('Failed to preload theme images:', error);
    });
  }, []);

  const selectedTheme = THEMES_BY_ID[selectedThemeId] ?? THEMES[0];

  const value = useMemo(
    () => ({
      selectedThemeId,
      setSelectedThemeId,
      selectedTheme,
    }),
    [selectedThemeId, selectedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSelection() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeSelection must be used inside ThemeProvider');
  }

  return context;
}
