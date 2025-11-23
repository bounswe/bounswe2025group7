import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enTranslation from './locales/en/translation.json';
import trTranslation from './locales/tr/translation.json';
import jaTranslation from './locales/ja/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  tr: {
    translation: trTranslation,
  },
  ja: {
    translation: jaTranslation,
  },
};

// AsyncStorage language detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      // Fallback to device language
      const locales = getLocales();
      const deviceLanguage = locales?.[0]?.languageCode || 'en';
      callback(deviceLanguage);
    } catch (error) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      // Ignore storage errors
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React Native already does escaping
    },
    compatibilityJSON: 'v4', // For React Native compatibility
  });

// Ensure language changes are saved to AsyncStorage
i18n.on('languageChanged', async (lng) => {
  try {
    await AsyncStorage.setItem('user-language', lng);
  } catch (error) {
    // Ignore storage errors
  }
});

export default i18n;

