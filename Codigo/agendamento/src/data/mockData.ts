import type { Lesson, VideoRecording } from '../types';

const today = new Date();

const toIsoDate = (date: Date) => date.toISOString().split('T')[0] ?? '';

const shiftDate = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

export const mockVideos: VideoRecording[] = [
  {
    id: 'v1',
    lessonId: 'l1',
    title: 'Revisao de acordes maiores e menores',
    url: 'https://example.com/videos/revisao-acordes',
    duration: 1280,
    uploadedAt: `${shiftDate(-3)}T18:30:00`,
    size: 154000000,
  },
  {
    id: 'v2',
    lessonId: 'l3',
    title: 'Tecnica de respiracao para canto',
    url: 'https://example.com/videos/respiracao-canto',
    duration: 980,
    uploadedAt: `${shiftDate(-7)}T20:10:00`,
    size: 112000000,
  },
  {
    id: 'v3',
    lessonId: 'l5',
    title: 'Exercicios de independencia na bateria',
    url: 'https://example.com/videos/independencia-bateria',
    duration: 1460,
    uploadedAt: `${shiftDate(-10)}T21:00:00`,
    size: 189000000,
  },
];

export const mockLessons: Lesson[] = [
  {
    id: 'l1',
    studentId: 's2',
    studentName: 'Pedro Alves',
    date: shiftDate(0),
    startTime: '14:00',
    endTime: '14:50',
    type: 'individual',
    status: 'scheduled',
    instrument: 'Violao',
    notes: 'Trabalhar trocas de acordes e batida pop.',
    color: '#2563eb',
    recording: mockVideos[0],
  },
  {
    id: 'l2',
    studentId: 's1',
    studentName: 'Clara Mendes',
    date: shiftDate(1),
    startTime: '10:00',
    endTime: '10:50',
    type: 'individual',
    status: 'scheduled',
    instrument: 'Piano',
    notes: 'Escalas em duas oitavas e leitura ritmica.',
    color: '#db2777',
  },
  {
    id: 'l3',
    studentId: 's3',
    studentName: 'Marina Costa',
    date: shiftDate(2),
    startTime: '18:00',
    endTime: '18:50',
    type: 'online',
    status: 'scheduled',
    instrument: 'Canto',
    notes: 'Afinação e apoio respiratorio.',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    color: '#db2777',
    recording: mockVideos[1],
  },
  {
    id: 'l4',
    studentId: 's4',
    studentName: 'Joao Ribeiro',
    date: shiftDate(0),
    startTime: '19:00',
    endTime: '19:50',
    type: 'group',
    status: 'rescheduled',
    instrument: 'Bateria',
    notes: 'Reagendada por conflito de horario do aluno.',
    color: '#059669',
  },
  {
    id: 'l5',
    studentId: 's5',
    studentName: 'Bianca Lima',
    date: shiftDate(-1),
    startTime: '09:00',
    endTime: '09:50',
    type: 'trial',
    status: 'completed',
    instrument: 'Guitarra',
    notes: 'Primeiro contato com postura e palhetada.',
    color: '#2563eb',
    recording: mockVideos[2],
  },
  {
    id: 'l6',
    studentId: 's2',
    studentName: 'Pedro Alves',
    date: shiftDate(0),
    startTime: '16:00',
    endTime: '16:50',
    type: 'individual',
    status: 'cancelled',
    instrument: 'Violao',
    notes: 'Aluno avisou indisponibilidade no mesmo dia.',
    color: '#2563eb',
  },
];