import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { WebAgendaPage } from './components/pages/web/WebAgendaPage';
import { MobileAgendaPage } from './components/pages/mobile/MobileAgendaPage';
import { MobileLayout } from './components/layout/mobile/MobileLayout';
import { StudentsPage } from './components/pages/StudentsPage';
import { CreditosPage } from './components/pages/CreditosPage';
import { DisponibilidadePage } from './components/pages/Disponibilidade';
import { ReschedulingPage } from './components/pages/ReschedulingPage';
import { LessonAlertsPage } from './components/pages/AlertsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ContractGate } from './components/auth/ContractGate';
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

// ─── Mapeamento página ⇄ rota ─────────────────────────────────────────────────

// Obs: nenhum destes caminhos pode colidir com os prefixos de proxy do backend
// configurados em vite.config.ts (/aula, /aluno, /disponibilidade, /reposicao, etc.),
// já que o proxy do Vite casa por prefixo e intercepta a rota antes do React Router.
const PAGE_PATHS: Record<Page, string> = {
  dashboard: '/dashboard',
  agenda: '/agenda',
  students: '/estudantes',
  rooms: '/horarios',
  rescheduling: '/reagendamentos',
  lessonAlerts: '/alertas',
  settings: '/configuracoes',
  profile: '/perfil',
  credits: '/meus-creditos',
};

const PATH_TO_PAGE: Record<string, Page> = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page as Page]),
) as Record<string, Page>;

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

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // getUser() é síncrono (apenas leitura de localStorage/sessionStorage), então a
  // sessão pode ser resolvida direto no estado inicial — sem precisar de efeito.
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(() => getUser());
  const [contractAccepted, setContractAccepted] = useState<boolean>(() => {
    const savedUser = getUser();
    if (!savedUser) return false;
    return savedUser.role === 'teacher' || savedUser.termos === true;
  });
  const [appMode, setAppMode] = useState<"web" | "mobile">(() => {
    return (localStorage.getItem('appMode') as "web" | "mobile") || "web";
  });
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

  // Carrega os dados remotos quando já existe uma sessão restaurada
  useEffect(() => {
    if (!sessionUser) return;
    loadAvailability();
    loadLessons();
    loadAlunos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só deve rodar uma vez, ao montar
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

  const defaultPage: Page = sessionUser?.role === 'teacher' ? 'dashboard' : 'agenda';

  const handleLoginSuccess = (user: AuthUser, mode: 'web' | 'mobile') => {
    setSessionUser(user);
    setAppMode(mode);
    localStorage.setItem('appMode', mode);
    loadAvailability();
    loadLessons();
    loadAlunos();
    // Teachers (ADMIN) never need to accept student contract
    if (user.role === 'teacher') {
      setContractAccepted(true);
    } else {
      setContractAccepted(hasAcceptedContract(user.email));
    }
    navigate(PAGE_PATHS[user.role === 'teacher' ? 'dashboard' : 'agenda'], { replace: true });
  };

  const handleContractAccepted = (_acceptance: ContractAcceptance) => {
    setContractAccepted(true);
  };

  const handleLogout = () => {
    void logout(); // async clears HttpOnly cookie on the server
    setSessionUser(null);
    setContractAccepted(false);
    navigate('/login', { replace: true });
  };

  const allowedPages: Page[] = sessionUser?.role === 'teacher'
    ? ['dashboard', 'agenda', 'students', 'rooms', 'rescheduling', 'lessonAlerts', 'settings', 'profile']
    : ['agenda', 'rescheduling', 'credits', 'settings', 'profile'];

  const handleNavigate = (page: Page) => navigate(PAGE_PATHS[page]);

  const handleProfileUpdate = (updatedUser: AuthUser) => {
    setSessionUser(updatedUser);
    navigate(PAGE_PATHS[defaultPage]);
  };

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

  // ── Não autenticado: apenas rotas de login/recuperação de senha ──────────────
  if (!sessionUser) {
    return (
      <Routes>
        <Route
          path="/login"
          element={(
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onForgotPassword={() => navigate('/esqueci-senha')}
            />
          )}
        />
        <Route
          path="/esqueci-senha"
          element={(
            <ForgotPasswordPage
              onBack={() => navigate('/login')}
              onResetSuccess={() => navigate('/login')}
            />
          )}
        />
        <Route
          path="/redefinir-senha"
          element={(
            <ForgotPasswordPage
              resetToken={searchParams.get('token') ?? undefined}
              onBack={() => navigate('/login')}
              onResetSuccess={() => navigate('/login')}
            />
          )}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!contractAccepted) {
    return <ContractGate user={sessionUser} onAccepted={handleContractAccepted} />;
  }

  const currentPage = PATH_TO_PAGE[location.pathname];
  const safeActivePage = currentPage && allowedPages.includes(currentPage) ? currentPage : defaultPage;

  const ActiveLayout = appMode === 'mobile' ? MobileLayout : Layout;

  return (
    <ActiveLayout
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
      activePage={safeActivePage}
      onNavigate={handleNavigate}
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
          <Routes>
            {allowedPages.includes('dashboard') && (
              <Route
                path={PAGE_PATHS.dashboard}
                element={<Dashboard lessons={visibleLessons} students={alunos} onNavigate={handleNavigate} />}
              />
            )}
            <Route
              path={PAGE_PATHS.agenda}
              element={(
                appMode === 'mobile' ? (
                  <MobileAgendaPage
                    lessons={visibleLessons}
                    availability={availability}
                    availabilityReposicao={availabilityReposicao}
                    currentUser={sessionUser}
                    onUpdateLesson={handleUpdateLesson}
                    onDeleteLesson={handleDeleteLesson}
                    onMoveLesson={handleMoveLesson}
                  />
                ) : (
                  <WebAgendaPage
                    lessons={visibleLessons}
                    availability={availability}
                    availabilityReposicao={availabilityReposicao}
                    currentUser={sessionUser}
                    onUpdateLesson={handleUpdateLesson}
                    onDeleteLesson={handleDeleteLesson}
                    onMoveLesson={handleMoveLesson}
                  />
                )
              )}
            />
            {allowedPages.includes('students') && (
              <Route
                path={PAGE_PATHS.students}
                element={<StudentsPage students={alunos} currentUser={sessionUser} onReload={loadAlunos} />}
              />
            )}
            {allowedPages.includes('rooms') && (
              <Route
                path={PAGE_PATHS.rooms}
                element={(
                  <DisponibilidadePage
                    availability={availability}
                    availabilityReposicao={availabilityReposicao}
                    onChangeAvailability={setAvailability}
                    onChangeAvailabilityReposicao={setAvailabilityReposicao}
                  />
                )}
              />
            )}
            <Route path={PAGE_PATHS.rescheduling} element={<ReschedulingPage sessionUser={sessionUser} />} />
            {allowedPages.includes('lessonAlerts') && (
              <Route path={PAGE_PATHS.lessonAlerts} element={<LessonAlertsPage />} />
            )}
            {allowedPages.includes('credits') && (
              <Route path={PAGE_PATHS.credits} element={<CreditosPage currentUser={sessionUser} students={alunos} />} />
            )}
            <Route
              path={PAGE_PATHS.settings}
              element={<SettingsPage user={sessionUser} onProfileUpdate={handleProfileUpdate} />}
            />
            <Route
              path={PAGE_PATHS.profile}
              element={<SettingsPage user={sessionUser} onProfileUpdate={handleProfileUpdate} initialSection="profile" />}
            />
            <Route path="/login" element={<Navigate to={PAGE_PATHS[defaultPage]} replace />} />
            <Route path="*" element={<Navigate to={PAGE_PATHS[defaultPage]} replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </ActiveLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
