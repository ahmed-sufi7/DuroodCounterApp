/**
 * Typography constants based on Islamic App Design System
 */

export const Typography = {
  arabic: {
    fontFamily: 'Traditional Arabic', // Will need to be loaded
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const
    },
    sizes: {
      display: 48,
      heading: 32,
      subheading: 24,
      body: 18,
      caption: 14
    }
  },
  latin: {
    fontFamily: 'System', // Using system font for now
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const
    },
    sizes: {
      display: 32,
      heading: 24,
      subheading: 18,
      body: 16,
      caption: 12,
      small: 10
    }
  }
};

export const Spacing = {
  base: 16,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  round: 24
};
