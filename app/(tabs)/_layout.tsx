import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.neutral.white,
        tabBarInactiveTintColor: Colors.neutral.mediumGray,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: Colors.primary.darkTeal,
            height: 85,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
            paddingBottom: 25,
            paddingTop: 10,
          },
          default: {
            backgroundColor: Colors.primary.darkTeal,
            height: 70,
            borderTopWidth: 0,
            elevation: 8,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }),
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Counter',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 32 : 28} 
              name="heart.fill" 
              color={focused ? Colors.secondary.warmGold : color}
            />
          ),
          tabBarLabel: ({ focused }) => focused ? 'Counter' : 'Counter',
        }}
      />
    </Tabs>
  );
}
