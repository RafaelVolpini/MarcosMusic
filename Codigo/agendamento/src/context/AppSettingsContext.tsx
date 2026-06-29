import { createContext, useContext, useState, type ReactNode } from 'react';

export interface AppSettings {
  timezone: string;
}

const STORAGE_KEY = 'marcos-music-app-settings';

const DEFAULTS: AppSettings = {
  timezone: 'America/Sao_Paulo',
};

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

interface AppSettingsCtx {
  appSettings: AppSettings;
  setTimezone: (tz: string) => void;
}

const Ctx = createContext<AppSettingsCtx | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [appSettings, setAppSettings] = useState<AppSettings>(load);

  const setTimezone = (tz: string) => {
    const next = { ...appSettings, timezone: tz };
    setAppSettings(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  return <Ctx.Provider value={{ appSettings, setTimezone }}>{children}</Ctx.Provider>;
}

export function useAppSettings(): AppSettingsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppSettings must be used inside AppSettingsProvider');
  return ctx;
}
