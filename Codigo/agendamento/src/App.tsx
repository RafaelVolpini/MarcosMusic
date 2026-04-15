import { useState } from 'react';
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

function App() {
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [contractAccepted, setContractAccepted] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
  const [availability, setAvailability] = useState<WeeklyAvailability>(INITIAL_AVAILABILITY);

  const handleLoginSuccess = (user: AuthUser) => {
    setSessionUser(user);
    setContractAccepted(hasAcceptedContract(user.email));
  };

  const handleContractAccepted = (_acceptance: ContractAcceptance) => {
    setContractAccepted(true);
  };

  const handleLogout = () => {
    logout();
    setSessionUser(null);
    setContractAccepted(false);
    setActivePage('dashboard');
  };

  const allowedPages: Page[] = sessionUser?.role === 'teacher'
    ? ['dashboard', 'aboutMe', 'agenda', 'students', 'rooms', 'rescheduling', 'video', 'lessonAlerts', 'settings']
    : ['aboutMe', 'agenda', 'rescheduling', 'video', 'settings'];

  const defaultPage: Page = sessionUser?.role === 'teacher' ? 'dashboard' : 'agenda';

  const safeActivePage = allowedPages.includes(activePage)
    ? activePage
    : defaultPage;

  const handleUpdateLesson = (updated: Lesson) =>
    setLessons(prev => prev.map(l => l.id === updated.id ? updated : l));

  const handleDeleteLesson = (id: string) =>
    setLessons(prev => prev.filter(l => l.id !== id));

  const handleCreateLesson = (data: {
    studentName: string;
    teacherId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: Lesson['type'];
    instrument: string;
    notes: string;
    meetLink: string;
  }) => {
    const teacher = mockTeachers.find(t => t.id === data.teacherId);
    const room = mockRooms.find(r => r.id === data.roomId);
    const newLesson: Lesson = {
      id: `l${Date.now()}`,
      studentId: `s${Date.now()}`,
      studentName: data.studentName,
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
      color: teacher?.color ?? '#7c3aed',
    };
    setLessons(prev => [...prev, newLesson]);
  };

  const handleMoveLesson = (id: string, newDate: string, newStartTime: string) => {
    setLessons(prev => prev.map(l => {
      if (l.id !== id) return l;
      const endTime = addMinutesToTime(newStartTime, LESSON_DURATION_MINUTES);
      return { ...l, date: newDate, startTime: newStartTime, endTime };
    }));
  };

  const renderPage = () => {
    switch (safeActivePage) {
      case 'dashboard':
        return (
          <Dashboard
            lessons={lessons}
            students={mockStudents}
            onNavigate={setActivePage}
          />
        );
      case 'aboutMe':
        return <AboutMePage />;
      case 'agenda':
        return (
          <AgendaPage
            lessons={lessons}
            teachers={mockTeachers}
            rooms={mockRooms}
            availability={availability}
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
            lessons={lessons}
            onChangeAvailability={setAvailability}
          />
        );
      case 'rescheduling':
        return <ReschedulingPage lessons={lessons} />;
      case 'video':
        return <VideoPage videos={mockVideos} />;
      case 'lessonAlerts':
        return <LessonAlertsPage lessons={lessons} students={mockStudents} />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  if (!sessionUser) {
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
