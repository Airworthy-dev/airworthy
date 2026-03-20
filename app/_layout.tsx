import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { StoreProvider } from '@/store';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const headerOptions = {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
    headerShadowVisible: false,
    headerBackTitle: 'Back',
  };

  return (
    <StoreProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="work-order/[id]" options={{ ...headerOptions, title: 'Work Order' }} />
          <Stack.Screen name="work-order/new" options={{ ...headerOptions, title: 'New Work Order', presentation: 'modal' }} />
          <Stack.Screen name="aircraft/[id]" options={{ ...headerOptions, title: 'Aircraft' }} />
          <Stack.Screen name="aircraft/new" options={{ ...headerOptions, title: 'New Aircraft', presentation: 'modal' }} />
          <Stack.Screen name="reminder/[id]" options={{ ...headerOptions, title: 'Reminder' }} />
          <Stack.Screen name="reminder/new" options={{ ...headerOptions, title: 'New Reminder', presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </StoreProvider>
  );
}
