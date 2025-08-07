import { Platform, View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'card' | 'section';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  type = 'default',
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const getTypeStyles = () => {
    switch (type) {
      case 'card':
        return {
          backgroundColor: Colors.neutral.white,
          borderRadius: 16,
          padding: 20,
          ...(Platform.OS === 'web' ? {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }),
        };
      case 'section':
        return {
          borderRadius: 12,
          padding: 16,
          margin: 8,
        };
      default:
        return {};
    }
  };

  return (
    <View 
      style={[
        { backgroundColor: type === 'card' ? undefined : backgroundColor }, 
        getTypeStyles(),
        style
      ]} 
      {...otherProps} 
    />
  );
}
