import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import en from '../locales/en';
import fr from '../locales/fr';
import ar from '../locales/ar';

const dictionaries = { en, fr, ar };
const LanguageContext = createContext();

/**
 * LanguageProvider manages the application's internationalization (i18n) state.
 * It handles language selection, text translation, and RTL (Right-to-Left) direction styling.
 */
export function LanguageProvider({ children }) {
  const { profile, setProfile } = useStore();
  
  // Initialize language state by checking local storage first, then browser language.
  // This ensures the app loads quickly in the correct language before Firebase data is fetched.
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

  // Sync language state when the user's Firebase profile loads or changes.
  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguageState(profile.language);
      localStorage.setItem('subdz-language', profile.language);
    }
  }, [profile?.language]);

  /**
   * Custom setter that updates local React state, local storage for fast subsequent loads,
   * and fires an update to Firebase to sync across the user's devices.
   */
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('subdz-language', lang);
    if (profile) {
      setProfile({ language: lang });
    }
  };

  // Automatically update the document's direction (`dir`) attribute for RTL support.
  // Tailwind CSS uses this `dir` attribute to apply `rtl:` utility classes.
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  /**
   * Translation function `t()`.
   * @param {string} key - The translation key (e.g., 'nav.settings')
   * @param {object} params - Optional dynamic parameters (e.g., { count: 5 })
   * @returns {string} The translated string, falling back to English, or the key itself if missing.
   */
  const t = (key, params = {}) => {
    let str = dictionaries[language]?.[key] || dictionaries['en']?.[key] || key;
    
    // Replace dynamic placeholders like {day} or {count} with actual values
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

// Custom hook to easily consume language context in any component
export function useLanguage() {
  return useContext(LanguageContext);
}
