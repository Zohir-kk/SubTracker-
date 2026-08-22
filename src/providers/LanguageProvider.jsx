import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import en from '../locales/en';
import fr from '../locales/fr';
import ar from '../locales/ar';

const dictionaries = { en, fr, ar };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { profile, setProfile } = useStore();
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('subdz-language');
    if (saved) return saved;
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'fr', 'ar'].includes(browserLang)) return browserLang;
    }
    return 'en';
  });

  const isInitialMount = useRef(true);

  // Sync from profile when profile loads
  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguageState(profile.language);
      localStorage.setItem('subdz-language', profile.language);
    }
  }, [profile?.language]);

  // Provide a custom setLanguage that also writes to profile
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('subdz-language', lang);
    if (profile) {
      setProfile({ language: lang });
    }
  };

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key, params = {}) => {
    let str = dictionaries[language]?.[key] || dictionaries['en']?.[key] || key;
    
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
