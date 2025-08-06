import { Colors } from '@/constants/Colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  return (
    <BlurView
      tint="dark"
      intensity={80}
      style={[StyleSheet.absoluteFill, {
        backgroundColor: Colors.primary.darkTeal,
      }]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
