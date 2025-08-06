import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Create custom themes based on our Islamic design system
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary.darkTeal,
    background: Colors.neutral.lightGray,
    card: Colors.neutral.white,
    text: Colors.primary.darkTeal,
    border: Colors.neutral.mediumGray,
    notification: Colors.secondary.warmGold,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.secondary.warmGold,
    background: Colors.primary.darkTeal,
    card: Colors.primary.mediumTeal,
    text: Colors.neutral.white,
    border: Colors.primary.lightTeal,
    notification: Colors.secondary.brightGold,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar 
        style={colorScheme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colorScheme === 'dark' ? Colors.primary.darkTeal : Colors.neutral.lightGray}
      />
    </ThemeProvider>
  );
}
