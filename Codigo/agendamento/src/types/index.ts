export type ViewType = 'week' | 'day';
export type DayKey = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
export type WeeklyAvailability = Record<DayKey, string[]>;

export type LessonType = 'individual' | 'group' | 'online' | 'trial';

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  apelido?: string;
  reposicoes?: number;
}

export interface Lesson {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: LessonType;
  status: LessonStatus;
  instrument: string;
  notes?: string;
  meetLink?: string;
  isOnline?: boolean;
  attendanceConfirmed?: boolean;
  attendanceConfirmedAt?: string;
  reminderMinutesBefore?: number;
  lastReminderSentAt?: string;
  color: string;
  recording?: VideoRecording;
  recorrente?: boolean;
}

export interface VideoRecording {
  id: string;
  lessonId: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  uploadedAt: string;
  size: number; // bytes
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidAt?: string;
  description: string;
  lessonCount: number;
}

export type Page =
  | 'dashboard'
  | 'agenda'
  | 'students'
  | 'rooms'
  | 'rescheduling'
  | 'video'
  | 'lessonAlerts'
  | 'settings'
  | 'profile';
