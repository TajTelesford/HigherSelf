import React, { createContext, useContext, useMemo, useState } from 'react';
import { THEMES } from '../data/themes';

type ThemeContextType = {
  selectedThemeId: string;
  setSelectedThemeId: (id: string) => void;
  selectedTheme: (typeof THEMES)[number];
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [selectedThemeId, setSelectedThemeId] = useState('aurora');

  const selectedTheme =
    THEMES.find((theme) => theme.id === selectedThemeId) ?? THEMES[0];

  const value = useMemo(
    () => ({
      selectedThemeId,
      setSelectedThemeId,
      selectedTheme,
    }),
    [selectedThemeId, selectedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeSelection() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeSelection must be used inside ThemeProvider');
  }

  return context;
}