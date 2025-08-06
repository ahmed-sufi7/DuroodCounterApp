import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'arabic' | 'heading';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'arabic' ? styles.arabic : undefined,
        type === 'heading' ? styles.heading : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.latin.sizes.body,
    lineHeight: 24,
    fontWeight: Typography.latin.weights.regular,
  },
  defaultSemiBold: {
    fontSize: Typography.latin.sizes.body,
    lineHeight: 24,
    fontWeight: Typography.latin.weights.semibold,
  },
  title: {
    fontSize: Typography.latin.sizes.display,
    fontWeight: Typography.latin.weights.bold,
    lineHeight: 40,
  },
  heading: {
    fontSize: Typography.latin.sizes.heading,
    fontWeight: Typography.latin.weights.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: Typography.latin.sizes.subheading,
    fontWeight: Typography.latin.weights.semibold,
    lineHeight: 28,
  },
  arabic: {
    fontSize: Typography.arabic.sizes.heading,
    fontWeight: Typography.arabic.weights.medium,
    lineHeight: 48,
    textAlign: 'center',
  },
  link: {
    lineHeight: 30,
    fontSize: Typography.latin.sizes.body,
    color: Colors.primary.darkTeal,
    fontWeight: Typography.latin.weights.medium,
  },
});
