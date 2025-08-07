import { Colors } from '@/constants/Colors';
import { Platform, View } from 'react-native';

// Tab bar background for web and Android
export default function TabBarBackground() {
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: Colors.primary.darkTeal,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.2)',
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      }),
    }} />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
