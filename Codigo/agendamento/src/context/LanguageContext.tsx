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

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'pt' ? stored : 'pt';
  } catch {
    return 'pt';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore write failures (e.g. storage disabled)
    }
  };

  const t = (key: string): string => {
    const parts = key.split('.');
    // navigate safely through the translations tree
    let node: unknown = translations[lang];
    for (const part of parts) {
      if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
        node = (node as Record<string, unknown>)[part];
      } else {
        return key; // fallback: retorna a própria chave
      }
    }

    // if final node is a string return it; if it's a function, call it; otherwise fallback
    if (typeof node === 'string') return node;
    if (typeof node === 'function') {
      try {
        return String((node as () => unknown)());
      } catch {
        return key;
      }
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-localizado de propósito com o Provider
export const useLanguage = () => useContext(LanguageContext);
