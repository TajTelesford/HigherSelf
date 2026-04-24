import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { STORAGE_KEYS } from '@/data/HigherSelf_StorageKeys';
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
  const [hasLoadedStoredTheme, setHasLoadedStoredTheme] = useState(false);

  useEffect(() => {
    Asset.loadAsync(THEMES.map((theme) => theme.image as number)).catch((error) => {
      console.error('Failed to preload theme images:', error);
    });
  }, []);

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedThemeId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_THEME);

        if (storedThemeId && THEMES_BY_ID[storedThemeId]) {
          setSelectedThemeId(storedThemeId);
        }
      } catch (error) {
        console.error('Failed to load selected theme:', error);
      } finally {
        setHasLoadedStoredTheme(true);
      }
    };

    loadStoredTheme();
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredTheme) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEYS.SELECTED_THEME, selectedThemeId).catch((error) => {
      console.error('Failed to persist selected theme:', error);
    });
  }, [hasLoadedStoredTheme, selectedThemeId]);

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
