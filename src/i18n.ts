import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly
import enCommon from '../public/locales/en/common.json';
import enComponents from '../public/locales/en/components.json';
import enSchemas from '../public/locales/en/schemas.json';
import zhCommon from '../public/locales/zh/common.json';
import zhComponents from '../public/locales/zh/components.json';
import zhSchemas from '../public/locales/zh/schemas.json';

const resources = {
  en: {
    common: enCommon,
    components: enComponents,
    schemas: enSchemas,
  },
  zh: {
    common: zhCommon,
    components: zhComponents,
    schemas: zhSchemas,
  },
};

i18n
  .use(HttpBackend) // The backend is still useful for loading other languages on the client
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    ns: ['common', 'components', 'schemas'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    // Preload translations
    resources,
  });

export default i18n;
