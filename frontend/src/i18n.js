import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      }
      // Add more languages here:
      // es: { translation: esTranslation },
      // fr: { translation: frTranslation },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    // Detection options (uncomment to enable browser language detection)
    // detection: {
    //   order: ['navigator', 'localStorage', 'htmlTag'],
    //   caches: ['localStorage']
    // },
    
    react: {
      useSuspense: false // Set to true if you want to use Suspense
    }
  });

export default i18n;
