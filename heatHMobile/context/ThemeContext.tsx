import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';
export type FontMode = 'normal' | 'dyslexic';
export type ColorBlindMode = 'normal' | 'colorblind';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
  fontMode: FontMode;
  isDyslexic: boolean;
  toggleFont: () => void;
  colorBlindMode: ColorBlindMode;
  isColorBlind: boolean;
  toggleColorBlind: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [fontMode, setFontMode] = useState<FontMode>('normal');
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindMode>('normal');

  const isDark = themeMode === 'dark';
  const isDyslexic = fontMode === 'dyslexic';
  const isColorBlind = colorBlindMode === 'colorblind';

  const toggleTheme = async () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    try {
      await AsyncStorage.setItem('themeMode', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleFont = async () => {
    const newFont = fontMode === 'normal' ? 'dyslexic' : 'normal';
    setFontMode(newFont);
    try {
      await AsyncStorage.setItem('fontMode', newFont);
    } catch (error) {
      console.error('Error saving font:', error);
    }
  };

  const toggleColorBlind = async () => {
    const newColorBlind = colorBlindMode === 'normal' ? 'colorblind' : 'normal';
    setColorBlindMode(newColorBlind);
    try {
      await AsyncStorage.setItem('colorBlindMode', newColorBlind);
    } catch (error) {
      console.error('Error saving color blind mode:', error);
    }
  };

  useEffect(() => {
    // Load saved preferences on app start
    const loadPreferences = async () => {
      try {
        const [savedTheme, savedFont, savedColorBlind] = await Promise.all([
          AsyncStorage.getItem('themeMode'),
          AsyncStorage.getItem('fontMode'),
          AsyncStorage.getItem('colorBlindMode')
        ]);
        
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeMode(savedTheme);
        }
        
        if (savedFont === 'normal' || savedFont === 'dyslexic') {
          setFontMode(savedFont);
        }
        
        if (savedColorBlind === 'normal' || savedColorBlind === 'colorblind') {
          setColorBlindMode(savedColorBlind);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  const value: ThemeContextType = {
    themeMode,
    toggleTheme,
    isDark,
    fontMode,
    isDyslexic,
    toggleFont,
    colorBlindMode,
    isColorBlind,
    toggleColorBlind,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
