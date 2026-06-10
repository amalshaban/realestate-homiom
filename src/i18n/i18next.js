import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // For loading translations from /locales (optional, but recommended for larger apps)
  .use(LanguageDetector) // To detect user language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    fallbackLng: 'en', // Default language if detection fails
    debug: false,
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to your translation files
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'], // Order of language detection sources
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
    },
  });

export default i18n;