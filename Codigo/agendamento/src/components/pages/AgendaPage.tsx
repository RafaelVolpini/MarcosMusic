import { useState, useEffect, useCallback } from 'react';
import type { Lesson, Teacher, Room, LessonType, WeeklyAvailability, Student } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { CalendarView } from '../calendar/CalendarView';
import { LessonModal } from '../modals/LessonModal';
import { NewLessonModal } from '../modals/NewLessonModal';
import { buscarAulas, cancelarAula, criarAula, reagendarAula, confirmarPresenca } from '../../services/aulaService';
import { listarAlunos } from '../../services/alunoService';
import type { AlunoResumoDTO } from '../../services/alunoService';
import { toLesson } from '../../adapters/aulaAdapter';

interface AgendaPageProps {
  lessons: Lesson[];
  students: Student[];
  teachers: Teacher[];
  rooms: Room[];
  availability: WeeklyAvailability;
  currentUser: AuthUser;
  onUpdateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onCreateLesson: (data: {
    studentId: string;
    teacherId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: LessonType;
    instrument: string;
    notes: string;
    meetLink: string;
    attendanceConfirmed: boolean;
    reminderMinutesBefore: number;
  }) => void;
  onMoveLesson: (id: string, date: string, time: string) => void;
}

export function AgendaPage({
  lessons: lessonsProp,
  students, teachers, rooms, availability, currentUser,
  onUpdateLesson, onDeleteLesson, onCreateLesson, onMoveLesson,
}: AgendaPageProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLessonModal, setNewLessonModal] = useState<{ date: string; time: string } | null>(null);
  const [apiStudents, setApiStudents] = useState<Student[] | null>(null);

  // Aulas reais vindas do backend; fallback para as props enquanto não há dados da API
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

  // Busca alunos reais do backend (para o modal de criar aula)
  useEffect(() => {
    listarAlunos()
      .then((dtos: AlunoResumoDTO[]) => {
        setApiStudents(dtos.map(dto => ({
          id: dto.id,
          name: dto.nome ?? dto.email ?? 'Aluno',
          email: dto.email ?? '',
          phone: dto.telefone ?? '',
          instrument: 'Piano',
          level: 'beginner' as const,
          teacherId: '',
          enrolledAt: '',
          nextLesson: '',
          totalLessons: 0,
          balance: 0,
          active: dto.status !== false,
        })));
      })
      .catch(() => { /* mantém mock como fallback */ });
  }, []);

  const effectiveStudents = apiStudents ?? students;

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

      <CalendarView
        lessons={visibleLessons}
        availability={availability}
        currentUser={currentUser}
        onLessonClick={setSelectedLesson}
        onNewLesson={(date, time) => setNewLessonModal({ date, time })}
        onLessonMove={onMoveLesson}
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
        students={effectiveStudents}
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
    </div>
  );
}
