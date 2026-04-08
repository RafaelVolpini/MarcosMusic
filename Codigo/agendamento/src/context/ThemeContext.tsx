import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePreset = 'indigo' | 'teal' | 'sunset' | 'ocean' | 'forest';
export type ThemeDensity = 'compact' | 'comfortable';
export type ThemeSurface = 'solid' | 'soft' | 'glass';
export type ThemeRadius = 'md' | 'lg' | 'xl';

export interface UiSettings {
  mode: ThemeMode;
  preset: ThemePreset;
  density: ThemeDensity;
  surface: ThemeSurface;
  radius: ThemeRadius;
}

interface PresetPalette {
  accent50: string;
  accent100: string;
  accent500: string;
  accent600: string;
  accent700: string;
  accentGradientFrom: string;
  accentGradientTo: string;
}

const STORAGE_KEY = 'musga-ui-settings';

const DEFAULT_SETTINGS: UiSettings = {
  mode: 'system',
  preset: 'indigo',
  density: 'comfortable',
  surface: 'soft',
  radius: 'lg',
};

const PALETTES: Record<ThemePreset, PresetPalette> = {
  indigo: {
    accent50: '#eef2ff',
    accent100: '#e0e7ff',
    accent500: '#6366f1',
    accent600: '#4f46e5',
    accent700: '#4338ca',
    accentGradientFrom: '#6366f1',
    accentGradientTo: '#9333ea',
  },
  teal: {
    accent50: '#f0fdfa',
    accent100: '#ccfbf1',
    accent500: '#14b8a6',
    accent600: '#0d9488',
    accent700: '#0f766e',
    accentGradientFrom: '#14b8a6',
    accentGradientTo: '#0ea5e9',
  },
  sunset: {
    accent50: '#fff1f2',
    accent100: '#ffe4e6',
    accent500: '#f43f5e',
    accent600: '#e11d48',
    accent700: '#be123c',
    accentGradientFrom: '#f43f5e',
    accentGradientTo: '#f59e0b',
  },
  ocean: {
    accent50: '#ecfeff',
    accent100: '#cffafe',
    accent500: '#06b6d4',
    accent600: '#0891b2',
    accent700: '#0e7490',
    accentGradientFrom: '#06b6d4',
    accentGradientTo: '#2563eb',
  },
  forest: {
    accent50: '#ecfdf5',
    accent100: '#d1fae5',
    accent500: '#10b981',
    accent600: '#059669',
    accent700: '#047857',
    accentGradientFrom: '#10b981',
    accentGradientTo: '#16a34a',
  },
};

interface ThemeContextValue {
  settings: UiSettings;
  resolvedMode: 'light' | 'dark';
  setSettings: (next: Partial<UiSettings>) => void;
  resetSettings: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredSettings(): UiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<UiSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function getSystemMode(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<UiSettings>(readStoredSettings);
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(() => getSystemMode());

  const resolvedMode = settings.mode === 'system' ? systemMode : settings.mode;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemMode(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const palette = PALETTES[settings.preset];

    root.dataset.theme = resolvedMode;
    root.dataset.density = settings.density;
    root.dataset.surface = settings.surface;
    root.dataset.radius = settings.radius;

    root.style.setProperty('--accent-50', palette.accent50);
    root.style.setProperty('--accent-100', palette.accent100);
    root.style.setProperty('--accent-500', palette.accent500);
    root.style.setProperty('--accent-600', palette.accent600);
    root.style.setProperty('--accent-700', palette.accent700);
    root.style.setProperty('--accent-gradient-from', palette.accentGradientFrom);
    root.style.setProperty('--accent-gradient-to', palette.accentGradientTo);
  }, [settings, resolvedMode]);

  const value = useMemo<ThemeContextValue>(() => ({
    settings,
    resolvedMode,
    setSettings: (next) => setSettingsState(prev => ({ ...prev, ...next })),
    resetSettings: () => setSettingsState(DEFAULT_SETTINGS),
  }), [resolvedMode, settings]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSettings() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeSettings must be used inside ThemeProvider');
  }
  return context;
}
