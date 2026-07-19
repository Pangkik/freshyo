import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({ SpaceGrotesk_500Medium, SpaceGrotesk_700Bold });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: 'Item' }} />
        <Stack.Screen name="category/[name]" options={{ title: 'Category' }} />
        <Stack.Screen name="store/[id]" options={{ title: 'Store' }} />
        <Stack.Screen name="rate/[id]" options={{ title: 'Rate store' }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal', title: 'Sign in' }} />
      </Stack>
    </ThemeProvider>
  );
}
