import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import '../global.css';

import { AffirmationCollectionsProvider } from '@/context/AffirmationCollectionsContext';
import { CustomAffirmationsProvider } from '@/context/CustomAffirmationsContext';
import { SavedAffirmationsProvider } from '@/context/SavedAffirmationContext';
import { StreakProvider } from '@/context/StreakContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeContextProvider } from '../context/ThemeContextProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme =
    colorScheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: '#0B0F1A',
            card: '#0B0F1A',
            primary: '#8B7CFF',
            text: '#F5F7FA',
            border: '#121826',
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: '#0B0F1A',
            card: '#0B0F1A',
            primary: '#8B7CFF',
            text: '#F5F7FA',
            border: '#121826',
          },
        };

  return (
    <ThemeContextProvider>
      <StreakProvider>
        <SavedAffirmationsProvider>
          <CustomAffirmationsProvider>
            <AffirmationCollectionsProvider>
              <ThemeProvider value={theme}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="modals/themes"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="modals/profile"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="modals/library"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="modals/mood"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="modals/practiceAffirmations"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="modals/recordAffirmations"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="modals/streak"
                    options={{
                      presentation: 'fullScreenModal',
                      animation: 'slide_from_right',
                    }}
                  />

                  <Stack.Screen
                    name="my-content/collections"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="my-content/collection-detail"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="my-content/favorites"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="my-content/my-own-affirmations"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="my-content/recorded-affirmations"
                    options={{
                      presentation: 'transparentModal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                </Stack>
              </ThemeProvider>
            </AffirmationCollectionsProvider>
          </CustomAffirmationsProvider>
        </SavedAffirmationsProvider>
      </StreakProvider>
    </ThemeContextProvider>
  );
}
