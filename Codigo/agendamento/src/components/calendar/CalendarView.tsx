import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react';
import type { Lesson, WeeklyAvailability } from '../../types';
import type { AuthUser } from '../../lib/auth';
import type { ReposicaoDTO } from '../../services/reposicaoService';
import { getWeekDays, formatDateISO, isToday, timeToMinutes, cn, getDayKeyFromISODate, getNowInTimezone } from '../../utils';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { HOUR_START, HOUR_END, HOURS, CELL_HEIGHT, formatHourLabel } from '../../utils/calendarUtils';
import { CalendarCellOverlay } from './CalendarCellOverlay';
import { CellStateTooltip } from './CellStateTooltip';
import { NowLine } from './NowLine';
import { LessonBlock } from './LessonBlock';
import { ReservedBlock } from './ReservedBlock';
import { ReposicaoBlock } from './ReposicaoBlock';

interface CalendarProps {
  lessons: Lesson[];
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  reposicoes?: ReposicaoDTO[];
  currentUser?: AuthUser;
  onLessonClick: (lesson: Lesson) => void;
  onNewLesson: (date: string, time: string) => void;
  onLessonMove: (lessonId: string, newDate: string, newStartTime: string) => void;
  onWeekChange?: (dataInicio: string, dataFim: string) => void;
  onReposicaoClick?: (reposicao: ReposicaoDTO) => void;
}

type ViewType = 'week' | 'day';

function isOwnLesson(lesson: Lesson, currentUser?: AuthUser): boolean {
  if (!currentUser || currentUser.role === 'teacher') return true;
  if (currentUser.id != null && lesson.studentId === currentUser.id) return true;
  return lesson.studentName.trim().toLowerCase() === currentUser.name.trim().toLowerCase();
}

export function CalendarView({ lessons, availability, availabilityReposicao, reposicoes = [], currentUser, onLessonClick, onNewLesson, onLessonMove, onWeekChange, onReposicaoClick }: CalendarProps) {
  const [view, setView] = useState<ViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragging, setDragging] = useState<{ lesson: Lesson; offsetMinutes: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ date: string; time: string } | null>(null);
  const { appSettings } = useAppSettings();
  const { timezone } = appSettings;
  const { t, lang } = useLanguage();
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  const DAY_LABELS = [t('calendar.days.sun'), t('calendar.days.mon'), t('calendar.days.tue'), t('calendar.days.wed'), t('calendar.days.thu'), t('calendar.days.fri'), t('calendar.days.sat')];
  // Re-renderiza a cada minuto para manter a "linha do agora" atualizada;
  // o horário em si é derivado no render, não guardado em estado.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const nowTime = getNowInTimezone(timezone);

  const weekDays = getWeekDays(currentDate);
  const displayDays = view === 'week' ? weekDays : [currentDate];

  const notify = useCallback((date: Date, v: ViewType) => {
    if (!onWeekChange) return;
    if (v === 'week') {
      const days = getWeekDays(date);
      onWeekChange(formatDateISO(days[0]) + 'T00:00:00', formatDateISO(days[6]) + 'T23:59:59');
    } else {
      onWeekChange(formatDateISO(date) + 'T00:00:00', formatDateISO(date) + 'T23:59:59');
    }
  }, [onWeekChange]);

  useEffect(() => { notify(currentDate, view); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (view === 'week' ? dir * 7 : dir));
    setCurrentDate(d);
    notify(d, view);
  };

  const isAvailable = useCallback((dateISO: string, time: string) => {
    const dayKey = getDayKeyFromISODate(dateISO);
    const slot = `${time.slice(0, 2)}:00`;
    return availability[dayKey].includes(slot) || availabilityReposicao[dayKey].includes(slot);
  }, [availability, availabilityReposicao]);

  const handleDragStart = useCallback((lesson: Lesson, e: React.DragEvent) => {
    setDragging({ lesson, offsetMinutes: timeToMinutes(lesson.startTime) - HOUR_START * 60 });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((date: string, hour: number, e: React.DragEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const totalMins = hour * 60 + Math.floor((Math.max(0, e.clientY - rect.top) / CELL_HEIGHT) * 60);
    const snapped = Math.round(totalMins / 60) * 60;
    setDragOver({ date, time: `${String(Math.floor(snapped / 60)).padStart(2, '0')}:${String(snapped % 60).padStart(2, '0')}` });
  }, []);

  const handleDrop = useCallback((date: string) => {
    if (dragging && dragOver?.date === date && isAvailable(date, dragOver.time)) {
      if (dragging.lesson.date !== dragOver.date || dragging.lesson.startTime !== dragOver.time) {
        onLessonMove(dragging.lesson.id, date, dragOver.time);
      }
    }
    setDragging(null);
    setDragOver(null);
  }, [dragging, dragOver, isAvailable, onLessonMove]);

  const headerLabel = view === 'week'
    ? `${weekDays[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
    : currentDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-(--border) bg-(--surface) shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-(--muted) hover:bg-(--hover-bg) transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={() => { const d = new Date(); setCurrentDate(d); notify(d, view); }} className="px-3 h-8 text-xs font-semibold text-(--accent-600) hover:bg-(--accent-icon-bg) rounded-lg transition-colors">{t('calendar.today')}</button>
          <button onClick={() => navigate(1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-(--muted) hover:bg-(--hover-bg) transition-colors"><ChevronRight size={16} /></button>
        </div>
        <h2 className="text-sm font-bold text-(--heading) capitalize flex-1">{headerLabel}</h2>
        <div className="hidden lg:flex items-center gap-3 ml-1 text-[11px] text-(--muted)">
          <span className="hidden md:flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb,var(--accent-500) 50%,transparent)' }} />Aula</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400/50" />Reposição</span>
          </span>
          <span className="inline-flex items-center gap-1 italic"><MousePointerClick size={11} />{t('calendar.clickHint')}</span>
        </div>
        <div className="flex items-center bg-(--surface-soft) border border-(--border) rounded-xl p-0.5">
          {(['week', 'day'] as ViewType[]).map(v => (
            <button key={v} onClick={() => { setView(v); notify(currentDate, v); }} className={cn('px-3 h-7 text-xs font-semibold rounded-lg transition-all', view === v ? 'bg-(--surface) text-(--heading) shadow-sm' : 'text-(--muted) hover:text-(--text)')}>
              {v === 'week' ? t('calendar.week') : t('calendar.day')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-(--surface) isolate">
        <div className="grid h-full" style={{ gridTemplateColumns: `56px repeat(${displayDays.length}, 1fr)` }}>
          <div className="border-b border-(--border) sticky top-0 z-45 bg-(--surface)" />
          {displayDays.map((day, i) => {
            const today = isToday(day);
            return (
              <div key={i} className="border-b border-l border-(--border) sticky top-0 z-45 bg-(--surface) px-2 py-2 text-center">
                <p className={cn('text-xs font-semibold', today ? 'text-(--accent-600)' : 'text-(--muted)')}>{DAY_LABELS[day.getDay()]}</p>
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold', today ? 'text-white' : 'text-(--heading)')} style={today ? { background: 'linear-gradient(135deg,var(--accent-gradient-from),var(--accent-gradient-to))' } : {}}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}

          {HOURS.map(hour => (
            <div key={hour} className="contents">
              <div className="pr-2 pt-1 text-right border-r border-(--border) select-none" style={{ height: CELL_HEIGHT }}>
                <span className="text-xs text-(--muted) font-medium">{formatHourLabel(hour, lang)}</span>
              </div>
              {displayDays.map((day, di) => {
                const dateStr = formatDateISO(day);
                const cellTime = `${String(hour).padStart(2, '0')}:00`;
                const now = getNowInTimezone(timezone);
                const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
                const isPast = dateStr < todayStr || (dateStr === todayStr && hour * 60 < now.getHours() * 60 + now.getMinutes());
                const unavailable = !isPast && !isAvailable(dateStr, cellTime);
                const dayLessons = lessons.filter(l => l.date === dateStr && timeToMinutes(l.startTime) >= hour * 60 && timeToMinutes(l.startTime) < (hour + 1) * 60);
                const dayReposicoes = reposicoes.filter(r => r.dataAula === dateStr && timeToMinutes(r.horario) >= hour * 60 && timeToMinutes(r.horario) < (hour + 1) * 60);
                const blocked = isPast || unavailable || dayLessons.length > 0 || dayReposicoes.length > 0;

                return (
                  <div key={`${hour}-${di}`} className={cn('relative border-b border-l border-(--border) group', isPast || unavailable ? 'cursor-not-allowed' : blocked ? 'cursor-default' : 'cursor-pointer')} style={{ height: CELL_HEIGHT }}
                    onDragOver={blocked ? undefined : (e) => handleDragOver(dateStr, hour, e)}
                    onDrop={blocked ? undefined : () => handleDrop(dateStr)}
                    onClick={() => { if (!blocked) onNewLesson(dateStr, cellTime); }}
                  >
                    {isPast && <div className="absolute inset-0 pointer-events-none z-1" style={{ background: 'repeating-linear-gradient(135deg,color-mix(in srgb,var(--text) 3%,transparent) 0px,color-mix(in srgb,var(--text) 3%,transparent) 5px,color-mix(in srgb,var(--text) 6%,transparent) 5px,color-mix(in srgb,var(--text) 6%,transparent) 6px)' }} />}
                    {unavailable && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center" style={{ background: 'repeating-linear-gradient(135deg,color-mix(in srgb,var(--accent-500) 15%,transparent) 0px,color-mix(in srgb,var(--accent-500) 15%,transparent) 6px,color-mix(in srgb,var(--accent-500) 28%,transparent) 6px,color-mix(in srgb,var(--accent-500) 28%,transparent) 7px)' }}>
                        <span className="text-[9px] font-bold uppercase tracking-widest select-none text-center leading-tight px-1.5 py-0.5 rounded pointer-events-none whitespace-pre-line relative z-1" style={{ color: 'var(--accent-600)', backgroundColor: 'color-mix(in srgb,var(--surface) 88%,transparent)' }}>{t('calendar.unavailableLabel')}</span>
                      </div>
                    )}
                    {dayLessons.length === 0 && dayReposicoes.length === 0 && <CellStateTooltip state={isPast ? 'past' : unavailable ? 'unavailable' : 'available'} />}
                    <CalendarCellOverlay visible={!blocked} />
                    {dragging && !blocked && <div className="absolute inset-0 z-30" onDragOver={(e) => handleDragOver(dateStr, hour, e)} onDrop={(e) => { e.stopPropagation(); handleDrop(dateStr); }} />}
                    {dragOver?.date === dateStr && dragging && !blocked && <div className="absolute left-1 right-1 h-12 border-2 border-dashed rounded-lg opacity-60" style={{ top: `${((timeToMinutes(dragOver.time) - hour * 60) / 60) * CELL_HEIGHT}px`, backgroundColor: 'var(--accent-icon-bg)', borderColor: 'var(--accent-500)' }} />}
                    {isToday(day) && hour === nowTime.getHours() && nowTime.getHours() >= HOUR_START && nowTime.getHours() < HOUR_END && <NowLine minuteOffset={nowTime.getMinutes()} />}
                    {dayLessons.map(lesson => {
                      const own = isOwnLesson(lesson, currentUser);
                      if (!own) return <ReservedBlock key={lesson.id} lesson={lesson} hourStart={hour} />;
                      const tzNow = getNowInTimezone(timezone);
                      const tzNowStr = `${tzNow.getFullYear()}-${String(tzNow.getMonth()+1).padStart(2,'0')}-${String(tzNow.getDate()).padStart(2,'0')}`;
                      const nowMins = tzNow.getHours() * 60 + tzNow.getMinutes();
                      const isInProgress = dateStr === tzNowStr && timeToMinutes(lesson.startTime) <= nowMins && timeToMinutes(lesson.endTime) > nowMins;
                      return <LessonBlock key={lesson.id} lesson={lesson} hourStart={hour} isPast={isPast || isInProgress} isInProgress={isInProgress} blurContent={(isPast || isInProgress) && !!currentUser && currentUser.role !== 'teacher'} isUnavailable={!isAvailable(dateStr, lesson.startTime)} lang={lang} onClick={(e) => { e.stopPropagation(); onLessonClick(lesson); }} onDragStart={(e) => handleDragStart(lesson, e)} />;
                    })}
                    {dayReposicoes.map(r => <ReposicaoBlock key={`repos-${r.id}`} reposicao={r} hourStart={hour} onClick={onReposicaoClick ? (e) => { e.stopPropagation(); onReposicaoClick(r); } : undefined} />)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
