import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, CalendarCell, CalendarGrid, CalendarGridHeader, CalendarHeaderCell, CalendarGridBody, Heading, Button as AriaButton } from 'react-aria-components';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, FileText } from 'lucide-react';
import { getLocalTimeZone, today } from '@internationalized/date';
import { AnimatePresence } from 'framer-motion';
import type { AuthUser } from '../../../lib/auth';
import type { Lesson, WeeklyAvailability } from '../../../types';
import { LessonModal } from '../../modals/LessonModal';
import { NewLessonModal } from '../../modals/NewLessonModal';
import { cn } from '../../../utils';
import { criarAula } from '../../../services/aulaService';
import { useToast } from '../../ui/Toast';

interface MobileAgendaPageProps {
  lessons: Lesson[];
  students: Aluno[];
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  currentUser: AuthUser | null;
  onUpdateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onMoveLesson: (id: string, date: string, time: string) => void;
}

export function MobileAgendaPage({
  lessons,
  students,
  availability,
  availabilityReposicao,
  currentUser,
  onUpdateLesson,
  onDeleteLesson,
  onMoveLesson,
}: MobileAgendaPageProps) {
  const [date, setDate] = useState(today(getLocalTimeZone()));
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const toast = useToast();

  const selectedDateStr = date.toString(); // format: YYYY-MM-DD

  // Filtra aulas da data selecionada
  const dailyLessons = useMemo(() => {
    return lessons
      .filter((l) => l.date === selectedDateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [lessons, selectedDateStr]);

  const handleReschedule = async (lessonId: string, dataInicio: string, dataFim: string) => {
    const dStr = dataInicio.split('T')[0];
    const tStr = dataInicio.split('T')[1].substring(0, 5);
    onMoveLesson(lessonId, dStr, tStr);
    setSelectedLesson(null);
  };

  const handleCreateLesson = async (data: any) => {
    try {
      const dataInicio = `${data.date}T${data.startTime}:00`;
      const dataFim = `${data.date}T${data.endTime}:00`;
      await criarAula({
        alunoId: data.studentId,
        dataInicio,
        dataFim,
        tipo: data.type,
        status: 'marcada',
        instrumento: data.instrument,
        observacoes: data.notes,
        recorrente: data.recorrente,
      });
      toast('Aula agendada com sucesso!', 'success');
      setIsNewLessonModalOpen(false);
      // Aqui idealmente deveríamos ter um onReloadLessons vindo do App
    } catch (err) {
      toast('Erro ao agendar aula.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Calendar Card */}
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
        <Calendar 
          aria-label="Calendário de Aulas" 
          value={date} 
          onChange={setDate} 
          className="w-full text-center"
        >
          <header className="mb-4 flex items-center justify-between w-full px-2">
            <AriaButton slot="previous" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-(--hover-bg) text-(--text) focus:outline-none focus:ring-2 focus:ring-(--accent-500)">
              <ChevronLeft size={20} />
            </AriaButton>
            <Heading className="font-semibold text-(--heading) capitalize text-base" />
            <AriaButton slot="next" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-(--hover-bg) text-(--text) focus:outline-none focus:ring-2 focus:ring-(--accent-500)">
              <ChevronRight size={20} />
            </AriaButton>
          </header>
          
          <CalendarGrid className="w-full border-separate border-spacing-y-1">
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell className="text-[11px] font-bold text-(--muted) uppercase tracking-wider pb-2">
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(dateValue) => {
                const dateStr = dateValue.toString();
                const hasLesson = lessons.some(l => l.date === dateStr);
                return (
                  <CalendarCell
                    date={dateValue}
                    className={({ isSelected, isOutsideVisibleRange, isUnavailable }) => `
                      relative flex h-10 w-10 mx-auto items-center justify-center rounded-full text-sm font-medium outline-none transition-all
                      ${isOutsideVisibleRange ? 'invisible' : ''}
                      ${isUnavailable ? 'text-(--muted) opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-(--hover-bg)'}
                      ${isSelected ? '!bg-(--accent-600) !text-white shadow-md' : 'text-(--text)'}
                    `}
                  >
                    {({ isSelected }) => (
                      <>
                        {dateValue.day}
                        {hasLesson && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-(--accent-500)" />
                        )}
                      </>
                    )}
                  </CalendarCell>
                );
              }}
            </CalendarGridBody>
          </CalendarGrid>
        </Calendar>
      </div>

      {/* Daily Lessons List */}
      <div className="mt-2 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-(--heading) flex items-center gap-2">
          <CalendarIcon size={16} className="text-(--accent-600)" />
          Aulas de {date.day.toString().padStart(2, '0')}/{(date.month).toString().padStart(2, '0')}
        </h3>

        {dailyLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-(--border) rounded-2xl bg-(--surface-soft)">
            <CalendarIcon size={32} className="text-(--muted) mb-3 opacity-50" />
            <p className="text-sm font-medium text-(--heading)">Nenhuma aula neste dia</p>
            <p className="text-xs text-(--muted) mt-1">
              Toque no botão + para agendar uma nova aula.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dailyLessons.map(lesson => {
              const isDone = lesson.status === 'realizada';
              const isCancelled = lesson.status === 'desmarcada';
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={cn(
                    "flex flex-col text-left p-4 rounded-2xl border transition-all active:scale-[0.98]",
                    isDone ? "bg-emerald-50 border-emerald-200" :
                    isCancelled ? "bg-rose-50 border-rose-200 opacity-75" :
                    "bg-(--surface) border-(--border) hover:border-(--accent-300)"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-(--heading) flex items-center gap-1.5">
                      <Clock size={14} className="text-(--accent-600)" />
                      {lesson.startTime} - {lesson.endTime}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                      isDone ? "bg-emerald-100 text-emerald-700" :
                      isCancelled ? "bg-rose-100 text-rose-700" :
                      "bg-(--accent-100) text-(--accent-700)"
                    )}>
                      {lesson.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm font-medium text-(--heading)">
                    <User size={16} className="text-(--muted)" />
                    {lesson.studentName}
                  </div>
                  
                  {lesson.observations && (
                    <div className="flex items-start gap-2 mt-2 text-xs text-(--muted) line-clamp-1">
                      <FileText size={14} className="shrink-0 mt-0.5" />
                      {lesson.observations}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {typeof document !== 'undefined' && createPortal(
        <button
          onClick={() => setIsNewLessonModalOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent-600) text-white shadow-lg shadow-(--accent-600)/30 transition-transform active:scale-95 hover:bg-(--accent-700)"
          aria-label="Nova aula"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>,
        document.body
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedLesson && currentUser && (
          <LessonModal
            lesson={selectedLesson}
            currentUser={currentUser}
            onClose={() => setSelectedLesson(null)}
            onUpdate={onUpdateLesson}
            onDelete={(id) => {
              onDeleteLesson(id);
              setSelectedLesson(null);
            }}
            onReschedule={handleReschedule}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewLessonModalOpen && currentUser && (
          <NewLessonModal
            open={isNewLessonModalOpen}
            defaultDate={selectedDateStr}
            defaultTime="08:00"
            lessons={lessons}
            students={students}
            currentUser={currentUser}
            onClose={() => setIsNewLessonModalOpen(false)}
            onCreate={handleCreateLesson}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
