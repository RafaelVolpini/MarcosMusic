import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Video, Repeat } from 'lucide-react';
import type { Lesson, LessonType, Aluno } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { generateMeetLink, minutesToTime, timeToMinutes } from '../../utils';
import { Button } from '../ui/Button';

const ALL_HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

const LESSON_DURATION_MINUTES = 50;

interface NewLessonModalProps {
  open: boolean;
  defaultDate: string;
  defaultTime: string;
  lessons: Lesson[];
  students: Aluno[];
  currentUser: AuthUser;
  onClose: () => void;
  onCreate: (data: {
    studentId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: LessonType;
    instrument: string;
    notes: string;
    meetLink: string;
    recorrente: boolean;
  }) => void;
}

export function NewLessonModal({
  open,
  defaultDate,
  defaultTime,
  lessons,
  students,
  currentUser,
  onClose,
  onCreate,
}: NewLessonModalProps) {
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultTime);
  const [instrument, setInstrument] = useState('Piano');
  const [notes, setNotes] = useState('');
  const [hasMeetLink, setHasMeetLink] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const INSTRUMENTS = ['Piano', 'Violão', 'Guitarra', 'Teclado', 'Bateria', 'Canto', 'Percussão'];

  const normalizeName = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const isTeacher = currentUser.role === 'teacher';
  const activeStudents = students.filter((student) => student.ativo !== false);
  const studentFromEmail = currentUser.role === 'student'
    ? activeStudents.find((student) => student.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
    : null;

  const studentFromFirstName = currentUser.role === 'student'
    ? activeStudents.find((student) => {
      const studentFirstName = student.nome.split(' ')[0] ?? '';
      const sessionFirstName = currentUser.firstName || currentUser.name.split(' ')[0] || '';
      return normalizeName(studentFirstName) === normalizeName(sessionFirstName);
    })
    : null;

  const studentFromSession = studentFromEmail ?? studentFromFirstName;

  const selectableStudents = isTeacher
    ? activeStudents
    : (studentFromSession ? [studentFromSession] : []);

  const selectedStudent = selectableStudents.find((student) => student.id === studentId);

  const endTime = startTime
    ? minutesToTime(timeToMinutes(startTime) + LESSON_DURATION_MINUTES)
    : '';

  useEffect(() => {
    const nextStudentId = isTeacher
      ? selectableStudents[0]?.id ?? ''
      : studentFromSession?.id ?? '';
    setStudentId(nextStudentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher, studentFromSession, students]);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate);
    setStartTime(defaultTime || ALL_HOURS[2]);
    setHasMeetLink(false);
    setRecorrente(false);
    setNotes('');
    setErrors([]);
  }, [open, defaultDate, defaultTime]);

  const validate = () => {
    const errs: string[] = [];
    if (!studentId) errs.push('Selecione um aluno');
    if (!date) errs.push('Data é obrigatória');
    if (!startTime) errs.push('Horário inicial é obrigatório');
    if (!instrument.trim()) errs.push('Instrumento é obrigatório');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreate({
      studentId,
      date,
      startTime,
      endTime,
      type: hasMeetLink ? 'online' : 'individual',
      instrument,
      notes,
      meetLink: hasMeetLink ? generateMeetLink() : '',
      recorrente,
    });
    onClose();
  };

  const inputClass = 'w-full border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-100)] bg-[var(--input-bg)]';
  const labelClass = 'text-xs font-medium text-[var(--muted)] mb-1 block';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
          >
            <div className="app-surface rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-(--accent-50) rounded-xl flex items-center justify-center">
                    <Plus size={16} className="text-(--accent-600)" />
                  </div>
                  <h2 className="text-base font-bold text-[var(--heading)]">Nova Aula</h2>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)]">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                {errors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                    {errors.map(e => <p key={e} className="text-xs text-rose-600">{e}</p>)}
                  </div>
                )}

                <div>
                  <label className={labelClass}>Aluno *</label>
                  <select value={studentId} onChange={e => setStudentId(e.target.value)} className={inputClass} disabled={!isTeacher}>
                    {selectableStudents.map((student) => (
                      <option key={student.id} value={student.id}>{student.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Instrumento *</label>
                  <select value={instrument} onChange={e => setInstrument(e.target.value)} className={inputClass}>
                    {INSTRUMENTS.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div>
                    <label className={labelClass}>Professor</label>
                    <input
                      value="Marcos Mello"
                      disabled
                      className={`${inputClass} bg-[var(--surface-soft)] text-[var(--muted)]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Data</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Início</label>
                    <select value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass}>
                      {ALL_HOURS.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Fim (automático)</label>
                    <input type="time" value={endTime} readOnly disabled className={`${inputClass} bg-[var(--surface-soft)] text-[var(--muted)]`} />
                  </div>
                </div>

                <p className="text-[11px] text-[var(--muted)] -mt-2">Todas as aulas possuem duração fixa de 50 minutos.</p>

                <label className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]">
                  <span className="flex items-center gap-2">
                    <Video size={14} className="text-(--accent-600)" />
                    Criar com Google Meet
                  </span>
                  <input
                    type="checkbox"
                    checked={hasMeetLink}
                    onChange={(e) => setHasMeetLink(e.target.checked)}
                    className="rounded border-[var(--input-border)]"
                  />
                </label>

                <label className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]">
                  <span className="flex items-center gap-2">
                    <Repeat size={14} className="text-(--accent-600)" />
                    Aula recorrente (repete toda semana)
                  </span>
                  <input
                    type="checkbox"
                    checked={recorrente}
                    onChange={(e) => setRecorrente(e.target.checked)}
                    className="rounded border-[var(--input-border)]"
                  />
                </label>
                {recorrente && (
                  <p className="text-[11px] text-(--muted) -mt-2">
                    Serão criadas 4 aulas semanais consecutivas a partir desta data.
                  </p>
                )}

                {selectedStudent && (
                  <p className="text-xs text-[var(--muted)]">
                    Contato do aluno: {selectedStudent.telefone || 'sem telefone cadastrado'}
                  </p>
                )}

                <div>
                  <label className={labelClass}>Observações</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Objetivos da aula, materiais..." className={`${inputClass} resize-none`} />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[var(--border)] flex items-center gap-2 justify-end">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit}>Criar Aula</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
