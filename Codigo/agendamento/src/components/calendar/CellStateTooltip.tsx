import { useLanguage } from '../../context/LanguageContext';

const CONFIGS = {
  available:   { key: 'calendar.stateAvailable',   bg: 'color-mix(in srgb,#22c55e 12%,var(--surface))',                   border: '#16a34a',          color: '#16a34a' },
  unavailable: { key: 'calendar.stateUnavailable', bg: 'color-mix(in srgb,var(--accent-500) 14%,var(--surface))',          border: 'var(--accent-500)', color: 'var(--accent-600)' },
  past:        { key: 'calendar.statePast',         bg: 'var(--surface-soft)',                                              border: 'var(--border)',     color: 'var(--muted)' },
} as const;

export function CellStateTooltip({ state }: { state: keyof typeof CONFIGS }) {
  const { t } = useLanguage();
  const c = CONFIGS[state];
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center">
      <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shadow-md whitespace-nowrap" style={{ backgroundColor: c.bg, borderColor: c.border, color: c.color }}>
        {t(c.key)}
      </div>
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${c.border}` }} />
    </div>
  );
}
