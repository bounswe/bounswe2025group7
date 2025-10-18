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

// Export the main palette for easy access
export default palette;
