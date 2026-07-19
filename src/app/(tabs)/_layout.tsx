import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Icon } from '@/components/icon';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surfaceSelected },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon name="home" color={color} size={22} /> }}
      />
      <Tabs.Screen
        name="submit"
        options={{ title: 'Submit', tabBarIcon: ({ color }) => <Icon name="submit" color={color} size={22} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: ({ color }) => <Icon name="map" color={color} size={22} /> }}
      />
    </Tabs>
  );
}
