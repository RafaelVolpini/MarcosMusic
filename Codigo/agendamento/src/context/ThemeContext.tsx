import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePreset = 'indigo' | 'teal' | 'sunset' | 'ocean' | 'forest' | 'amber' | 'rose' | 'purple';
export type ThemeDensity = 'compact' | 'comfortable';
export type ThemeSurface = 'solid' | 'soft' | 'glass';
export type ThemeRadius = 'md' | 'lg' | 'xl';
export type ThemeBgColor = 'default' | 'warm' | 'cool' | 'violet' | 'sage' | 'rose' | 'cream';
export type ThemeBundleId = 'neutro' | 'aurora' | 'cafe' | 'oceano' | 'floresta' | 'rubi' | 'pordosol' | 'safira';

export interface ThemeBundleDef {
  id: ThemeBundleId;
  label: string;
  description: string;
  preset: ThemePreset;
  bgColor: ThemeBgColor;
  accentA: string;
  accentB: string;
  lightBg: string;
  darkBg: string;
}

export const THEME_BUNDLES: ThemeBundleDef[] = [
  { id: 'neutro',   label: 'Neutro',      description: 'Limpo e minimalista',  preset: 'indigo',  bgColor: 'default', accentA: '#6366f1', accentB: '#9333ea', lightBg: '#e8eaf3', darkBg: '#020617' },
  { id: 'aurora',   label: 'Aurora',      description: 'Místico e criativo',   preset: 'purple',  bgColor: 'violet',  accentA: '#a855f7', accentB: '#6366f1', lightBg: '#eeeaff', darkBg: '#09041a' },
  { id: 'cafe',     label: 'Café',        description: 'Aconchegante',         preset: 'amber',   bgColor: 'cream',   accentA: '#f59e0b', accentB: '#f97316', lightBg: '#fdf8f0', darkBg: '#1a1208' },
  { id: 'oceano',   label: 'Oceano',      description: 'Fresco e moderno',     preset: 'ocean',   bgColor: 'cool',    accentA: '#06b6d4', accentB: '#2563eb', lightBg: '#e8f4fd', darkBg: '#030d1a' },
  { id: 'floresta', label: 'Floresta',    description: 'Natural e tranquilo',  preset: 'forest',  bgColor: 'sage',    accentA: '#10b981', accentB: '#16a34a', lightBg: '#e5f5ec', darkBg: '#030f07' },
  { id: 'rubi',     label: 'Rubi',        description: 'Intenso e apaixonado', preset: 'rose',    bgColor: 'rose',    accentA: '#ec4899', accentB: '#a855f7', lightBg: '#fef0f2', darkBg: '#1a0508' },
  { id: 'pordosol', label: 'Pôr do Sol',  description: 'Quente e vibrante',    preset: 'sunset',  bgColor: 'warm',    accentA: '#f43f5e', accentB: '#f59e0b', lightBg: '#f5ede2', darkBg: '#1c1917' },
  { id: 'safira',   label: 'Safira',      description: 'Sereno e confiante',   preset: 'teal',    bgColor: 'cool',    accentA: '#14b8a6', accentB: '#0ea5e9', lightBg: '#e8f4fd', darkBg: '#030d1a' },
];

export interface UiSettings {
  mode: ThemeMode;
  preset: ThemePreset;
  density: ThemeDensity;
  surface: ThemeSurface;
  radius: ThemeRadius;
  bgColor: ThemeBgColor;
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

interface BgPaletteMode {
  bg: string;
  surface: string;
  surfaceSoft: string;
  border: string;
  hoverBg: string;
  inputBg: string;
  inputBorder: string;
  dropdownBg: string;
  dropdownBorder: string;
  heading: string;
}

interface BgPalette {
  light: BgPaletteMode;
  dark: BgPaletteMode;
}

const STORAGE_KEY = 'marcos-music:ui-settings';

const DEFAULT_SETTINGS: UiSettings = {
  mode: 'system',
  preset: 'indigo',
  density: 'comfortable',
  surface: 'soft',
  radius: 'lg',
  bgColor: 'default',
};

const BG_PALETTES: Record<ThemeBgColor, BgPalette> = {
  default: {
    // Cool blue-gray tint noticeably off-white, not harsh
    light: { bg: '#e8eaf3', surface: '#f4f5fb', surfaceSoft: '#dfe2ef', border: '#c5cce6', hoverBg: '#d8dcee', inputBg: '#f4f5fb', inputBorder: '#c5cce6', dropdownBg: '#f4f5fb', dropdownBorder: '#d8dcee', heading: '#0f172a' },
    dark:  { bg: '#020617', surface: '#0f172a', surfaceSoft: '#111827', border: '#1f2937', hoverBg: '#1e293b', inputBg: '#1e293b', inputBorder: '#334155', dropdownBg: '#1e293b', dropdownBorder: '#334155', heading: '#f1f5f9' },
  },
  warm: {
    // Warm sand genuinely warm, not just off-white
    light: { bg: '#f5ede2', surface: '#fffdf9', surfaceSoft: '#f0e6d8', border: '#e5cdb3', hoverBg: '#eeddc5', inputBg: '#fffdf9', inputBorder: '#e5cdb3', dropdownBg: '#fffdf9', dropdownBorder: '#eeddc5', heading: '#1c1917' },
    dark:  { bg: '#1c1917', surface: '#292524', surfaceSoft: '#1c1917', border: '#44403c', hoverBg: '#3c3733', inputBg: '#292524', inputBorder: '#57534e', dropdownBg: '#292524', dropdownBorder: '#44403c', heading: '#fafaf9' },
  },
  cool: {
    // Sky blue tint
    light: { bg: '#e8f4fd', surface: '#f5fbff', surfaceSoft: '#dceefc', border: '#b3d9f7', hoverBg: '#c8e8f9', inputBg: '#f5fbff', inputBorder: '#b3d9f7', dropdownBg: '#f5fbff', dropdownBorder: '#c8e8f9', heading: '#1e3a5f' },
    dark:  { bg: '#030d1a', surface: '#0a1a2e', surfaceSoft: '#030d1a', border: '#1a3050', hoverBg: '#162540', inputBg: '#0a1a2e', inputBorder: '#1e3a5f', dropdownBg: '#0a1a2e', dropdownBorder: '#1a3050', heading: '#e0f2fe' },
  },
  violet: {
    // Soft lavender
    light: { bg: '#eeeaff', surface: '#faf9ff', surfaceSoft: '#e8e2ff', border: '#c9bfff', hoverBg: '#dbd5ff', inputBg: '#faf9ff', inputBorder: '#c9bfff', dropdownBg: '#faf9ff', dropdownBorder: '#dbd5ff', heading: '#2e1065' },
    dark:  { bg: '#09041a', surface: '#160a3a', surfaceSoft: '#09041a', border: '#2e1065', hoverBg: '#1e0a4a', inputBg: '#160a3a', inputBorder: '#3b0764', dropdownBg: '#160a3a', dropdownBorder: '#2e1065', heading: '#f5f3ff' },
  },
  sage: {
    // Mint green tint
    light: { bg: '#e5f5ec', surface: '#f4fdf7', surfaceSoft: '#d8eee0', border: '#9fcfb5', hoverBg: '#c5e8d3', inputBg: '#f4fdf7', inputBorder: '#9fcfb5', dropdownBg: '#f4fdf7', dropdownBorder: '#c5e8d3', heading: '#14532d' },
    dark:  { bg: '#030f07', surface: '#0a1e0e', surfaceSoft: '#030f07', border: '#14532d', hoverBg: '#0f2d16', inputBg: '#0a1e0e', inputBorder: '#166534', dropdownBg: '#0a1e0e', dropdownBorder: '#14532d', heading: '#dcfce7' },
  },
  rose: {
    // Soft rose blush
    light: { bg: '#fef0f2', surface: '#fff8f9', surfaceSoft: '#fde8eb', border: '#f9bbc6', hoverBg: '#fdd0d8', inputBg: '#fff8f9', inputBorder: '#f9bbc6', dropdownBg: '#fff8f9', dropdownBorder: '#fdd0d8', heading: '#4c0519' },
    dark:  { bg: '#1a0508', surface: '#270c10', surfaceSoft: '#1a0508', border: '#4c1320', hoverBg: '#3d0f1a', inputBg: '#270c10', inputBorder: '#63182a', dropdownBg: '#270c10', dropdownBorder: '#4c1320', heading: '#fecdd3' },
  },
  cream: {
    // Warm cream / café
    light: { bg: '#fdf8f0', surface: '#fffef9', surfaceSoft: '#f8f0e3', border: '#e8d5bb', hoverBg: '#f0e2cb', inputBg: '#fffef9', inputBorder: '#e8d5bb', dropdownBg: '#fffef9', dropdownBorder: '#f0e2cb', heading: '#1c1208' },
    dark:  { bg: '#1a1208', surface: '#271c0e', surfaceSoft: '#1a1208', border: '#3d2d18', hoverBg: '#332516', inputBg: '#271c0e', inputBorder: '#4d3820', dropdownBg: '#271c0e', dropdownBorder: '#3d2d18', heading: '#fdf8f0' },
  },
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
  amber: {
    accent50: '#fffbeb',
    accent100: '#fef3c7',
    accent500: '#f59e0b',
    accent600: '#d97706',
    accent700: '#b45309',
    accentGradientFrom: '#f59e0b',
    accentGradientTo: '#f97316',
  },
  rose: {
    accent50: '#fff1f2',
    accent100: '#ffe4e6',
    accent500: '#ec4899',
    accent600: '#db2777',
    accent700: '#be185d',
    accentGradientFrom: '#ec4899',
    accentGradientTo: '#a855f7',
  },
  purple: {
    accent50: '#faf5ff',
    accent100: '#ede9fe',
    accent500: '#a855f7',
    accent600: '#9333ea',
    accent700: '#7c3aed',
    accentGradientFrom: '#a855f7',
    accentGradientTo: '#6366f1',
  },
};

interface ThemeContextValue {
  settings: UiSettings;
  resolvedMode: 'light' | 'dark';
  activeBundle: ThemeBundleId | null;
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

  const activeBundle = useMemo<ThemeBundleId | null>(() => {
    return THEME_BUNDLES.find(b => b.preset === settings.preset && b.bgColor === settings.bgColor)?.id ?? null;
  }, [settings.preset, settings.bgColor]);

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

    const bg = BG_PALETTES[settings.bgColor][resolvedMode];
    root.style.setProperty('--bg', bg.bg);
    root.style.setProperty('--surface', bg.surface);
    root.style.setProperty('--surface-soft', bg.surfaceSoft);
    root.style.setProperty('--border', bg.border);
    root.style.setProperty('--hover-bg', bg.hoverBg);
    root.style.setProperty('--input-bg', bg.inputBg);
    root.style.setProperty('--input-border', bg.inputBorder);
    root.style.setProperty('--dropdown-bg', bg.dropdownBg);
    root.style.setProperty('--dropdown-border', bg.dropdownBorder);
    root.style.setProperty('--heading', bg.heading);
  }, [settings, resolvedMode]);

  const value = useMemo<ThemeContextValue>(() => ({
    settings,
    resolvedMode,
    activeBundle,
    setSettings: (next) => setSettingsState(prev => ({ ...prev, ...next })),
    resetSettings: () => setSettingsState(DEFAULT_SETTINGS),
  }), [resolvedMode, settings, activeBundle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSettings() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeSettings must be used inside ThemeProvider');
  }
  return context;
}
