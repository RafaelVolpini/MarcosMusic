import type { ReactNode } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, GraduationCap, Building2, Clock, FileText,
  Video, ExternalLink, CheckCircle, XCircle,
  RefreshCw, Music,
} from 'lucide-react';
import type { Lesson } from '../../types';
import { formatTime, formatDuration, generateMeetLink } from '../../utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

interface LessonModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onUpdate: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  group: 'Em grupo',
  online: 'Online',
  trial: 'Experimental',
};

const STATUS_BADGE: Record<string, { variant: 'success' | 'info' | 'danger' | 'warning' | 'default'; label: string }> = {
  scheduled: { variant: 'info', label: 'Agendada' },
  completed: { variant: 'success', label: 'Concluída' },
  cancelled: { variant: 'danger', label: 'Cancelada' },
  rescheduled: { variant: 'warning', label: 'Reagendada' },
};

export function LessonModal({ lesson, onClose, onUpdate, onDelete }: LessonModalProps) {
  const [notes, setNotes] = useState(lesson?.notes ?? '');
  const [meetLink, setMeetLink] = useState(lesson?.meetLink ?? '');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!lesson) return null;

  const statusInfo = STATUS_BADGE[lesson.status];
  const duration = formatDuration(lesson.startTime, lesson.endTime);

  const handleGenerateMeet = () => {
    const link = generateMeetLink();
    setMeetLink(link);
  };

  const handleSave = () => {
    onUpdate({ ...lesson, notes, meetLink });
    setEditing(false);
  };

  return (
    <AnimatePresence>
      {lesson && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
          >
            <div className="app-surface bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden">
              {/* Header with color accent */}
              <div
                className="h-2 rounded-t-3xl"
                style={{ backgroundColor: lesson.color }}
              />
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <Badge variant="default">{TYPE_LABELS[lesson.type]}</Badge>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{lesson.instrument}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {new Date(lesson.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">

                {/* Student & Teacher */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<User size={14} />} label="Aluno">
                    <div className="flex items-center gap-2">
                      <Avatar name={lesson.studentName} size="sm" />
                      <span className="text-sm font-medium text-slate-900">{lesson.studentName}</span>
                    </div>
                  </InfoRow>
                  <InfoRow icon={<GraduationCap size={14} />} label="Professor">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: lesson.color }} />
                      <span className="text-sm font-medium text-slate-900">{lesson.teacherName}</span>
                    </div>
                  </InfoRow>
                </div>

                {/* Room & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<Building2 size={14} />} label="Sala">
                    <span className="text-sm text-slate-900">{lesson.roomName}</span>
                  </InfoRow>
                  <InfoRow icon={<Clock size={14} />} label="Horário">
                    <span className="text-sm text-slate-900">
                      {formatTime(lesson.startTime)} – {formatTime(lesson.endTime)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">({duration})</span>
                  </InfoRow>
                </div>

                {/* Meet link */}
                {(lesson.type === 'online' || meetLink) && (
                  <InfoRow icon={<Video size={14} />} label="Link da Aula Online">
                    {meetLink ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-(--accent-700) hover:underline flex items-center gap-1 truncate"
                        >
                          {meetLink.replace('https://', '')}
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                        {editing && (
                          <Button size="sm" variant="ghost" onClick={() => setMeetLink('')}>
                            <X size={12} />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={handleGenerateMeet}>
                        <Video size={12} />
                        Gerar link Meet
                      </Button>
                    )}
                  </InfoRow>
                )}

                {/* Notes */}
                <InfoRow icon={<FileText size={14} />} label="Observações">
                  {editing ? (
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Adicionar observações sobre a aula..."
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-(--accent-100) text-slate-700"
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{notes || <span className="text-slate-400 italic">Sem observações</span>}</p>
                  )}
                </InfoRow>

                {/* Recording */}
                {lesson.recording && (
                  <InfoRow icon={<Music size={14} />} label="Gravação">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-(--accent-50) flex items-center justify-center">
                        <Video size={14} className="text-(--accent-600)" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{lesson.recording.title}</p>
                        <p className="text-xs text-slate-400">{Math.floor(lesson.recording.duration / 60)} min</p>
                      </div>
                      <a href={lesson.recording.url} className="text-(--accent-600) hover:text-(--accent-700)">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </InfoRow>
                )}
              </div>

              {/* Footer actions */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2">
                {!editing ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCw size={13} />
                      Reagendar
                    </Button>
                    {!confirmDelete ? (
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 ml-auto" onClick={() => setConfirmDelete(true)}>
                        <XCircle size={13} />
                        Cancelar aula
                      </Button>
                    ) : (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-slate-500">Tem certeza?</span>
                        <Button variant="danger" size="sm" onClick={() => onDelete(lesson.id)}>Sim, cancelar</Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Não</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
                    <Button size="sm" onClick={handleSave} className="ml-auto">
                      <CheckCircle size={13} />
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Info Row Helper ──────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-slate-400">{icon}</span>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="ml-5">{children}</div>
    </div>
  );
}
