import { useState, useEffect, useCallback } from 'react';
import type { Lesson, WeeklyAvailability, Aluno } from '../../../types';
import type { AuthUser } from '../../../lib/auth';
import { CalendarView } from '../../calendar/CalendarView';
import { LessonModal } from '../../modals/LessonModal';
import { NewLessonModal } from '../../modals/NewLessonModal';
import { ReposicaoCalendarModal } from '../../modals/ReposicaoCalendarModal';
import { buscarAulas, cancelarAula, criarAula, reagendarAula, confirmarPresenca } from '../../../services/aulaService';
import { listarAlunos } from '../../../services/alunoService';
import { listarReposicoes, type ReposicaoDTO } from '../../../services/reposicaoService';
import { toLesson } from '../../../adapters/aulaAdapter';
import { timeToMinutes, minutesToTime } from '../../../utils';
import { useToast } from '../../ui/Toast';

interface AgendaPageProps {
  lessons: Lesson[];
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  currentUser: AuthUser;
  onUpdateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onMoveLesson: (id: string, date: string, time: string) => void;
}

export function WebAgendaPage({
  lessons: lessonsProp,
  availability, availabilityReposicao, currentUser,
  onUpdateLesson, onDeleteLesson,
}: AgendaPageProps) {
  const toast = useToast();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLessonModal, setNewLessonModal] = useState<{ date: string; time: string } | null>(null);
  const [apiStudents, setApiStudents] = useState<Aluno[]>([]);
  const [reposicoes, setReposicoes] = useState<ReposicaoDTO[]>([]);
  const [selectedReposicao, setSelectedReposicao] = useState<ReposicaoDTO | null>(null);
  const [apiLessons, setApiLessons] = useState<Lesson[] | null>(null);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchAulas = useCallback(async (dataInicio: string, dataFim: string) => {
    setLoadingLessons(true);
    setApiError(null);
    try {
      const dtos = await buscarAulas(dataInicio, dataFim);
      setApiLessons(dtos.map(toLesson));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar aulas.';
      setApiError(msg);
      // Mantém os dados anteriores para não deixar o calendário vazio
    } finally {
      setLoadingLessons(false);
    }
  }, []);

  // Busca a semana atual na montagem do componente
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Dom
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    fetchAulas(`${fmt(monday)}T00:00:00`, `${fmt(sunday)}T23:59:59`);
  }, [fetchAulas]);

  const handleWeekChange = useCallback((dataInicio: string, dataFim: string) => {
    fetchAulas(dataInicio, dataFim);
  }, [fetchAulas]);

  // Busca alunos
  useEffect(() => {
    listarAlunos()
      .then(setApiStudents)
      .catch(() => { /* mantém lista vazia como fallback */ });
    listarReposicoes()
      .then(dtos => setReposicoes(
        dtos.filter(r => {
          const slots = availabilityReposicao[r.diaSemana as import('../../types').DayKey];
          return slots && slots.includes(r.horario);
        })
      ))
      .catch(() => {});
  }, []);

  // Usa dados da API quando disponíveis; caso contrário usa prop
  const visibleLessons = apiLessons ?? lessonsProp;

  const currentAlunoId = currentUser.role !== 'teacher'
    ? apiStudents.find(a => a.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase())?.id
    : undefined;

  const handleDeleteLesson = async (id: string) => {
    try {
      await cancelarAula(id);
      if (apiLessons) {
        setApiLessons((prev) => prev?.filter((l) => l.id !== id) ?? null);
      }
      onDeleteLesson(id);
      toast('Aula cancelada com sucesso.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cancelar aula.';
      toast(msg, 'error');
    }
  };

  const handleReschedule = async (id: string, dataInicio: string, dataFim: string) => {
    try {
      const dto = await reagendarAula(id, dataInicio, dataFim);
      const updated = toLesson(dto);
      setApiLessons((prev) => prev?.map((l) => l.id === id ? updated : l) ?? null);
      setSelectedLesson(null);
      toast('Aula reagendada com sucesso.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao reagendar aula.', 'error');
    }
  };

  const handleMoveLesson = useCallback(async (id: string, newDate: string, newStartTime: string) => {
    const lesson = apiLessons?.find(l => l.id === id);
    if (!lesson) return;
    const durationMins = timeToMinutes(lesson.endTime) - timeToMinutes(lesson.startTime);
    const newEndTime = minutesToTime(timeToMinutes(newStartTime) + durationMins);
    const dataInicio = `${newDate}T${newStartTime}:00`;
    const dataFim = `${newDate}T${newEndTime}:00`;
    try {
      const dto = await reagendarAula(id, dataInicio, dataFim);
      const updated = toLesson(dto);
      setApiLessons(prev => prev?.map(l => l.id === id ? updated : l) ?? null);
      toast('Aula movida com sucesso.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao mover aula.', 'error');
    }
  }, [apiLessons, toast]);

  const handleConfirmPresence = async (id: string) => {
    const dto = await confirmarPresenca(id);
    const updated = toLesson(dto);
    setApiLessons((prev) => prev?.map((l) => l.id === id ? updated : l) ?? null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de status de carregamento / erro */}
      {loadingLessons && (
        <div className="px-6 py-1.5 text-xs text-(--muted) bg-(--surface-soft) border-b border-(--border) shrink-0">
          Carregando aulas…
        </div>
      )}
      {apiError && !loadingLessons && (
        <div className="px-6 py-1.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950 border-b border-rose-200 dark:border-rose-800 shrink-0">
          ⚠ {apiError}
        </div>
      )}

      <CalendarView
        lessons={visibleLessons}
        availability={availability}
        availabilityReposicao={availabilityReposicao}
        reposicoes={reposicoes}
        currentUser={currentUser}
        onLessonClick={setSelectedLesson}
        onNewLesson={(date, time) => setNewLessonModal({ date, time })}
        onLessonMove={handleMoveLesson}
        onWeekChange={handleWeekChange}
        onReposicaoClick={(r) => setSelectedReposicao(r)}
      />

      {selectedReposicao && (
        <ReposicaoCalendarModal
          reposicao={selectedReposicao}
          currentUser={currentUser}
          currentAlunoId={currentAlunoId}
          onClose={() => setSelectedReposicao(null)}
          onUpdated={(r) => {
            setReposicoes(prev => prev.map(x => x.id === r.id ? r : x));
            setSelectedReposicao(r);
          }}
          onDeleted={(id) => {
            setReposicoes(prev => prev.filter(x => x.id !== id));
            setSelectedReposicao(null);
          }}
        />
      )}

      <LessonModal
        key={selectedLesson?.id ?? 'closed'}
        lesson={selectedLesson}
        currentUser={currentUser}
        onClose={() => setSelectedLesson(null)}
        onUpdate={(lesson) => { onUpdateLesson(lesson); setSelectedLesson(null); }}
        onDelete={(id) => { handleDeleteLesson(id); setSelectedLesson(null); }}
        onReschedule={handleReschedule}
        onConfirmPresence={handleConfirmPresence}
      />

      <NewLessonModal
        open={!!newLessonModal}
        defaultDate={newLessonModal?.date ?? ''}
        defaultTime={newLessonModal?.time ?? ''}
        lessons={visibleLessons}
        students={apiStudents}
        currentUser={currentUser}
        onClose={() => setNewLessonModal(null)}
        onCreate={async (data) => {
          try {
            const dataInicio = `${data.date}T${data.startTime}:00`;
            const dataFim = `${data.date}T${data.endTime}:00`;
            const novasAulas = await criarAula({
              studentId: data.studentId,
              dataInicio,
              dataFim,
              recorrente: data.recorrente,
            });
            setApiLessons(prev => [...(prev ?? []), ...novasAulas.map(toLesson)]);
            toast(
              novasAulas.length > 1
                ? `${novasAulas.length} aulas recorrentes criadas com sucesso.`
                : 'Aula marcada com sucesso.',
              'success',
            );
          } catch (err) {
            toast(err instanceof Error ? err.message : 'Erro ao criar aula.', 'error');
          }
          setNewLessonModal(null);
        }}
      />
    </div>
  );
}
