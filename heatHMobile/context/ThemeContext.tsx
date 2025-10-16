import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme as useSystemColorScheme } from 'react-native';
import { storage } from '@/utils/storage';

const STORAGE_KEY = 'theme_preference';

type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedScheme: Exclude<ColorSchemeName, null>;
  setPreference: (pref: ThemePreference) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProviderCustom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreferenceState(saved);
      }
    })();
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    storage.setItem(STORAGE_KEY, pref);
  }, []);

  const resolvedScheme: Exclude<ColorSchemeName, null> = useMemo(() => {
    return preference === 'system' ? systemScheme : preference;
  }, [preference, systemScheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    preference,
    resolvedScheme,
    setPreference,
    isDark: resolvedScheme === 'dark',
  }), [preference, resolvedScheme, setPreference]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePreference must be used within ThemeProviderCustom');
  return ctx;
}
