import React from 'react';
import { useI18n } from '../i18n/I18nProvider';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, getSupportedLanguages } = useI18n();

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    changeLanguage(selectedLanguage);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select">
        {currentLanguage === 'th' ? 'เลือกภาษา:' : 
         currentLanguage === 'zh' ? '选择语言:' :
         currentLanguage === 'ja' ? '言語を選択:' :
         currentLanguage === 'ru' ? 'Выбрать язык:' :
         currentLanguage === 'hi' ? 'भाषा चुनें:' : 'Select Language:'}
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="language-dropdown"
      >
        {Object.entries(getSupportedLanguages()).map(([code, name]) => (
          <option key={code} value={code}>
            {name} ({code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;