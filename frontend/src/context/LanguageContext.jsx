import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('lifetrack_lang') || 'pl';
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('lifetrack_lang', lang);
    }
  };

  const t = (key) => {
    const langDict = translations[language] || translations.pl;
    return langDict[key] || key;
  };

  const translateCategory = (catName) => {
    if (!catName) return '';
    const langDict = translations[language] || translations.pl;
    const key = `cat_${catName}`;
    return langDict[key] || catName;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateCategory }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
