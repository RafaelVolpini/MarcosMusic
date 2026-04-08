import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, Check, Clock3, Plus, Trash2 } from 'lucide-react';
import type { Lesson, WeeklyAvailability, DayKey } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils';
import { getDayKeyFromISODate, timeToMinutes } from '../../utils';

const WEEK_DAYS = [
  { key: 'mon', label: 'Segunda' },
  { key: 'tue', label: 'Terca' },
  { key: 'wed', label: 'Quarta' },
  { key: 'thu', label: 'Quinta' },
  { key: 'fri', label: 'Sexta' },
  { key: 'sat', label: 'Sabado' },
  { key: 'sun', label: 'Domingo' },
] as const;

const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

interface RoomsPageProps {
  availability: WeeklyAvailability;
  lessons: Lesson[];
  onChangeAvailability: (next: WeeklyAvailability) => void;
}

export function RoomsPage({ availability, lessons, onChangeAvailability }: RoomsPageProps) {
  const [warning, setWarning] = useState('');

  const totalSlots = useMemo(
    () => Object.values(availability).reduce((sum, slots) => sum + slots.length, 0),
    [availability],
  );

  const scheduledLessonCountBySlot = useMemo(() => {
    const map = new Map<string, number>();
    lessons
      .filter(lesson => lesson.status === 'scheduled')
      .forEach((lesson) => {
        const day = getDayKeyFromISODate(lesson.date);
        const hourSlot = `${lesson.startTime.slice(0, 2)}:00`;
        const key = `${day}-${hourSlot}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      });
    return map;
  }, [lessons]);

  const toggleSlot = (day: DayKey, time: string) => {
    onChangeAvailability((() => {
      const active = availability[day].includes(time);
      const hasScheduledLessons = (scheduledLessonCountBySlot.get(`${day}-${time}`) ?? 0) > 0;

      if (active && hasScheduledLessons) {
        setWarning('Esse horario possui aula agendada. Reagende ou cancele a aula antes de tornar indisponivel.');
        return availability;
      }

      setWarning('');
      const nextSlots = active
        ? availability[day].filter(slot => slot !== time)
        : [...availability[day], time].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
      return { ...availability, [day]: nextSlots };
    })());
  };

  const removeProtectedSlots = (next: WeeklyAvailability): WeeklyAvailability => {
    const safe = { ...next };
    WEEK_DAYS.forEach(({ key }) => {
      TIME_SLOTS.forEach((time) => {
        const hasScheduled = (scheduledLessonCountBySlot.get(`${key}-${time}`) ?? 0) > 0;
        if (hasScheduled && !safe[key].includes(time)) {
          safe[key] = [...safe[key], time].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
        }
      });
    });
    return safe;
  };

  const clearAll = () => {
    setWarning('Horarios com aulas agendadas foram mantidos como disponiveis para evitar conflito.');
    onChangeAvailability(removeProtectedSlots({ mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }));
  };

  const applyBusinessHours = () => {
    setWarning('');
    onChangeAvailability({
      mon: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      tue: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      wed: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      thu: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      fri: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      sat: ['09:00', '10:00', '11:00'],
      sun: [],
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-slate-600">Calendario semanal para lancar horarios disponiveis</p>
          <p className="text-xs text-slate-400 mt-0.5">{totalSlots} horarios marcados para aula</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={applyBusinessHours}>
            <Plus size={14} /> Aplicar horario comercial
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 size={14} /> Limpar
          </Button>
        </div>
      </div>

      {warning && (
        <div className="mb-4 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          {warning}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-215">
              <div className="grid grid-cols-[92px_repeat(7,minmax(108px,1fr))]">
                <div className="h-14 border-b border-r border-slate-100 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-medium">
                  Horario
                </div>
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day.key}
                    className="h-14 border-b border-slate-100 bg-slate-50 px-3 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-700">{day.label}</span>
                    <span className="text-[10px] text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                      {availability[day.key].length}
                    </span>
                  </div>
                ))}

                {TIME_SLOTS.map((time) => (
                  <div key={time} className="contents">
                    <div
                      className="h-14 border-b border-r border-slate-100 flex items-center justify-center gap-1 text-xs font-medium text-slate-500"
                    >
                      <Clock3 size={11} className="text-slate-400" />
                      {time}
                    </div>

                    {WEEK_DAYS.map((day) => {
                      const isActive = availability[day.key].includes(time);
                      return (
                        <button
                          key={`${day.key}-${time}`}
                          onClick={() => toggleSlot(day.key, time)}
                          className={cn(
                            'h-14 border-b border-slate-100 px-2 transition-colors',
                            'hover:bg-emerald-50/70',
                            isActive && 'bg-emerald-50',
                          )}
                        >
                          <div
                            className={cn(
                              'h-9 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all',
                              isActive
                                ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-sm'
                                : 'bg-white text-slate-400 border-slate-200',
                            )}
                          >
                            {isActive ? (
                              <>
                                <Check size={12} />
                                Disponivel para aula
                              </>
                            ) : (
                              'Indisponivel'
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <CalendarClock size={13} className="text-slate-400" />
              Clique em qualquer celula para marcar ou remover disponibilidade.
            </div>
            <div className="text-slate-600 font-semibold">Total: {totalSlots} horarios</div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
