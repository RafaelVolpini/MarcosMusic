import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Video, Repeat, ChevronDown } from 'lucide-react';
import type { Lesson, LessonType, Aluno } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { minutesToTime, timeToMinutes } from '../../utils';
import { Button } from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

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
    isOnline: boolean;
    recorrente: boolean;
  }) => void;
}

export function NewLessonModal({
  open,
  defaultDate,
  defaultTime,
  lessons: _lessons,
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
  const [isOnline, setIsOnline] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
        setStudentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setIsOnline(false);
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
      type: isOnline ? 'online' : 'individual',
      instrument,
      notes,
      isOnline,
      recorrente,
    });
    onClose();
  };

  const inputClass = 'w-full border border-(--input-border) rounded-xl px-3 py-2 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-(--accent-100) bg-(--input-bg)';
  const labelClass = 'text-xs font-medium text-(--muted) mb-1 block';
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-80"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="fixed inset-0 z-90 flex items-center justify-center pointer-events-none px-4"
          >
            <div className="app-surface rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-(--border)">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-(--accent-50) rounded-xl flex items-center justify-center">
                    <Plus size={16} className="text-(--accent-600)" />
                  </div>
                  <h2 className="text-base font-bold text-(--heading)">{t('modals.newLesson.title')}</h2>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-(--muted) hover:text-(--text) hover:bg-(--hover-bg)">
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
                  <label className={labelClass}>{t('modals.newLesson.student')}</label>
                  {isTeacher ? (
                    <div className="relative" ref={studentDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setStudentDropdownOpen(o => !o)}
                        className={`${inputClass} flex items-center justify-between text-left`}
                      >
                        <span className={selectedStudent ? 'text-(--text)' : 'text-(--muted)'}>
                          {selectedStudent?.nome ?? t('modals.newLesson.student')}
                        </span>
                        <ChevronDown size={14} className={`text-(--muted) transition-transform ${studentDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {studentDropdownOpen && (
                        <div className="absolute z-200 mt-1 w-full rounded-xl border border-(--border) bg-(--surface) shadow-lg overflow-hidden">
                          <div className="max-h-48 overflow-y-auto">
                            {selectableStudents.map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                onClick={() => { setStudentId(student.id); setStudentDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-(--hover-bg) transition-colors ${
                                  studentId === student.id ? 'text-(--accent-600) font-medium bg-(--accent-50)' : 'text-(--text)'
                                }`}
                              >
                                {student.nome}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      value={selectedStudent?.nome ?? ''}
                      disabled
                      className={`${inputClass} bg-(--surface-soft) text-(--muted)`}
                    />
                  )}
                </div>

                <div>
                  <label className={labelClass}>{t('modals.newLesson.instrument')}</label>
                  <select value={instrument} onChange={e => setInstrument(e.target.value)} className={inputClass}>
                    {INSTRUMENTS.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div>
                    <label className={labelClass}>{t('modals.newLesson.teacher')}</label>
                    <input
                      value="Marcos Mello"
                      disabled
                      className={`${inputClass} bg-(--surface-soft) text-(--muted)`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('modals.newLesson.date')}</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{t('modals.newLesson.start')}</label>
                    <select value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass}>
                      {ALL_HOURS.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('modals.newLesson.end')}</label>
                    <input type="time" value={endTime} readOnly disabled className={`${inputClass} bg-(--surface-soft) text-(--muted)`} />
                  </div>
                </div>

                <p className="text-[11px] text-(--muted) -mt-2">{t('modals.newLesson.duration50')}</p>

                <label className="flex items-center justify-between rounded-xl border border-(--border) px-3 py-2 text-sm text-(--text)">
                  <span className="flex items-center gap-2">
                    <Video size={14} className="text-(--accent-600)" />
                    {t('modals.newLesson.meetCheck')}
                  </span>
                  <input
                    type="checkbox"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    className="rounded border-(--input-border)"
                  />
                </label>

                <label className="flex items-center justify-between rounded-xl border border-(--border) px-3 py-2 text-sm text-(--text)">
                  <span className="flex items-center gap-2">
                    <Repeat size={14} className="text-(--accent-600)" />
                    {t('modals.newLesson.recurringCheck')}
                  </span>
                  <input
                    type="checkbox"
                    checked={recorrente}
                    onChange={(e) => setRecorrente(e.target.checked)}
                    className="rounded border-(--input-border)"
                  />
                </label>
                {recorrente && (
                  <p className="text-[11px] text-(--muted) -mt-2">
                    {t('modals.newLesson.recurringInfo')}
                  </p>
                )}

                {selectedStudent && (
                  <p className="text-xs text-(--muted)">
                    {t('modals.newLesson.contact')} {selectedStudent.telefone || t('modals.newLesson.noPhone')}
                  </p>
                )}

                <div>
                  <label className={labelClass}>{t('modals.newLesson.notes')}</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t('modals.newLesson.notesPH')} className={`${inputClass} resize-none`} />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-(--border) flex items-center gap-2 justify-end">
                <Button variant="secondary" onClick={onClose}>{t('modals.newLesson.cancel')}</Button>
                <Button onClick={handleSubmit}>{t('modals.newLesson.create')}</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
