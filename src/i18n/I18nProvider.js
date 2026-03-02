import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectBrowserLanguage, DEFAULT_LANGUAGE } from './languageUtils';

// Import translation files
import enTranslations from './translations/en.json';
import thTranslations from './translations/th.json';
import zhTranslations from './translations/zh.json';
import jaTranslations from './translations/ja.json';
import ruTranslations from './translations/ru.json';
import hiTranslations from './translations/hi.json';

// All translation resources
const resources = {
  en: enTranslations,
  th: thTranslations,
  zh: zhTranslations,
  ja: jaTranslations,
  ru: ruTranslations,
  hi: hiTranslations
};

// Create context
const I18nContext = createContext();

// Custom hook to use the i18n context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Provider component
export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get saved language from localStorage or detect browser language
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || detectBrowserLanguage();
  });

  // Set document language attribute for accessibility
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.dir = 'ltr'; // All supported languages in this app are LTR
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  // Function to change language
  const changeLanguage = (lang) => {
    if (Object.keys(resources).includes(lang)) {
      setCurrentLanguage(lang);
    }
  };

  // Function to get translation
  const t = (key, options = {}) => {
    const translation = resources[currentLanguage]?.[key] || resources[DEFAULT_LANGUAGE][key] || key;
    
    // Handle interpolation if options are provided
    if (options && Object.keys(options).length > 0) {
      let result = translation;
      Object.keys(options).forEach(option => {
        result = result.replace(`{{${option}}}`, options[option]);
      });
      return result;
    }
    
    return translation;
  };

  // Get available languages
  const getSupportedLanguages = () => {
    return Object.keys(resources).reduce((acc, lang) => {
      acc[lang] = resources[lang]._languageName;
      return acc;
    }, {});
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getSupportedLanguages,
    availableLanguages: Object.keys(resources),
    languageDirection: 'ltr' // All supported languages in this app are LTR
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};