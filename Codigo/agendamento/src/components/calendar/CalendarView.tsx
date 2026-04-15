import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Lesson, WeeklyAvailability } from '../../types';
import {
  getWeekDays, formatDateISO, isToday,
  timeToMinutes, cn, getDayKeyFromISODate,
} from '../../utils';
import { Button } from '../ui/Button';

// ─── Constants ───────────────────────────────────────────────────────────────

const HOUR_START = 7;
const HOUR_END = 24;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const CELL_HEIGHT = 64; // px per hour

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ─── Types ───────────────────────────────────────────────────────────────────

type CalendarView = 'week' | 'day';

interface CalendarProps {
  lessons: Lesson[];
  availability: WeeklyAvailability;
  onLessonClick: (lesson: Lesson) => void;
  onNewLesson: (date: string, time: string) => void;
  onLessonMove: (lessonId: string, newDate: string, newStartTime: string) => void;
}

// ─── Main Calendar ───────────────────────────────────────────────────────────

export function CalendarView({
  lessons,
  availability,
  onLessonClick,
  onNewLesson,
  onLessonMove,
}: CalendarProps) {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragging, setDragging] = useState<{ lesson: Lesson; offsetMinutes: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ date: string; time: string } | null>(null);

  const weekDays = getWeekDays(currentDate);

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const displayDays = view === 'week' ? weekDays : [currentDate];

  const isAvailable = useCallback((dateISO: string, time: string) => {
    const dayKey = getDayKeyFromISODate(dateISO);
    const hourSlot = `${time.slice(0, 2)}:00`;
    return availability[dayKey].includes(hourSlot);
  }, [availability]);

  const headerLabel = view === 'week'
    ? `${weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Drag handlers
  const handleDragStart = useCallback((lesson: Lesson, e: React.DragEvent) => {
    const startMins = timeToMinutes(lesson.startTime);
    const clickMins = HOUR_START * 60;
    setDragging({ lesson, offsetMinutes: startMins - clickMins });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((date: string, e: React.DragEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const totalMins = HOUR_START * 60 + Math.floor(relY / CELL_HEIGHT * 60);
    const snapped = Math.round(totalMins / 60) * 60;
    const h = Math.floor(snapped / 60);
    const m = snapped % 60;
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setDragOver({ date, time });
  }, []);

  const handleDrop = useCallback((date: string) => {
    if (dragging && dragOver && dragOver.date === date && isAvailable(date, dragOver.time)) {
      onLessonMove(dragging.lesson.id, date, dragOver.time);
    }
    setDragging(null);
    setDragOver(null);
  }, [dragging, dragOver, isAvailable, onLessonMove]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--hover-bg)] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToday}
            className="px-3 h-8 text-xs font-semibold text-[var(--accent-600)] hover:bg-[var(--accent-icon-bg)] rounded-lg transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--hover-bg)] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <h2 className="text-sm font-bold text-[var(--heading)] capitalize flex-1">{headerLabel}</h2>

        {/* View toggle */}
        <div className="flex items-center bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-0.5">
          {(['week', 'day'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 h-7 text-xs font-semibold rounded-lg transition-all',
                view === v
                  ? 'bg-[var(--surface)] text-[var(--heading)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )}
            >
              {v === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={() => onNewLesson(formatDateISO(currentDate), '09:00')}>
          <Plus size={14} />
          Nova Aula
        </Button>

        <div className="hidden lg:flex items-center gap-3 ml-1 text-[11px] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-500)]" />
            Disponível
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Indisponível
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto bg-[var(--surface)]">
        <div className="grid h-full" style={{ gridTemplateColumns: `56px repeat(${displayDays.length}, 1fr)` }}>
          {/* Day headers */}
          <div className="border-b border-[var(--border)] sticky top-0 z-10 bg-[var(--surface)]" />
          {displayDays.map((day, i) => {
            const today = isToday(day);
            return (
              <div
                key={i}
                className="border-b border-l border-[var(--border)] sticky top-0 z-10 bg-[var(--surface)] px-2 py-2 text-center"
              >
                <p className={cn('text-xs font-semibold', today ? 'text-[var(--accent-600)]' : 'text-[var(--muted)]')}>
                  {DAY_LABELS[day.getDay()]}
                </p>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold',
                    today ? 'text-white' : 'text-[var(--heading)]',
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
              <div className="pr-2 pt-1 text-right border-r border-[var(--border)] select-none" style={{ height: CELL_HEIGHT }}>
                <span className="text-xs text-[var(--muted)] font-medium">{hour}:00</span>
              </div>

              {/* Day columns */}
              {displayDays.map((day, di) => {
                const dateStr = formatDateISO(day);
                const cellTime = `${String(hour).padStart(2, '0')}:00`;
                const unavailable = !isAvailable(dateStr, cellTime);
                const dayLessons = lessons.filter(l =>
                  l.date === dateStr &&
                  timeToMinutes(l.startTime) >= hour * 60 &&
                  timeToMinutes(l.startTime) < (hour + 1) * 60
                );

                return (
                  <div
                    key={`cell-${hour}-${di}`}
                    className={cn(
                      'relative border-b border-l border-[var(--border)] group',
                      unavailable && 'cursor-not-allowed',
                    )}
                    style={{ height: CELL_HEIGHT }}
                    title={unavailable ? 'Horario indisponivel para agendamento' : 'Horario disponivel para agendamento'}
                    onDragOver={(e) => handleDragOver(dateStr, e)}
                    onDrop={() => handleDrop(dateStr)}
                    onClick={(e) => {
                      if (unavailable) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relY = e.clientY - rect.top;
                      const mins = hour * 60 + Math.floor(relY / CELL_HEIGHT * 60);
                      const snapped = Math.round(mins / 60) * 60;
                      const h = Math.floor(snapped / 60);
                      const m = snapped % 60;
                      const selectedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                      if (!isAvailable(dateStr, selectedTime)) return;
                      onNewLesson(dateStr, selectedTime);
                    }}
                  >
                    {/* Hover highlight */}
                    {!unavailable && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer bg-[var(--accent-icon-bg)]" />
                    )}

                    {!dayLessons.length && (
                      <span
                        className={cn(
                          'absolute top-1.5 right-1.5 w-2 h-2 rounded-full pointer-events-none',
                          unavailable ? 'bg-rose-500' : 'bg-[var(--accent-500)]',
                        )}
                      />
                    )}

                    {/* Drop indicator */}
                    {dragOver?.date === dateStr && dragging && (
                      <div
                        className="absolute left-1 right-1 h-12 border-2 border-dashed rounded-lg opacity-60"
                        style={{
                          top: `${((timeToMinutes(dragOver.time) - hour * 60) / 60) * CELL_HEIGHT}px`,
                          backgroundColor: 'var(--accent-icon-bg)',
                          borderColor: 'var(--accent-500)',
                        }}
                      />
                    )}

                    {/* Lessons */}
                    {dayLessons.map(lesson => (
                      <LessonBlock
                        key={lesson.id}
                        lesson={lesson}
                        hourStart={hour}
                        isUnavailable={!isAvailable(dateStr, lesson.startTime)}
                        onClick={(e) => { e.stopPropagation(); onLessonClick(lesson); }}
                        onDragStart={(e) => handleDragStart(lesson, e)}
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

// ─── Lesson Block ─────────────────────────────────────────────────────────────

interface LessonBlockProps {
  lesson: Lesson;
  hourStart: number;
  isUnavailable: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
}

function LessonBlock({ lesson, hourStart, isUnavailable, onClick, onDragStart }: LessonBlockProps) {
  const startMins = timeToMinutes(lesson.startTime);
  const endMins = timeToMinutes(lesson.endTime);
  const durationMins = endMins - startMins;
  const offsetMins = startMins - hourStart * 60;

  const top = (offsetMins / 60) * CELL_HEIGHT;
  const height = Math.max((durationMins / 60) * CELL_HEIGHT - 2, 24);

  const isOnline = lesson.type === 'online';
  const isCompleted = lesson.status === 'completed';
  const timeRange = `${lesson.startTime} - ${lesson.endTime}`;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'absolute left-1 right-1 rounded-lg px-2 py-1.5 cursor-pointer overflow-hidden select-none',
        'border z-20 transition-all duration-150 hover:shadow-sm hover:z-30',
        isCompleted && 'opacity-70',
        isUnavailable && 'ring-1 ring-rose-300',
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: 'var(--surface)',
        borderColor: isUnavailable ? '#fda4af' : 'var(--border)',
      }}
    >
      <div className="absolute left-0 inset-y-0 w-1" style={{ backgroundColor: lesson.color }} />

      <p className="text-[11px] font-semibold text-[var(--heading)] truncate leading-tight pl-1">
        {lesson.studentName}
      </p>
      {height > 32 && (
        <p className="text-[10px] text-[var(--muted)] truncate mt-0.5 pl-1">
          {timeRange}
        </p>
      )}
      {height > 44 && (
        <p className="text-[10px] text-[var(--muted)] truncate mt-0.5 pl-1">
          {lesson.instrument}
        </p>
      )}
      {isOnline && (
        <span className="absolute top-1 right-1">
          <span className="text-[9px] bg-[var(--accent-icon-bg)] text-[var(--accent-600)] font-semibold px-1 rounded">ONLINE</span>
        </span>
      )}
      {isUnavailable && (
        <span className="absolute bottom-1 right-1">
          <span className="text-[9px] bg-rose-100 text-rose-600 font-semibold px-1 rounded">CONFLITO</span>
        </span>
      )}
    </div>
  );
}
