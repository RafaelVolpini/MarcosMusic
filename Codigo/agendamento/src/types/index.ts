export type ViewType = 'week' | 'day';
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type WeeklyAvailability = Record<DayKey, string[]>;

export type LessonType = 'individual' | 'group' | 'online' | 'trial';

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  instrument: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  teacherId: string;
  enrolledAt: string;
  nextLesson?: string;
  totalLessons: number;
  balance: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  instruments: string[];
  color: string;
  availability: string[];
  studentsCount: number;
  rating: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  instruments: string[];
  floor: number;
  features: string[];
  color: string;
}

export interface Lesson {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: LessonType;
  status: LessonStatus;
  instrument: string;
  notes?: string;
  meetLink?: string;
  color: string;
  recording?: VideoRecording;
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
  | 'aboutMe'
  | 'agenda'
  | 'students'
  | 'rooms'
  | 'rescheduling'
  | 'video'
  | 'lessonAlerts'
  | 'settings';
