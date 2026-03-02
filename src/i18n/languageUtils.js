// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  th: 'ไทย',
  zh: '中文',
  ja: '日本語',
  ru: 'Русский',
  hi: 'हिंदी'
};

// Default language (Thai)
export const DEFAULT_LANGUAGE = 'th';

/**
 * Detects the user's preferred language from the browser
 * @returns {string} The detected language code
 */
export const detectBrowserLanguage = () => {
  // Get the browser's language
  const browserLang = navigator.language || navigator.userLanguage || DEFAULT_LANGUAGE;
  
  // Extract the primary language code (first 2 characters)
  const primaryLang = browserLang.substring(0, 2).toLowerCase();
  
  // Check if the detected language is supported
  if (Object.keys(SUPPORTED_LANGUAGES).includes(primaryLang)) {
    return primaryLang;
  }
  
  // Special handling for Chinese variants
  if (browserLang.startsWith('zh')) {
    // 'zh-TW' (Traditional) or 'zh-CN' (Simplified)
    return browserLang.includes('TW') || browserLang.includes('HK') ? 'zh' : 'zh';
  }
  
  // Default to Thai if language is not supported
  return DEFAULT_LANGUAGE;
};

/**
 * Gets the direction of the language (LTR or RTL)
 * @param {string} langCode - Language code
 * @returns {string} 'ltr' or 'rtl'
 */
export const getLanguageDirection = (langCode) => {
  // For this app, all supported languages are LTR
  // In a more complex app, you might have RTL languages like Arabic
  return 'ltr';
};