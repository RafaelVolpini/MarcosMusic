export type ViewType = 'week' | 'day';
export type DayKey = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
export type WeeklyAvailability = Record<DayKey, string[]>;

export type LessonType = 'individual' | 'group' | 'trial';

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  apelido?: string;
  reposicoes?: number;
  /** Plano do aluno: quantidade máxima de aulas por semana (padrão: 3) */
  aulasPorSemanaPlano?: number;
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
  attendanceConfirmed?: boolean;
  attendanceConfirmedAt?: string;
  reminderMinutesBefore?: number;
  lastReminderSentAt?: string;
  color: string;
  recorrente?: boolean;
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
  | 'lessonAlerts'
  | 'settings'
  | 'profile'
  | 'credits';
