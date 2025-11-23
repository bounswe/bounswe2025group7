import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from './locales/en/translation.json';
import trTranslation from './locales/tr/translation.json';
import jaTranslation from './locales/ja/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  tr: {
    translation: trTranslation
  },
  ja: {
    translation: jaTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en', // fallback language
    debug: false, // set to true for debugging
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
