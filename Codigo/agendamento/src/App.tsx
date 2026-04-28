import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { AboutMePage } from './components/pages/AboutMePage';
import { AgendaPage } from './components/pages/AgendaPage';
import { StudentsPage } from './components/pages/StudentsPage';
import { RoomsPage } from './components/pages/RoomsPage';
import { ReschedulingPage } from './components/pages/ReschedulingPage';
import { VideoPage } from './components/pages/VideoPage';
import { LessonAlertsPage } from './components/pages/PaymentsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/auth/LoginPage';
import { ContractGate } from './components/auth/ContractGate';
import { LandingPage } from './components/pages/LandingPage';
import type { Page, Lesson, WeeklyAvailability } from './types';
import {
  mockLessons, mockStudents, mockTeachers,
  mockRooms, mockVideos,
} from './data/mockData';
import {
  logout,
  hasAcceptedContract,
  type AuthUser,
  type ContractAcceptance,
} from './lib/auth';

const LESSON_DURATION_MINUTES = 50;

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

const INITIAL_AVAILABILITY: WeeklyAvailability = {
  mon: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00'],
  tue: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00'],
  wed: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00'],
  thu: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00'],
  fri: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
  sat: ['09:00', '10:00', '11:00'],
  sun: [],
};

type AppState = 'landing' | 'login' | 'app';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [contractAccepted, setContractAccepted] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [availability, setAvailability] = useState<WeeklyAvailability>(INITIAL_AVAILABILITY);

  const studentFromEmail = sessionUser?.role === 'student'
    ? mockStudents.find((student) => student.email.trim().toLowerCase() === sessionUser.email.trim().toLowerCase())
    : null;

  const studentFromFirstName = sessionUser?.role === 'student'
    ? mockStudents.find((student) => {
      const studentFirstName = student.name.split(' ')[0] ?? '';
      const sessionFirstName = sessionUser.firstName || sessionUser.name.split(' ')[0] || '';
      return normalizeName(studentFirstName) === normalizeName(sessionFirstName);
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
    logout();
    setSessionUser(null);
    setContractAccepted(false);
    setActivePage('dashboard');
    setAppState('landing');
  };

  const allowedPages: Page[] = sessionUser?.role === 'teacher'
    ? ['dashboard', 'aboutMe', 'agenda', 'students', 'rooms', 'rescheduling', 'video', 'lessonAlerts', 'settings']
    : ['aboutMe', 'agenda', 'rescheduling', 'video'];

  const defaultPage: Page = sessionUser?.role === 'teacher' ? 'dashboard' : 'agenda';

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
          teacherId: lesson.teacherId,
          teacherName: lesson.teacherName,
          roomId: lesson.roomId,
          roomName: lesson.roomName,
        };
      }

      return updated;
    }));

  const handleDeleteLesson = (id: string) =>
    setLessons((prev) => prev.filter((lesson) => {
      if (lesson.id !== id) return true;
      return !lessonBelongsToSessionUser(lesson);
    }));

  const handleCreateLesson = (data: {
    studentId: string;
    teacherId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: Lesson['type'];
    instrument: string;
    notes: string;
    meetLink: string;
    attendanceConfirmed: boolean;
    reminderMinutesBefore: number;
  }) => {
    const selectedStudent = mockStudents.find((student) => student.id === data.studentId);
    const effectiveStudentId = selectedStudent?.id ?? studentFromSession?.id ?? `s${Date.now()}`;
    const effectiveStudentName = selectedStudent?.name ?? sessionUser?.firstName ?? 'Aluno';
    const effectiveStudentPhone = selectedStudent?.phone ?? sessionUser?.phone ?? '';

    const teacher = mockTeachers.find(t => t.id === data.teacherId);
    const room = mockRooms.find(r => r.id === data.roomId);
    const newLesson: Lesson = {
      id: `l${Date.now()}`,
      studentId: effectiveStudentId,
      studentName: effectiveStudentName,
      studentPhone: effectiveStudentPhone,
      teacherId: data.teacherId,
      teacherName: teacher?.name ?? '',
      roomId: data.roomId,
      roomName: room?.name ?? '',
      date: data.date,
      startTime: data.startTime,
      endTime: addMinutesToTime(data.startTime, LESSON_DURATION_MINUTES),
      type: data.type,
      status: 'scheduled',
      instrument: data.instrument,
      notes: data.notes,
      meetLink: data.meetLink,
      attendanceConfirmed: data.attendanceConfirmed,
      attendanceConfirmedAt: data.attendanceConfirmed ? new Date().toISOString() : undefined,
      reminderMinutesBefore: data.reminderMinutesBefore,
      color: teacher?.color ?? '#7c3aed',
    };
    setLessons(prev => [...prev, newLesson]);
  };

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
            students={mockStudents}
            onNavigate={setActivePage}
          />
        );
      case 'aboutMe':
        return <AboutMePage />;
      case 'agenda':
        return (
          <AgendaPage
            lessons={visibleLessons}
            students={mockStudents}
            teachers={mockTeachers}
            rooms={mockRooms}
            availability={availability}
            currentUser={sessionUser!}
            onUpdateLesson={handleUpdateLesson}
            onDeleteLesson={handleDeleteLesson}
            onCreateLesson={handleCreateLesson}
            onMoveLesson={handleMoveLesson}
          />
        );
      case 'students':
        return <StudentsPage students={mockStudents} />;
      case 'rooms':
        return (
          <RoomsPage
            availability={availability}
            lessons={visibleLessons}
            onChangeAvailability={setAvailability}
          />
        );
      case 'rescheduling':
        return <ReschedulingPage lessons={visibleLessons} />;
      case 'video':
        return <VideoPage videos={mockVideos} />;
      case 'lessonAlerts':
        return <LessonAlertsPage lessons={visibleLessons} students={mockStudents} />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  if (appState === 'landing') {
    return <LandingPage onEnterLogin={() => setAppState('login')} />;
  }

  if (appState === 'login' || !sessionUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
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
