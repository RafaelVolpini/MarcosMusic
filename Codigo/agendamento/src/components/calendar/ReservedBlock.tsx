import { timeToMinutes } from '../../utils';
import type { Lesson } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { CELL_HEIGHT, formatTime } from '../../utils/calendarUtils';

export function ReservedBlock({ lesson, hourStart }: { lesson: Lesson; hourStart: number }) {
  const { t, lang } = useLanguage();
  const top = ((timeToMinutes(lesson.startTime) - hourStart * 60) / 60) * CELL_HEIGHT;
  const height = Math.max(((timeToMinutes(lesson.endTime) - timeToMinutes(lesson.startTime)) / 60) * CELL_HEIGHT - 2, 20);

  return (
    <div className="absolute left-1 right-1 rounded-lg select-none z-10 cursor-default group/reserved" style={{ top: `${top}px`, height: `${height}px` }}>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-50 opacity-0 group-hover/reserved:opacity-100 transition-opacity duration-150 flex flex-col items-center">
        <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shadow-md whitespace-nowrap" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
          {t('calendar.reserved')} · {formatTime(lesson.startTime, lang)} – {formatTime(lesson.endTime, lang)}
        </div>
        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--border)' }} />
      </div>
      <div className="absolute inset-0 rounded-lg opacity-70" style={{ backgroundImage: 'repeating-linear-gradient(135deg,transparent,transparent 4px,rgba(0,0,0,0.06) 4px,rgba(0,0,0,0.06) 8px)', backgroundColor: 'var(--surface-soft)', border: '1px dashed var(--border)' }} />
      <div className="relative flex items-center gap-1 px-1.5 h-full">
        <span className="w-2 h-2 rounded-full shrink-0 bg-rose-400" />
        {height > 28 && <span className="text-[10px] font-semibold text-(--muted) truncate">{t('calendar.reserved')}</span>}
      </div>
    </div>
  );
}
