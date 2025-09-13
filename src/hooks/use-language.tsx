
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import en from '@/lib/locales/en.json';
import hi from '@/lib/locales/hi.json';

type Language = 'en' | 'hi';

const translations = { en, hi };

// Helper function to get nested keys
type NestedKey<T> = T extends object ? { [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${NestedKey<T[K]>}`}` }[keyof T] : never;

type TranslationKey = NestedKey<typeof en>;


type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const initialState: LanguageProviderState = {
  language: 'en',
  setLanguage: () => null,
  t: (key: TranslationKey) => key,
};

const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = 'en',
  storageKey = 'app-language',
  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
     if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Language | null) || defaultLanguage;
    }
    return defaultLanguage;
  });

  useEffect(() => {
    const storedLanguage = localStorage.getItem(storageKey) as Language | null;
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, [storageKey]);
  
  const handleSetLanguage = (lang: Language) => {
      setLanguage(lang);
      if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, lang);
      }
  }

  const t = useCallback((key: TranslationKey): string => {
    const langFile = translations[language];
    const keys = key.split('.');
    let result: any = langFile;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        return fallbackResult;
      }
    }
    return result as string;
  }, [language]);

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider');

  return context;
};
