import { useState, useEffect, useCallback } from 'react';
import type { Lesson, WeeklyAvailability, Aluno } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { CalendarView } from '../calendar/CalendarView';
import { LessonModal } from '../modals/LessonModal';
import { NewLessonModal } from '../modals/NewLessonModal';
import { ReposicaoCalendarModal } from '../modals/ReposicaoCalendarModal';
import { buscarAulas, cancelarAula, criarAula, reagendarAula, confirmarPresenca } from '../../services/aulaService';
import { listarAlunos } from '../../services/alunoService';
import { listarReposicoes, type ReposicaoDTO } from '../../services/reposicaoService';
import { toLesson } from '../../adapters/aulaAdapter';
import { timeToMinutes, minutesToTime } from '../../utils';
import { useToast } from '../ui/Toast';
import { syncGoogleCalendar, getGoogleConnectedFlag } from '../../services/googleService';

interface AgendaPageProps {
  lessons: Lesson[];
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  currentUser: AuthUser;
  onUpdateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onMoveLesson: (id: string, date: string, time: string) => void;
  onNavigate?: (page: import('../../types').Page) => void;
}

const GOOGLE_SYNC_SESSION_KEY = 'marcos-music:sync-done';

export function AgendaPage({
  lessons: lessonsProp,
  availability, availabilityReposicao, currentUser,
  onUpdateLesson, onDeleteLesson, onNavigate,
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
  const [googleBanner, setGoogleBanner] = useState(false);
  const [syncingGoogle, setSyncingGoogle] = useState(false);

  // ── Auto-sync Google Calendar ao entrar na agenda (apenas uma vez por sessão) ──
  useEffect(() => {
    if (currentUser.role !== 'teacher' || !getGoogleConnectedFlag()) return;
    if (sessionStorage.getItem(GOOGLE_SYNC_SESSION_KEY)) return; // já sincronizou nesta sessão
    const now = new Date();
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // Sincroniza desde o início do mês atual até 12 meses à frente (cobre todas as aulas recorrentes)
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear() + 1, now.getMonth(), 0, 23, 59, 59);
    setSyncingGoogle(true);
    syncGoogleCalendar(`${fmt(start)}T00:00:00`, `${fmt(end)}T23:59:59`)
      .then(() => { sessionStorage.setItem(GOOGLE_SYNC_SESSION_KEY, '1'); })
      .catch(err => {
        if (err instanceof Error && err.message === 'GOOGLE_RECONNECT') {
          setGoogleBanner(true);
        }
      })
      .finally(() => setSyncingGoogle(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSyncGoogle = useCallback(async () => {
    if (!getGoogleConnectedFlag() || syncingGoogle) return;
    setSyncingGoogle(true);
    try {
      const now = new Date();
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end   = new Date(now.getFullYear() + 1, now.getMonth(), 0, 23, 59, 59);
      await syncGoogleCalendar(`${fmt(start)}T00:00:00`, `${fmt(end)}T23:59:59`);
    } catch (err) {
      if (err instanceof Error && err.message === 'GOOGLE_RECONNECT') {
        setGoogleBanner(true);
      }
    } finally {
      setSyncingGoogle(false);
    }
  }, [syncingGoogle]);

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
      {googleBanner && (
        <div className="flex items-center gap-3 px-5 py-2 text-xs bg-(--surface-soft) border-b border-(--border) shrink-0">
          <span className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[11px] shrink-0" style={{ backgroundColor: '#0F9D58' }}>G</span>
          <span className="text-(--muted) flex-1">Sincronize suas aulas com o Google Calendar para manter tudo atualizado.</span>
          <button
            onClick={() => {
              sessionStorage.setItem('marcos-music:settings:section', 'integrations');
              onNavigate?.('settings');
            }}
            className="text-(--accent-600) font-semibold hover:underline shrink-0"
          >
            Conectar agora
          </button>
          <button onClick={() => setGoogleBanner(false)} className="text-(--muted) hover:text-(--text) ml-1 shrink-0">✕</button>
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
        onSyncCalendar={getGoogleConnectedFlag() ? handleSyncGoogle : undefined}
        syncingCalendar={syncingGoogle}
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
              isOnline: data.isOnline,
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
