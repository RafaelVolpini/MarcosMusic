import { cn, timeToMinutes } from '../../utils';
import type { Lesson } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { CELL_HEIGHT, formatTime } from '../../utils/calendarUtils';

interface LessonBlockProps {
  lesson: Lesson;
  hourStart: number;
  isUnavailable: boolean;
  isPast?: boolean;
  isInProgress?: boolean;
  blurContent?: boolean;
  lang: string;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
}

export function LessonBlock({ lesson, hourStart, isUnavailable, isPast, isInProgress, blurContent, lang, onClick, onDragStart }: LessonBlockProps) {
  const { t } = useLanguage();
  const startMins = timeToMinutes(lesson.startTime);
  const endMins = timeToMinutes(lesson.endTime);
  const top = ((startMins - hourStart * 60) / 60) * CELL_HEIGHT;
  const height = Math.max(((endMins - startMins) / 60) * CELL_HEIGHT - 2, 24);

  return (
    <div
      draggable={!isPast}
      onDragStart={isPast ? undefined : onDragStart}
      onClick={onClick}
      className={cn(
        'absolute left-1 right-1 rounded-lg px-2 py-1.5 overflow-hidden select-none border z-20 transition-all duration-150',
        blurContent ? 'cursor-default blur-[1.5px] opacity-50' : 'cursor-pointer hover:shadow-sm hover:z-30',
        lesson.status === 'completed' && 'opacity-70',
        isUnavailable && 'ring-1 ring-rose-300',
      )}
      style={{
        top: `${top}px`, height: `${height}px`,
        backgroundColor: 'color-mix(in srgb,var(--accent-500) 18%,var(--surface))',
        borderColor: isUnavailable ? '#fda4af' : 'color-mix(in srgb,var(--accent-500) 40%,var(--surface))',
      }}
    >
      <div className="absolute left-0 inset-y-0 w-1" style={{ backgroundColor: 'var(--accent-500)' }} />
      <p className="text-[11px] font-semibold text-(--heading) truncate leading-tight pl-1">{lesson.studentName}</p>
      {height > 32 && <p className="text-[10px] text-(--muted) truncate mt-0.5 pl-1">{formatTime(lesson.startTime, lang)} - {formatTime(lesson.endTime, lang)}</p>}
      {height > 44 && <p className="text-[10px] text-(--muted) truncate mt-0.5 pl-1">{lesson.instrument}</p>}
      {isInProgress && (
        <span className="absolute top-1 right-1 text-[9px] bg-amber-100 text-amber-700 font-semibold px-1 rounded">{t('calendar.inProgress')}</span>
      )}
      {isUnavailable && (
        <span className="absolute bottom-1 right-1 text-[9px] bg-rose-100 text-rose-600 font-semibold px-1 rounded">{t('calendar.conflict')}</span>
      )}
    </div>
  );
}
