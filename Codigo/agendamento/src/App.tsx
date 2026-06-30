import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { AgendaPage } from './components/pages/AgendaPage';
import { StudentsPage } from './components/pages/StudentsPage';
import { DisponibilidadePage } from './components/pages/Disponibilidade';
import { ReschedulingPage } from './components/pages/ReschedulingPage';
import { VideoPage } from './components/pages/VideoPage';
import { LessonAlertsPage } from './components/pages/AlertsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ContractGate } from './components/auth/ContractGate';
import { LandingPage } from './components/pages/LandingPage';
import type { Page, Lesson, WeeklyAvailability, Aluno } from './types';
import {
  logout,
  getUser,
  hasAcceptedContract,
  type AuthUser,
  type ContractAcceptance,
} from './lib/auth';
import { listarAlunos } from './services/alunoService';
import { buscarDisponibilidade, buscarAulas } from './services/aulaService';
import { toLesson } from './adapters/aulaAdapter';

const LESSON_DURATION_MINUTES = 50;

const EMPTY_AVAILABILITY: WeeklyAvailability = { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };

function dtosToAvailability(dtos: Awaited<ReturnType<typeof buscarDisponibilidade>>) {
  const avail: WeeklyAvailability = { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };
  const repos: WeeklyAvailability = { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };
  for (const dto of dtos) {
    const day = dto.diaSemana as keyof WeeklyAvailability;
    if (!(day in avail)) continue;
    // Slots com aula marcada também entram em avail para evitar o badge "CONFLITO" falso
    if (dto.disponivel) avail[day].push(dto.horario);
    if (dto.reposicao) repos[day].push(dto.horario);
  }
  return { avail, repos };
}

const normalizeName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const addMinutesToTime = (time: string, minutesToAdd: number) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutesToAdd;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

type AppState = 'landing' | 'login' | 'forgot-password' | 'app';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [contractAccepted, setContractAccepted] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [availability, setAvailability] = useState<WeeklyAvailability>(EMPTY_AVAILABILITY);
  const [availabilityReposicao, setAvailabilityReposicao] = useState<WeeklyAvailability>(EMPTY_AVAILABILITY);

  const loadAvailability = async () => {
    try {
      const dtos = await buscarDisponibilidade();
      const { avail, repos } = dtosToAvailability(dtos);
      setAvailability(avail);
      setAvailabilityReposicao(repos);
    } catch {
      // fallback: mantém vazio (banco inacessível)
    }
  };

  const loadLessons = async () => {
    try {
      const today = new Date();
      const future = new Date(today);
      future.setDate(today.getDate() + 30);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dtos = await buscarAulas(`${fmt(today)}T00:00:00`, `${fmt(future)}T23:59:59`);
      setLessons(dtos.map(toLesson));
    } catch {
      // fallback: mantém vazio
    }
  };

  const loadAlunos = async () => {
    try {
      const data = await listarAlunos();
      setAlunos(data);
    } catch {
      // fallback: mantém vazio
    }
  };

  // Tenta restaurar a sessão ao carregar a página
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setSessionUser(savedUser);
      setAppState('app');
      loadAvailability();
      loadLessons();
      loadAlunos();
      // Se for professor, já aceitou contrato. Se for aluno, verifica o campo termos.
      if (savedUser.role === 'teacher' || savedUser.termos === true) {
        setContractAccepted(true);
      }
      return;
    }
  }, []);

  // Detecta se voltamos do Google OAuth e navega para Configurações
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('google')) {
      setActivePage('settings');
    }
  }, []);

  const studentFromEmail = sessionUser?.role === 'student'
    ? alunos.find((aluno) => aluno.email.trim().toLowerCase() === sessionUser.email.trim().toLowerCase())
    : null;

  const studentFromFirstName = sessionUser?.role === 'student'
    ? alunos.find((aluno) => {
      const alunoFirstName = aluno.nome.split(' ')[0] ?? '';
      const sessionFirstName = sessionUser.firstName || sessionUser.name.split(' ')[0] || '';
      return normalizeName(alunoFirstName) === normalizeName(sessionFirstName);
    })
    : null;

  const studentFromSession = studentFromEmail ?? studentFromFirstName;

  const lessonBelongsToSessionUser = (lesson: Lesson) => {
    if (!sessionUser) return false;
    if (sessionUser.role === 'teacher') return true;

    if (studentFromSession?.id && lesson.studentId === studentFromSession.id) return true;

    return normalizeName(lesson.studentName) === normalizeName(sessionUser.name);
  };

  const visibleLessons = sessionUser?.role === 'teacher'
    ? lessons
    : lessons.filter(lessonBelongsToSessionUser);

  const handleLoginSuccess = (user: AuthUser) => {
    setSessionUser(user);
    setAppState('app');
    loadAvailability();
    loadLessons();
    loadAlunos();
    // Teachers (ADMIN) never need to accept student contract
    if (user.role === 'teacher') {
      setContractAccepted(true);
    } else {
      setContractAccepted(hasAcceptedContract(user.email));
    }
  };

  const handleContractAccepted = (_acceptance: ContractAcceptance) => {
    setContractAccepted(true);
  };

  const handleLogout = () => {
    void logout(); // async clears HttpOnly cookie on the server
    setSessionUser(null);
    setContractAccepted(false);
    setActivePage('dashboard');
    setAppState('landing');
  };

  const allowedPages: Page[] = sessionUser?.role === 'teacher'
    ? ['dashboard', 'agenda', 'students', 'rooms', 'rescheduling', 'video', 'lessonAlerts', 'settings', 'profile']
    : ['agenda', 'rescheduling', 'video', 'settings', 'profile'];

  const defaultPage: Page = sessionUser?.role === 'teacher' ? 'dashboard' : 'agenda';

  const handleProfileUpdate = (updatedUser: AuthUser) => {
    setSessionUser(updatedUser);
    setActivePage(defaultPage);
  };
  const safeActivePage = allowedPages.includes(activePage)
    ? activePage
    : defaultPage;

  const handleUpdateLesson = (updated: Lesson) =>
    setLessons((prev) => prev.map((lesson) => {
      if (lesson.id !== updated.id) return lesson;
      if (!lessonBelongsToSessionUser(lesson)) return lesson;

      if (sessionUser?.role === 'student') {
        return {
          ...updated,
          studentId: lesson.studentId,
          studentName: lesson.studentName,
        };
      }

      return updated;
    }));

  const handleDeleteLesson = (id: string) =>
    setLessons((prev) => prev.filter((lesson) => {
      if (lesson.id !== id) return true;
      return !lessonBelongsToSessionUser(lesson);
    }));

  const handleMoveLesson = (id: string, newDate: string, newStartTime: string) => {
    setLessons(prev => prev.map(l => {
      if (l.id !== id) return l;
      if (!lessonBelongsToSessionUser(l)) return l;
      const endTime = addMinutesToTime(newStartTime, LESSON_DURATION_MINUTES);
      return { ...l, date: newDate, startTime: newStartTime, endTime };
    }));
  };

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const now = new Date();
      const dueLessons = visibleLessons.filter((lesson) => {
        if (!lesson.reminderMinutesBefore || lesson.reminderMinutesBefore <= 0) return false;
        if (lesson.lastReminderSentAt) return false;
        if (lesson.status !== 'scheduled') return false;

        const lessonDateTime = new Date(`${lesson.date}T${lesson.startTime}:00`);
        const reminderAt = new Date(lessonDateTime.getTime() - lesson.reminderMinutesBefore * 60_000);

        return now >= reminderAt && now < lessonDateTime;
      });

      if (!dueLessons.length) return;

      if ('Notification' in window) {
        const permission = Notification.permission === 'granted'
          ? 'granted'
          : await Notification.requestPermission();

        if (permission === 'granted') {
          dueLessons.forEach((lesson) => {
            new Notification('Lembrete de aula', {
              body: `${lesson.studentName} - ${lesson.instrument} às ${lesson.startTime}`,
            });
          });
        }
      }

      const sentAt = new Date().toISOString();
      setLessons((prev) => prev.map((lesson) => (
        dueLessons.some((due) => due.id === lesson.id)
          ? { ...lesson, lastReminderSentAt: sentAt }
          : lesson
      )));
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [visibleLessons]);

  const renderPage = () => {
    switch (safeActivePage) {
      case 'dashboard':
        return (
          <Dashboard
            lessons={visibleLessons}
            students={alunos}
            onNavigate={setActivePage}
          />
        );
      case 'agenda':
        return (
          <AgendaPage
            lessons={visibleLessons}
            availability={availability}
            availabilityReposicao={availabilityReposicao}
            currentUser={sessionUser!}
            onUpdateLesson={handleUpdateLesson}
            onDeleteLesson={handleDeleteLesson}
            onMoveLesson={handleMoveLesson}
            onNavigate={setActivePage}
          />
        );
      case 'students':
        return (
          <StudentsPage
            students={alunos}
            currentUser={sessionUser ?? undefined}
            onReload={loadAlunos}
          />
        );
      case 'rooms':
        return (
          <DisponibilidadePage
            availability={availability}
            availabilityReposicao={availabilityReposicao}
            onChangeAvailability={setAvailability}
            onChangeAvailabilityReposicao={setAvailabilityReposicao}
          />
        );
      case 'rescheduling':
        return <ReschedulingPage sessionUser={sessionUser!} />;
      case 'video':
        return <VideoPage user={sessionUser ?? undefined} />;
      case 'lessonAlerts':
        return <LessonAlertsPage />;
      case 'settings':
        return <SettingsPage user={sessionUser!} onProfileUpdate={handleProfileUpdate} />;
      case 'profile':
        return <SettingsPage user={sessionUser!} onProfileUpdate={handleProfileUpdate} initialSection="profile" />;
    }
  };

  if (appState === 'landing') {
    return <LandingPage onEnterLogin={() => setAppState('login')} />;
  }

  if (appState === 'forgot-password') {
    return <ForgotPasswordPage onBack={() => setAppState('login')} />;
  }

  if (appState === 'login' || !sessionUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onForgotPassword={() => setAppState('forgot-password')} />;
  }

  if (!contractAccepted) {
    return <ContractGate user={sessionUser} onAccepted={handleContractAccepted} />;
  }

  return (
    <Layout
      collapsed={collapsed}
      onToggle={() => setCollapsed(v => !v)}
      activePage={safeActivePage}
      onNavigate={setActivePage}
      user={sessionUser}
      onLogout={handleLogout}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={safeActivePage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className={safeActivePage === 'agenda' ? 'h-full flex flex-col' : ''}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
