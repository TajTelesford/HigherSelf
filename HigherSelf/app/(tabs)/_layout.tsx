import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: '#0B0F1A',
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#8B7CFF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          display: 'none',
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 20,
          height: 70,
          borderRadius: 24,
          backgroundColor: '#121826',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          paddingTop: 12,
          paddingBottom: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'flame' : 'flame-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="themes"
        options={{
          title: 'Themes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'color-palette' : 'color-palette-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
