import { ColorSchemeName, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemePreference } from '@/context/ThemeContext';

export function useColorScheme(): Exclude<ColorSchemeName, null> {
  try {
    const { resolvedScheme } = useThemePreference();
    return resolvedScheme;
  } catch {
    // If ThemeProviderCustom is not mounted yet, fall back to system
    return useSystemColorScheme() ?? 'light';
  }
}
