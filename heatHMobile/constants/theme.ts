/**
 * Color palette for HeatH Mobile App
 * This file provides a centralized color scheme that matches the frontend design
 * Use these colors throughout the app for consistency
 */

export const palette = {
  primary: {
    main: '#169873ff',
    light: '#1ab38a',
    dark: '#0f6b4f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#0077b6ff',
    light: '#0096d6',
    dark: '#005a8c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',
    paper: '#f5f7fa',
  },
} as const;

// Additional commonly used colors for mobile app
export const colors = {
  // Primary colors
  primary: palette.primary.main,
  primaryLight: palette.primary.light,
  primaryDark: palette.primary.dark,
  primaryContrast: palette.primary.contrastText,
  
  // Secondary colors
  secondary: palette.secondary.main,
  secondaryLight: palette.secondary.light,
  secondaryDark: palette.secondary.dark,
  secondaryContrast: palette.secondary.contrastText,
  
  // Background colors
  background: palette.background.default,
  backgroundPaper: palette.background.paper,
  
  // Common UI colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Color blind friendly colors (demonstration colors - greens to blue)
  colorBlindSuccess: '#1E90FF', // Dodger blue - green becomes blue
  colorBlindError: '#8B0000',   // Dark red - stays red for contrast
  colorBlindWarning: '#FF8C00', // Dark orange - stays orange for contrast
  colorBlindPrimary: '#4169E1', // Royal blue - green primary becomes blue
  colorBlindInfo: '#4169E1',    // Royal blue - distinct info color
} as const;

// Typography colors
export const textColors = {
  primary: colors.gray[900],
  secondary: colors.gray[600],
  disabled: colors.gray[400],
  hint: colors.gray[500],
  white: colors.white,
} as const;

// Border colors
export const borderColors = {
  light: colors.gray[200],
  medium: colors.gray[300],
  dark: colors.gray[400],
} as const;

// Dark mode colors
export const darkColors = {
  // Primary colors (same as light mode)
  primary: palette.primary.main,
  primaryLight: palette.primary.light,
  primaryDark: palette.primary.dark,
  primaryContrast: palette.primary.contrastText,
  
  // Secondary colors (same as light mode)
  secondary: palette.secondary.main,
  secondaryLight: palette.secondary.light,
  secondaryDark: palette.secondary.dark,
  secondaryContrast: palette.secondary.contrastText,
  
  // Background colors (dark mode)
  background: '#121212',
  backgroundPaper: '#1e1e1e',
  
  // Common UI colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status colors (same as light mode)
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Color blind friendly colors (demonstration colors - greens to blue)
  colorBlindSuccess: '#1E90FF', // Dodger blue - green becomes blue
  colorBlindError: '#8B0000',   // Dark red - stays red for contrast
  colorBlindWarning: '#FF8C00', // Dark orange - stays orange for contrast
  colorBlindPrimary: '#4169E1', // Royal blue - green primary becomes blue
  colorBlindInfo: '#4169E1',    // Royal blue - distinct info color
} as const;

// Dark mode text colors
export const darkTextColors = {
  primary: '#ffffff',
  secondary: '#b3b3b3',
  disabled: '#666666',
  hint: '#808080',
  white: '#ffffff',
} as const;

// Dark mode border colors
export const darkBorderColors = {
  light: '#333333',
  medium: '#404040',
  dark: '#555555',
} as const;

// Font definitions
export const fonts = {
  normal: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  dyslexic: {
    regular: 'OpenDyslexic-Regular',
    medium: 'OpenDyslexic-Regular',
    bold: 'OpenDyslexic-Bold',
    light: 'OpenDyslexic-Regular',
  },
} as const;

// Font sizes
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// Line heights for different font types
export const lineHeights = {
  normal: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
    '4xl': 48,
    '5xl': 60,
  },
  dyslexic: {
    xs: 20,  // Increased for better readability
    sm: 24,
    base: 28,
    lg: 32,
    xl: 36,
    '2xl': 42,
    '3xl': 48,
    '4xl': 54,
    '5xl': 66,
  },
} as const;

// Export the main palette for easy access
export default palette;
