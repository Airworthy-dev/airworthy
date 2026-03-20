import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          ...Platform.select({
            ios: { paddingBottom: 0 },
            default: { paddingBottom: 4, height: 60 },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="rectangle.3.group.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="work-orders"
        options={{
          title: 'Work Orders',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="wrench.and.screwdriver.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="aircraft"
        options={{
          title: 'Aircraft',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="airplane" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="bell.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
