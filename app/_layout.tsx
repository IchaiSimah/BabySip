import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import AuthGuard from '@/components/AuthGuard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/utils/authContext';
import { LanguageProvider } from '@/utils/languageContext';
import { SettingsProvider } from '@/utils/settingsContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ChoplinBold: require('../assets/fonts/ChoplinBold.otf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LanguageProvider>
          <AuthProvider>
            <SettingsProvider>
              <AuthGuard>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="register" options={{ headerShown: false }} />
                  <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                  <Stack.Screen name="verify-code" options={{ headerShown: false }} />
                  <Stack.Screen name="reset-password" options={{ headerShown: false }} />
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="stats" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen name="add-bottle" options={{ headerShown: false }} />
                  <Stack.Screen name="add-poop" options={{ headerShown: false }} />
                  <Stack.Screen name="settings" options={{ headerShown: false }} />
                </Stack>
              </AuthGuard>
              <StatusBar style="auto" />
            </SettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
