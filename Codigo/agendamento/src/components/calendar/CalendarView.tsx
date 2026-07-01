import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MousePointerClick, RefreshCw } from 'lucide-react';
import type { Lesson, WeeklyAvailability } from '../../types';
import type { AuthUser } from '../../lib/auth';
import type { ReposicaoDTO } from '../../services/reposicaoService';
import {
  getWeekDays, formatDateISO, isToday,
  timeToMinutes, cn, getDayKeyFromISODate, getNowInTimezone,
} from '../../utils';
import { CalendarCellOverlay } from './CalendarCellOverlay';
import { ReposicaoBlock } from './ReposicaoBlock';
import { getGoogleConnectedFlag } from '../../services/googleService';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useLanguage } from '../../context/LanguageContext';

// ─── Time helpers ─────────────────────────────────────────────────────────────

/** Formats a HH:mm string according to locale: 24h for PT, 12h AM/PM for EN */
export function formatTime(time: string, lang: string): string {
  if (lang !== 'en') return time;
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
}

/** Formats an hour integer as a column label */
function formatHourLabel(hour: number, lang: string): string {
  if (lang !== 'en') return `${hour}:00`;
  const period = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 || 12;
  return `${h12} ${period}`;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HOUR_START = 7;
const HOUR_END = 24;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const CELL_HEIGHT = 64; // px per hour

// ─── Types ───────────────────────────────────────────────────────────────────

type CalendarView = 'week' | 'day';

interface CalendarProps {
  lessons: Lesson[];
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  reposicoes?: ReposicaoDTO[];
  currentUser?: AuthUser;
  onLessonClick: (lesson: Lesson) => void;
  onNewLesson: (date: string, time: string) => void;
  onLessonMove: (lessonId: string, newDate: string, newStartTime: string) => void;
  onSyncCalendar?: () => void;
  syncingCalendar?: boolean;
  /** Chamado toda vez que a semana/dia visível muda. Recebe [dataInicio, dataFim] ISO. */
  onWeekChange?: (dataInicio: string, dataFim: string) => void;
  onReposicaoClick?: (reposicao: ReposicaoDTO) => void;
}

// ─── Main Calendar ───────────────────────────────────────────────────────────

function isOwnLesson(lesson: Lesson, currentUser?: AuthUser): boolean {
  if (!currentUser || currentUser.role === 'teacher') return true;
  if (currentUser.id != null && lesson.studentId === currentUser.id) return true;
  return lesson.studentName.trim().toLowerCase() === currentUser.name.trim().toLowerCase();
}

export function CalendarView({
  lessons,
  availability,
  availabilityReposicao,
  reposicoes = [],
  currentUser,
  onLessonClick,
  onNewLesson,
  onLessonMove,
  onSyncCalendar,
  syncingCalendar,
  onWeekChange,
  onReposicaoClick,
}: CalendarProps) {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragging, setDragging] = useState<{ lesson: Lesson; offsetMinutes: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ date: string; time: string } | null>(null);
  const { appSettings } = useAppSettings();
  const { timezone } = appSettings;
  const { t, lang } = useLanguage();
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  const DAY_LABELS = [
    t('calendar.days.sun'), t('calendar.days.mon'), t('calendar.days.tue'),
    t('calendar.days.wed'), t('calendar.days.thu'), t('calendar.days.fri'), t('calendar.days.sat'),
  ];
  const [nowTime, setNowTime] = useState(() => getNowInTimezone(timezone));

  useEffect(() => {
    setNowTime(getNowInTimezone(timezone));
    const id = setInterval(() => setNowTime(getNowInTimezone(timezone)), 60_000);
    return () => clearInterval(id);
  }, [timezone]);

  const weekDays = getWeekDays(currentDate);

  const notifyWeekChange = (date: Date, currentView: CalendarView) => {
    if (!onWeekChange) return;
    if (currentView === 'week') {
      const days = getWeekDays(date);
      onWeekChange(formatDateISO(days[0]) + 'T00:00:00', formatDateISO(days[6]) + 'T23:59:59');
    } else {
      onWeekChange(formatDateISO(date) + 'T00:00:00', formatDateISO(date) + 'T23:59:59');
    }
  };

  // Notifica a semana inicial ao montar
  useEffect(() => { notifyWeekChange(currentDate, view); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
    notifyWeekChange(d, view);
  };

  const goToday = () => {
    const d = new Date();
    setCurrentDate(d);
    notifyWeekChange(d, view);
  };

  const displayDays = view === 'week' ? weekDays : [currentDate];

  const isAvailable = useCallback((dateISO: string, time: string) => {
    const dayKey = getDayKeyFromISODate(dateISO);
    const hourSlot = `${time.slice(0, 2)}:00`;
    return availability[dayKey].includes(hourSlot) || availabilityReposicao[dayKey].includes(hourSlot);
  }, [availability, availabilityReposicao]);

  const headerLabel = view === 'week'
    ? `${weekDays[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
    : currentDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Drag handlers
  const handleDragStart = useCallback((lesson: Lesson, e: React.DragEvent) => {
    // Block students from dragging attendance-confirmed, non-owned or <24h lessons
    if (currentUser && currentUser.role !== 'teacher') {
      const startDt = new Date(`${lesson.date}T${lesson.startTime}:00`);
      const within24h = new Date() >= new Date(startDt.getTime() - 24 * 60 * 60 * 1000);
      if (lesson.attendanceConfirmed || !isOwnLesson(lesson, currentUser) || within24h) {
        e.preventDefault();
        return;
      }
    }
    const startMins = timeToMinutes(lesson.startTime);
    const clickMins = HOUR_START * 60;
    setDragging({ lesson, offsetMinutes: startMins - clickMins });
    e.dataTransfer.effectAllowed = 'move';
  }, [currentUser]);

  const handleDragOver = useCallback((date: string, hour: number, e: React.DragEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = Math.max(0, e.clientY - rect.top);
    const totalMins = hour * 60 + Math.floor((relY / CELL_HEIGHT) * 60);
    const snapped = Math.round(totalMins / 60) * 60;
    const h = Math.floor(snapped / 60);
    const m = snapped % 60;
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setDragOver({ date, time });
  }, []);

  const handleDrop = useCallback((date: string) => {
    if (dragging && dragOver && dragOver.date === date && isAvailable(date, dragOver.time)) {
      const sameDate = dragging.lesson.date === dragOver.date;
      const sameTime = dragging.lesson.startTime === dragOver.time;
      if (!sameDate || !sameTime) {
        onLessonMove(dragging.lesson.id, date, dragOver.time);
      }
    }
    setDragging(null);
    setDragOver(null);
  }, [dragging, dragOver, isAvailable, onLessonMove]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-(--border) bg-(--surface) shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-(--muted) hover:bg-(--hover-bg) transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToday}
            className="px-3 h-8 text-xs font-semibold text-(--accent-600) hover:bg-(--accent-icon-bg) rounded-lg transition-colors"
          >
            {t('calendar.today')}
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-(--muted) hover:bg-(--hover-bg) transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <h2 className="text-sm font-bold text-(--heading) capitalize flex-1">{headerLabel}</h2>

        {/* View toggle */}
        <div className="hidden lg:flex items-center gap-3 ml-1 text-[11px] text-(--muted)">
            <span className="inline-flex items-center gap-1 text-(--muted) italic">
              <MousePointerClick size={11} />
              {t('calendar.clickHint')}
            </span>
        </div>

        {onSyncCalendar && (
          <div className="relative group">
            <button
              onClick={onSyncCalendar}
              disabled={syncingCalendar}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-(--muted) hover:text-(--accent-600) hover:bg-(--accent-icon-bg) transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} className={syncingCalendar ? 'animate-spin' : ''} />
            </button>
            {/* Google sync tooltip popup */}
            <div className="pointer-events-none absolute right-0 top-9 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border border-(--border) bg-(--dropdown-bg) whitespace-nowrap">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                  style={{ backgroundColor: '#4285F4' }}
                >
                  G
                </span>
                <span className="text-xs font-medium text-(--text)">
                  {syncingCalendar
                    ? t('calendar.syncing')
                    : getGoogleConnectedFlag()
                      ? t('calendar.syncGoogle')
                      : 'Conectar Google Calendar'}
                </span>
              </div>
              {/* arrow */}
              <div className="absolute -top-1.5 right-2.5 w-3 h-3 rotate-45 bg-(--dropdown-bg) border-l border-t border-(--border)" />
            </div>
          </div>
        )}

        <div className="flex items-center bg-(--surface-soft) border border-(--border) rounded-xl p-0.5">
          {(['week', 'day'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 h-7 text-xs font-semibold rounded-lg transition-all',
                view === v
                  ? 'bg-(--surface) text-(--heading) shadow-sm'
                  : 'text-(--muted) hover:text-(--text)',
              )}
            >
              {v === 'week' ? t('calendar.week') : t('calendar.day')}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto bg-(--surface) isolate">
        <div className="grid h-full" style={{ gridTemplateColumns: `56px repeat(${displayDays.length}, 1fr)` }}>
          {/* Day headers */}
          <div className="border-b border-(--border) sticky top-0 z-35 bg-(--surface)" />
          {displayDays.map((day, i) => {
            const today = isToday(day);
            return (
              <div
                key={i}
                className="border-b border-l border-(--border) sticky top-0 z-35 bg-(--surface) px-2 py-2 text-center"
              >
                <p className={cn('text-xs font-semibold', today ? 'text-(--accent-600)' : 'text-(--muted)')}>
                  {DAY_LABELS[day.getDay()]}
                </p>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold',
                    today ? 'text-white' : 'text-(--heading)',
                  )}
                  style={today ? { background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' } : {}}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}

          {/* Time grid */}
          {HOURS.map(hour => (
            <div key={hour} className="contents">
              {/* Hour label */}
              <div className="pr-2 pt-1 text-right border-r border-(--border) select-none" style={{ height: CELL_HEIGHT }}>
                <span className="text-xs text-(--muted) font-medium">{formatHourLabel(hour, lang)}</span>
              </div>

              {/* Day columns */}
              {displayDays.map((day, di) => {
                const dateStr = formatDateISO(day);
                const cellTime = `${String(hour).padStart(2, '0')}:00`;

                // Passado: dia anterior ao hoje, ou mesma hora já passou (precisão de minuto)
                const now = getNowInTimezone(timezone);
                const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
                const nowTotalMins = now.getHours() * 60 + now.getMinutes();
                const isPast = dateStr < todayStr || (dateStr === todayStr && hour * 60 < nowTotalMins);

                // Indisponível só vale para datas a partir de hoje
                const unavailable = !isPast && !isAvailable(dateStr, cellTime);

                const dayLessons = lessons.filter(l =>
                  l.date === dateStr &&
                  timeToMinutes(l.startTime) >= hour * 60 &&
                  timeToMinutes(l.startTime) < (hour + 1) * 60
                );

                const dayReposicoes = reposicoes.filter(r =>
                  r.dataAula === dateStr &&
                  timeToMinutes(r.horario) >= hour * 60 &&
                  timeToMinutes(r.horario) < (hour + 1) * 60
                );

                // Célula bloqueada: passado, indisponível, ou já tem aula (própria ou de outro aluno)
                const hasAnyLesson = dayLessons.length > 0;
                const hasReposicao = dayReposicoes.length > 0;
                const blocked = isPast || unavailable || hasAnyLesson || hasReposicao;

                return (
                  <div
                    key={`cell-${hour}-${di}`}
                    className={cn(
                      'relative border-b border-l border-(--border) group',
                      isPast || unavailable ? 'cursor-not-allowed' : hasAnyLesson ? 'cursor-default' : 'cursor-pointer',
                    )}
                    style={{ height: CELL_HEIGHT }}
                    onDragOver={blocked ? undefined : (e) => handleDragOver(dateStr, hour, e)}
                    onDrop={blocked ? undefined : () => handleDrop(dateStr)}
                    onClick={() => {
                      if (blocked) return;
                      onNewLesson(dateStr, cellTime);
                    }}
                  >
                    {/* Passado: listras sutis usando --text (funciona em claro e escuro) */}
                    {isPast && (
                      <div
                        className="absolute inset-0 pointer-events-none z-1"
                        style={{
                          background: 'repeating-linear-gradient(135deg, color-mix(in srgb, var(--text) 3%, transparent) 0px, color-mix(in srgb, var(--text) 3%, transparent) 5px, color-mix(in srgb, var(--text) 6%, transparent) 5px, color-mix(in srgb, var(--text) 6%, transparent) 6px)',
                        }}
                      />
                    )}

                    {/* Indisponível (futuro): listras accent, visível em claro e escuro */}
                    {unavailable && (
                      <div
                        className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center"
                        style={{
                          background: 'repeating-linear-gradient(135deg, color-mix(in srgb, var(--accent-500) 15%, transparent) 0px, color-mix(in srgb, var(--accent-500) 15%, transparent) 6px, color-mix(in srgb, var(--accent-500) 28%, transparent) 6px, color-mix(in srgb, var(--accent-500) 28%, transparent) 7px)',
                        }}
                      >
                        <span
                          className="text-[9px] font-bold uppercase tracking-widest select-none text-center leading-tight px-1.5 py-0.5 rounded pointer-events-none whitespace-pre-line"
                          style={{
                            color: 'var(--accent-600)',
                            backgroundColor: 'color-mix(in srgb, var(--surface) 88%, transparent)',
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          {t('calendar.unavailableLabel')}
                        </span>
                      </div>
                    )}

                    {/* Tooltip contextual no hover só quando não há aulas nem reposições */}
                    {dayLessons.length === 0 && dayReposicoes.length === 0 && (
                      <CellStateTooltip state={isPast ? 'past' : unavailable ? 'unavailable' : 'available'} />
                    )}

                    {/* Hover overlay só células disponíveis */}
                    <CalendarCellOverlay visible={!blocked} />

                    {/* Drag capture overlay garante que o drop sempre aterrissa na célula */}
                    {dragging && !blocked && (
                      <div
                        className="absolute inset-0 z-30"
                        onDragOver={(e) => handleDragOver(dateStr, hour, e)}
                        onDrop={(e) => { e.stopPropagation(); handleDrop(dateStr); }}
                      />
                    )}

                    {/* Drop indicator */}
                    {dragOver?.date === dateStr && dragging && !blocked && (
                      <div
                        className="absolute left-1 right-1 h-12 border-2 border-dashed rounded-lg opacity-60"
                        style={{
                          top: `${((timeToMinutes(dragOver.time) - hour * 60) / 60) * CELL_HEIGHT}px`,
                          backgroundColor: 'var(--accent-icon-bg)',
                          borderColor: 'var(--accent-500)',
                        }}
                      />
                    )}

                    {/* Linha de agora */}
                    {isToday(day) && hour === nowTime.getHours() && nowTime.getHours() >= HOUR_START && nowTime.getHours() < HOUR_END && (
                      <NowLine minuteOffset={nowTime.getMinutes()} />
                    )}

                    {/* Lessons */}
                    {dayLessons.map(lesson => {
                      const own = isOwnLesson(lesson, currentUser);
                      if (!own) {
                        return (
                          <ReservedBlock
                            key={lesson.id}
                            lesson={lesson}
                            hourStart={hour}
                          />
                        );
                      }
                      // Em andamento: startTime <= agora < endTime (mesmo dia) timezone-aware
                      const tzNow = getNowInTimezone(timezone);
                      const tzNowStr = `${tzNow.getFullYear()}-${String(tzNow.getMonth()+1).padStart(2,'0')}-${String(tzNow.getDate()).padStart(2,'0')}`;
                      const nowMins = tzNow.getHours() * 60 + tzNow.getMinutes();
                      const lessonStartMins = timeToMinutes(lesson.startTime);
                      const lessonEndMins = timeToMinutes(lesson.endTime);
                      const isLessonInProgress =
                        dateStr === tzNowStr &&
                        lessonStartMins <= nowMins &&
                        lessonEndMins > nowMins;
                      const effectivePast = isPast || isLessonInProgress;
                      const isStudent = !!currentUser && currentUser.role !== 'teacher';
                      const attendanceLocked = isStudent && !!lesson.attendanceConfirmed;
                      const notOwn = isStudent && !isOwnLesson(lesson, currentUser);
                      const lessonStartDt = new Date(`${dateStr}T${lesson.startTime}:00`);
                      const within24h = isStudent && new Date() >= new Date(lessonStartDt.getTime() - 24 * 60 * 60 * 1000);
                      const canDrag = !effectivePast && !attendanceLocked && !notOwn && !within24h;
                      return (
                        <LessonBlock
                          key={lesson.id}
                          lesson={lesson}
                          hourStart={hour}
                          isPast={effectivePast}
                          isInProgress={isLessonInProgress}
                          blurContent={effectivePast && isStudent}
                          isDraggable={canDrag}
                          isUnavailable={!isAvailable(dateStr, lesson.startTime)}
                          lang={lang}
                          onClick={(e) => { e.stopPropagation(); onLessonClick(lesson); }}
                          onDragStart={(e) => handleDragStart(lesson, e)}
                        />
                      );
                    })}

                    {dayReposicoes.map(r => (
                      <ReposicaoBlock
                        key={`repos-${r.id}`}
                        reposicao={r}
                        hourStart={hour}
                        cellHeight={CELL_HEIGHT}
                        onClick={onReposicaoClick ? (e) => { e.stopPropagation(); onReposicaoClick(r); } : undefined}
                      />
                    ))}
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


// ─── Cell State Tooltip ──────────────────────────────────────────────────────

function CellStateTooltip({ state }: { state: 'available' | 'unavailable' | 'past' }) {
  const { t } = useLanguage();
  const configs = {
    available: {
      label: t('calendar.stateAvailable'),
      bg: 'color-mix(in srgb, #22c55e 12%, var(--surface))',
      border: '#16a34a',
      color: '#16a34a',
    },
    unavailable: {
      label: t('calendar.stateUnavailable'),
      bg: 'color-mix(in srgb, var(--accent-500) 14%, var(--surface))',
      border: 'var(--accent-500)',
      color: 'var(--accent-600)',
    },
    past: {
      label: t('calendar.statePast'),
      bg: 'var(--surface-soft)',
      border: 'var(--border)',
      color: 'var(--muted)',
    },
  } as const;

  const c = configs[state];

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center">
      <div
        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shadow-md whitespace-nowrap"
        style={{ backgroundColor: c.bg, borderColor: c.border, color: c.color }}
      >
        {c.label}
      </div>
      {/* seta apontando para baixo */}
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${c.border}` }} />
    </div>
  );
}

interface LessonBlockProps {
  lesson: Lesson;
  hourStart: number;
  isUnavailable: boolean;
  isPast?: boolean;
  isInProgress?: boolean;
  blurContent?: boolean;
  isDraggable?: boolean;
  lang: string;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
}

function LessonBlock({ lesson, hourStart, isUnavailable, isInProgress, blurContent, isDraggable, lang, onClick, onDragStart }: LessonBlockProps) {
  const { t } = useLanguage();
  const startMins = timeToMinutes(lesson.startTime);
  const endMins = timeToMinutes(lesson.endTime);
  const durationMins = endMins - startMins;
  const offsetMins = startMins - hourStart * 60;

  const top = (offsetMins / 60) * CELL_HEIGHT;
  const height = Math.max((durationMins / 60) * CELL_HEIGHT - 2, 24);

  const isOnline = lesson.type === 'online';
  const isCompleted = lesson.status === 'completed';
  const timeRange = `${formatTime(lesson.startTime, lang)} - ${formatTime(lesson.endTime, lang)}`;

  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? onDragStart : undefined}
      onClick={onClick}
      className={cn(
        'absolute left-1 right-1 rounded-lg px-2 py-1.5 overflow-hidden select-none',
        'border z-20 transition-all duration-150',
        blurContent
          ? 'cursor-default blur-[1.5px] opacity-50'
          : 'cursor-pointer hover:shadow-sm hover:z-30',
        isCompleted && 'opacity-70',
        isUnavailable && 'ring-1 ring-rose-300',
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: 'color-mix(in srgb, var(--accent-500) 18%, var(--surface))',
        borderColor: isUnavailable ? '#fda4af' : 'color-mix(in srgb, var(--accent-500) 40%, var(--surface))',
      }}
    >
      <div className="absolute left-0 inset-y-0 w-1" style={{ backgroundColor: 'var(--accent-500)' }} />

      <p className="text-[11px] font-semibold text-(--heading) truncate leading-tight pl-1">
        {lesson.studentName}
      </p>
      {height > 32 && (
        <p className="text-[10px] text-(--muted) truncate mt-0.5 pl-1">
          {timeRange}
        </p>
      )}
      {height > 44 && (
        <p className="text-[10px] text-(--muted) truncate mt-0.5 pl-1">
          {lesson.instrument}
        </p>
      )}
      {isOnline && !isInProgress && (
        <span className="absolute top-1 right-1">
          <span className="text-[9px] bg-(--accent-icon-bg) text-(--accent-600) font-semibold px-1 rounded">ONLINE</span>
        </span>
      )}
      {isInProgress && (
        <span className="absolute top-1 right-1">
          <span className="text-[9px] bg-amber-100 text-amber-700 font-semibold px-1 rounded">{t('calendar.inProgress')}</span>
        </span>
      )}
      {isUnavailable && (
        <span className="absolute bottom-1 right-1">
          <span className="text-[9px] bg-rose-100 text-rose-600 font-semibold px-1 rounded">{t('calendar.conflict')}</span>
        </span>
      )}
    </div>
  );
}

// ─── Now Line ────────────────────────────────────────────────────────────────

function NowLine({ minuteOffset }: { minuteOffset: number }) {
  const top = Math.round((minuteOffset / 60) * CELL_HEIGHT);
  return (
    <div
      className="absolute left-0 right-0 z-40 pointer-events-none flex items-center"
      style={{ top: `${top}px` }}
    >
      <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />
      <div className="flex-1 h-px bg-red-500 opacity-75" />
    </div>
  );
}

// ─── Reserved Block (aula de outro aluno) ─────────────────────────────────────

interface ReservedBlockProps {
  lesson: Lesson;
  hourStart: number;
}

function ReservedBlock({ lesson, hourStart }: ReservedBlockProps) {
  const { t, lang } = useLanguage();
  const startMins = timeToMinutes(lesson.startTime);
  const endMins = timeToMinutes(lesson.endTime);
  const durationMins = endMins - startMins;
  const offsetMins = startMins - hourStart * 60;

  const top = (offsetMins / 60) * CELL_HEIGHT;
  const height = Math.max((durationMins / 60) * CELL_HEIGHT - 2, 20);

  return (
    <div
      className="absolute left-1 right-1 rounded-lg select-none z-10 cursor-default group/reserved"
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      {/* Tooltip acima do bloco */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-50 opacity-0 group-hover/reserved:opacity-100 transition-opacity duration-150 flex flex-col items-center">
        <div
          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shadow-md whitespace-nowrap"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          {t('calendar.reserved')} · {formatTime(lesson.startTime, lang)} – {formatTime(lesson.endTime, lang)}
        </div>
        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid var(--border)` }} />
      </div>
      {/* Fundo listrado */}
      <div
        className="absolute inset-0 rounded-lg opacity-70"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)',
          backgroundColor: 'var(--surface-soft)',
          border: '1px dashed var(--border)',
        }}
      />
      {/* Bolinha + label */}
      <div className="relative flex items-center gap-1 px-1.5 h-full">
        <span className="w-2 h-2 rounded-full shrink-0 bg-rose-400" />
        {height > 28 && (
          <span className="text-[10px] font-semibold text-(--muted) truncate">{t('calendar.reserved')}</span>
        )}
      </div>
    </div>
  );
}
