import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Lang } from '../lib/i18n';

const STORAGE_KEY = 'marcos-music:lang';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Acessa uma chave aninhada com notação de ponto, ex: t('nav.agenda') */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'pt',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'pt';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string): string => {
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = translations[lang];
    for (const part of parts) {
      node = node?.[part];
      if (node === undefined) return key; // fallback: retorna a própria chave
    }
    return typeof node === 'string' ? node : key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
