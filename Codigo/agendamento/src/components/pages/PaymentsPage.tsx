import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, PenSquare } from 'lucide-react';
import type { Lesson, Student } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatTime } from '../../utils';

interface LessonAlertsPageProps {
  lessons: Lesson[];
  students: Student[];
}

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const normalizeBRPhone = (value: string) => {
  const digits = onlyDigits(value);
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
};

const getLessonDateLabel = (lessonDateISO: string) => {
  return new Date(`${lessonDateISO}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
};

const MESSAGE_TEMPLATE_DEFAULT =
  'Olá, {nome}! Passando para lembrar da sua aula de {instrumento} na {data}, às {hora}, na {sala}. Até já!';

const applyTemplate = (template: string, lesson: Lesson, student: Student) => {
  const vars: Record<string, string> = {
    nome: student.name,
    instrumento: lesson.instrument,
    data: getLessonDateLabel(lesson.date),
    hora: formatTime(lesson.startTime),
    sala: lesson.roomName,
  };

  return template.replace(/\{(nome|instrumento|data|hora|sala)\}/g, (_, key: string) => vars[key] ?? '');
};

export function LessonAlertsPage({ lessons, students }: LessonAlertsPageProps) {
  const today = new Date().toISOString().split('T')[0];
  const upcomingLessons = lessons
    .filter(l => l.status === 'scheduled' && l.date >= today)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

  const fallbackLessons = lessons
    .filter(l => l.status === 'scheduled')
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

  const testMode = upcomingLessons.length === 0;
  const visibleLessons = testMode ? fallbackLessons : upcomingLessons;

  const firstWithPhone = visibleLessons.find(lesson => {
    const student = students.find(s => s.id === lesson.studentId);
    return Boolean(student?.phone);
  });

  const [selectedLessonId, setSelectedLessonId] = useState(firstWithPhone?.id ?? visibleLessons[0]?.id ?? '');
  const [messageTemplate, setMessageTemplate] = useState(MESSAGE_TEMPLATE_DEFAULT);

  const selectedLesson = useMemo(
    () => visibleLessons.find(lesson => lesson.id === selectedLessonId),
    [selectedLessonId, visibleLessons],
  );

  const selectedStudent = useMemo(
    () => students.find(s => s.id === selectedLesson?.studentId),
    [selectedLesson, students],
  );

  const previewMessage = selectedLesson && selectedStudent
    ? applyTemplate(messageTemplate, selectedLesson, selectedStudent)
    : '';

  const lessonsWithPhone = visibleLessons.filter(lesson => {
    const student = students.find(s => s.id === lesson.studentId);
    return Boolean(student?.phone);
  });

  const handleSendWhatsApp = (student: Student, messageText: string) => {
    const phone = normalizeBRPhone(student.phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-padding space-y-6">
      

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="overflow-hidden app-surface xl:col-span-3">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Selecione a aula para alertar</h3>
            <p className="text-xs text-slate-500 mt-1">{lessonsWithPhone.length} com WhatsApp disponível</p>
          </div>
          <div className="divide-y divide-slate-50">
            {visibleLessons.map((lesson, i) => {
              const student = students.find(s => s.id === lesson.studentId);
              const hasPhone = Boolean(student?.phone);
              const isSelected = lesson.id === selectedLessonId;

              return (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full text-left flex items-center gap-4 px-5 py-4 transition-colors ${isSelected ? 'bg-(--accent-50)' : 'hover:bg-slate-50/60'}`}
                >
                  <Avatar name={lesson.studentName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{lesson.studentName}</p>
                    <p className="text-xs text-slate-400">{lesson.instrument} • {lesson.roomName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-700">
                      {new Date(`${lesson.date}T00:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-slate-400">{formatTime(lesson.startTime)}</p>
                  </div>
                  <Badge variant={hasPhone ? 'success' : 'warning'} className="shrink-0">
                    <Phone size={13} />
                    {hasPhone ? 'OK' : 'Sem número'}
                  </Badge>
                </motion.button>
              );
            })}

            {visibleLessons.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                Nenhuma aula agendada para alertar.
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden app-surface xl:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Personalizar mensagem</h3>
            <p className="text-xs text-slate-500 mt-1">Use placeholders: {'{nome}'}, {'{instrumento}'}, {'{data}'}, {'{hora}'}, {'{sala}'}</p>
          </div>

          <div className="p-5 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Template da mensagem</span>
              <textarea
                value={messageTemplate}
                onChange={e => setMessageTemplate(e.target.value)}
                rows={6}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-(--accent-200) focus:border-(--accent-300)"
              />
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                <PenSquare size={12} /> Prévia
              </p>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                {previewMessage || 'Selecione uma aula para ver a prévia da mensagem.'}
              </p>
            </div>

            <Button
              className="w-full"
              disabled={!selectedLesson || !selectedStudent?.phone || !previewMessage.trim()}
              onClick={() => {
                if (selectedLesson && selectedStudent) {
                  handleSendWhatsApp(selectedStudent, previewMessage);
                }
              }}
            >
              <MessageCircle size={16} />
              Enviar mensagem personalizada no WhatsApp
            </Button>

            {selectedStudent && !selectedStudent.phone && (
              <p className="text-xs text-amber-600">Aluno sem telefone cadastrado.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
