import { useState, useEffect, useCallback } from 'react';
import type { Lesson, LessonType, WeeklyAvailability, Aluno } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { CalendarView } from '../calendar/CalendarView';
import { LessonModal } from '../modals/LessonModal';
import { NewLessonModal } from '../modals/NewLessonModal';
import { SyncSuccessModal } from '../modals/SyncSuccessModal';
import { buscarAulas, cancelarAula, criarAula, reagendarAula, confirmarPresenca } from '../../services/aulaService';
import { listarAlunos } from '../../services/alunoService';
import { toLesson } from '../../adapters/aulaAdapter';
import { timeToMinutes, minutesToTime } from '../../utils';
import { startGoogleOAuth, syncGoogleCalendar } from '../../services/googleService';

interface AgendaPageProps {
  lessons: Lesson[];
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  currentUser: AuthUser;
  onNavigate: (page: Page) => void;
  onUpdateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onMoveLesson: (id: string, date: string, time: string) => void;
}

export function AgendaPage({
  lessons: lessonsProp,
  availability, availabilityReposicao, currentUser, onNavigate,
  onUpdateLesson, onDeleteLesson, onMoveLesson,
}: AgendaPageProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLessonModal, setNewLessonModal] = useState<{ date: string; time: string } | null>(null);
  const [apiStudents, setApiStudents] = useState<Aluno[]>([]);

  // Aulas reais vindas do backend; fallback para as props enquanto não há dados da API
  const [apiLessons, setApiLessons] = useState<Lesson[] | null>(null);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [visibleRange, setVisibleRange] = useState<{ start: string; end: string } | null>(null);
  const [pendingSync, setPendingSync] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

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
    setVisibleRange({ start: dataInicio, end: dataFim });
  }, [fetchAulas]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleStatus = params.get('google');
    if (!googleStatus) return;

    params.delete('google');
    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history.replaceState({}, '', url.toString());

    if (googleStatus !== 'connected') {
      setSyncError('Não foi possível conectar ao Google Calendar.');
      return;
    }

    setPendingSync(true);
  }, []);

  useEffect(() => {
    if (!pendingSync) return;
    if (!visibleRange) {
      setSyncMessage('Conta Google conectada. Selecione uma semana para sincronizar.');
      return;
    }

    setPendingSync(false);
    syncGoogleCalendar(visibleRange.start, visibleRange.end)
      .then((result) => {
        setSyncCount(result.success);
        setShowSuccessModal(true);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Erro ao sincronizar com o Google.';
        setSyncError(msg);
      });
  }, [pendingSync, visibleRange]);

  const handleSync = useCallback(async () => {
    const returnUrl = `${window.location.origin}/agenda`;
    try {
      await startGoogleOAuth(undefined, returnUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao iniciar sincronização.';
      setSyncError(msg);
    }
  }, [currentUser]);

  // Busca alunos reais do backend (para o modal de criar aula)
  useEffect(() => {
    listarAlunos()
      .then(setApiStudents)
      .catch(() => { /* mantém lista vazia como fallback */ });
  }, []);

  // Usa dados da API quando disponíveis; caso contrário usa prop
  const visibleLessons = apiLessons ?? lessonsProp;

  const handleDeleteLesson = async (id: string) => {
    try {
      await cancelarAula(id);
      // Remove da lista local imediatamente (otimista)
      if (apiLessons) {
        setApiLessons((prev) => prev?.filter((l) => l.id !== id) ?? null);
      }
      onDeleteLesson(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cancelar aula.';
      alert(msg);
    }
  };

  const handleReschedule = async (id: string, dataInicio: string, dataFim: string) => {
    const dto = await reagendarAula(id, dataInicio, dataFim);
    const updated = toLesson(dto);
    setApiLessons((prev) => prev?.map((l) => l.id === id ? updated : l) ?? null);
    setSelectedLesson(null);
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reagendar aula.');
    }
  }, [apiLessons]);

  const handleConfirmPresence = async (id: string) => {
    const dto = await confirmarPresenca(id);
    const updated = toLesson(dto);
    setApiLessons((prev) => prev?.map((l) => l.id === id ? updated : l) ?? null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de status de carregamento / erro */}
      {loadingLessons && (
        <div className="px-6 py-1.5 text-xs text-[var(--muted)] bg-[var(--surface-soft)] border-b border-[var(--border)] shrink-0">
          Carregando aulas…
        </div>
      )}
      {apiError && !loadingLessons && (
        <div className="px-6 py-1.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950 border-b border-rose-200 dark:border-rose-800 shrink-0">
          ⚠ {apiError}
        </div>
      )}
      {/* Mensagens de erro continuam como banners discretos */}
      {syncError && (
        <div className="px-6 py-1.5 text-xs text-rose-600 bg-rose-50 border-b border-rose-200 shrink-0">
          ⚠ {syncError}
        </div>
      )}

      <CalendarView
        lessons={visibleLessons}
        availability={availability}
        availabilityReposicao={availabilityReposicao}
        currentUser={currentUser}
        onLessonClick={setSelectedLesson}
        onNewLesson={(date, time) => setNewLessonModal({ date, time })}
        onLessonMove={handleMoveLesson}
        onSyncCalendar={handleSync}
        onWeekChange={handleWeekChange}
      />

      <LessonModal
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
            const novaAula = await criarAula({
              studentId: data.studentId,
              dataInicio,
              dataFim,
            });
            setApiLessons(prev => [...(prev ?? []), toLesson(novaAula)]);
          } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao criar aula.');
          }
          setNewLessonModal(null);
        }}
      />

      <SyncSuccessModal
        isOpen={showSuccessModal}
        count={syncCount}
        onClose={() => {
          setShowSuccessModal(false);
          // Volta para a tela inicial (dashboard para admin, agenda é o padrão para aluno mas o user pediu pra "voltar")
          const target: Page = currentUser.role === 'teacher' ? 'dashboard' : 'aboutMe';
          onNavigate(target);
        }}
      />
    </div>
  );
}
