import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import type { Teacher, Room, LessonType, WeeklyAvailability } from '../../types';
import { getDayKeyFromISODate, minutesToTime, timeToMinutes } from '../../utils';
import { Button } from '../ui/Button';

const LESSON_DURATION_MINUTES = 50;

interface NewLessonModalProps {
  open: boolean;
  defaultDate: string;
  defaultTime: string;
  teachers: Teacher[];
  rooms: Room[];
  availability: WeeklyAvailability;
  onClose: () => void;
  onCreate: (data: {
    studentName: string;
    teacherId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: LessonType;
    instrument: string;
    notes: string;
    meetLink: string;
  }) => void;
}

export function NewLessonModal({
  open, defaultDate, defaultTime, teachers, rooms, availability, onClose, onCreate,
}: NewLessonModalProps) {
  const [student, setStudent] = useState('');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? '');
  const [roomId] = useState(rooms[0]?.id ?? '');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultTime);
  const [instrument, setInstrument] = useState(teachers[0]?.instruments?.[0] ?? 'Piano');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const availableTimesForDate = date
    ? availability[getDayKeyFromISODate(date)]
    : [];

  const endTime = startTime
    ? minutesToTime(timeToMinutes(startTime) + LESSON_DURATION_MINUTES)
    : '';

  const isCurrentStartTimeAvailable = availableTimesForDate.includes(`${startTime.slice(0, 2)}:00`);

  useEffect(() => {
    if (availableTimesForDate.length > 0 && !availableTimesForDate.includes(`${startTime.slice(0, 2)}:00`)) {
      setStartTime(availableTimesForDate[0]);
    }
  }, [availableTimesForDate, startTime]);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate);
    setStartTime(defaultTime);
    setErrors([]);
  }, [open, defaultDate, defaultTime]);

  const validate = () => {
    const errs: string[] = [];
    if (!student.trim()) errs.push('Nome do aluno é obrigatório');
    if (!instrument.trim()) errs.push('Instrumento é obrigatório');
    if (!isCurrentStartTimeAvailable) errs.push('Esse horário está indisponível no calendário do professor');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreate({
      studentName: student,
      teacherId,
      roomId,
      date,
      startTime,
      endTime,
      type: 'individual',
      instrument,
      notes,
      meetLink: '',
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
                  <label className={labelClass}>Nome do Aluno *</label>
                  <input value={student} onChange={e => setStudent(e.target.value)} placeholder="Ex: Gabriel Mendes" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Instrumento *</label>
                  <select value={instrument} onChange={e => setInstrument(e.target.value)} className={inputClass}>
                    {(teachers.find(t => t.id === teacherId)?.instruments ?? ['Piano']).map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div>
                    <label className={labelClass}>Professor</label>
                    <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className={inputClass}>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
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
                      {availableTimesForDate.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                      {!availableTimesForDate.includes(startTime) && startTime && (
                        <option value={startTime}>{startTime} (indisponível)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Fim (automático)</label>
                    <input type="time" value={endTime} readOnly disabled className={`${inputClass} bg-[var(--surface-soft)] text-[var(--muted)]`} />
                  </div>
                </div>

                <p className="text-[11px] text-[var(--muted)] -mt-2">Todas as aulas possuem duração fixa de 50 minutos.</p>

                {availableTimesForDate.length === 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Sem horários disponíveis para este dia. Ajuste no Calendário de Disponibilidade.
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
