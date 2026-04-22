import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark'
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
    <ThemeProvider value={theme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F1A' } }}
        />
      </Stack>
      <StatusBar style="light" backgroundColor="#0B0F1A" />
    </ThemeProvider>
  );
}
