import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, Trash2, X, UserMinus, UserPlus, TriangleAlert } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { DAY_LABELS, STATUS_COLOR, STATUS_LABEL } from '../../utils/reposicaoHelpers';
import { useToast } from '../ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import type { ReposicaoDTO } from '../../services/reposicaoService';

export interface ReposicaoViewModalProps {
  reposicao: ReposicaoDTO;
  isTeacher: boolean;
  currentAlunoId?: string;
  onClose: () => void;
  onEnroll: (id: number, alunoId: string) => Promise<void>;
  onUnenroll: (id: number, alunoId: string) => Promise<void>;
  onDeleteAluno: (id: number, alunoId: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function ReposicaoViewModal({
  reposicao, isTeacher, currentAlunoId,
  onClose, onEnroll, onUnenroll, onDeleteAluno, onDelete,
}: ReposicaoViewModalProps) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { t } = useLanguage();
  const isEnrolled = !!currentAlunoId && reposicao.alunos.some(a => a.id === currentAlunoId);

  // Minutes until start (negative = already started)
  const minsUntilStart = (() => {
    const start = new Date(`${reposicao.dataAula}T${reposicao.horario}:00`);
    return (start.getTime() - Date.now()) / 60_000;
  })();
  const enrollmentOpen = minsUntilStart >= 30;

  const handleEnrollToggle = async () => {
    if (!currentAlunoId) return;
    // Block enrollment when < 30 min to start
    if (!isEnrolled && !enrollmentOpen) {
      const reason = minsUntilStart < 0
        ? t('modals.reposicao.alreadyStarted')
        : t('modals.reposicao.enrollClosed').replace('{n}', String(Math.ceil(minsUntilStart)));
      toast(reason, 'warning');
      return;
    }
    setBusy(true);
    try {
      if (isEnrolled) await onUnenroll(reposicao.id, currentAlunoId);
      else await onEnroll(reposicao.id, currentAlunoId);
    } finally {
      setBusy(false);
      onClose();
    }
  };

  const handleRemoveAluno = async (alunoId: string) => {
    setBusy(true);
    try { await onDeleteAluno(reposicao.id, alunoId); }
    finally { setBusy(false); onClose(); }
  };

  const handleDelete = async () => {
    setBusy(true);
    try { await onDelete(reposicao.id); }
    finally { setBusy(false); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md bg-(--surface) rounded-2xl shadow-2xl border border-(--border) overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <div className="flex items-center gap-2 flex-wrap">
            <Eye size={16} className="text-(--accent-600) shrink-0" />
            <span className="font-semibold text-(--heading) text-sm">
              {DAY_LABELS[reposicao.diaSemana] ?? reposicao.diaSemana} • {reposicao.horario}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[reposicao.status] ?? ''}`}>
              {STATUS_LABEL[reposicao.status] ?? reposicao.status}
            </span>
          </div>
          <button onClick={onClose} className="text-(--muted) hover:text-(--text) transition-colors shrink-0 ml-2">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-(--text)">
            <Clock size={14} className="text-(--muted) shrink-0" />
            <span>
              {new Date(`${reposicao.dataAula}T12:00:00`).toLocaleDateString('pt-BR', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </span>
          </div>

          {/* Observacao */}
          {reposicao.observacao && (
            <p className="text-xs text-(--muted) italic px-1">{reposicao.observacao}</p>
          )}

          {/* Enrollment cutoff warning (student only) */}
          {!isTeacher && !isEnrolled && reposicao.status === 'ABERTA' && !enrollmentOpen && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
              <TriangleAlert size={14} className="shrink-0 mt-0.5" />
              <span>
                {minsUntilStart < 0
                  ? t('modals.reposicao.alreadyStarted')
                  : t('modals.reposicao.enrollClosed30')}
              </span>
            </div>
          )}

          {/* Enrolled students */}
          <div>
            <p className="text-xs font-semibold text-(--muted) mb-2 uppercase tracking-wider">
              {t('modals.reposicao.enrolledStudents')} ({reposicao.alunos.length})
            </p>
            {reposicao.alunos.length === 0 ? (
              <p className="text-xs text-(--muted) italic py-2">{t('modals.reposicao.noStudents')}</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {reposicao.alunos.map(aluno => (
                  <div
                    key={aluno.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-(--surface-soft) border border-(--border)"
                  >
                    <Avatar name={aluno.nome} size="sm" />
                    <span className="flex-1 text-sm text-(--text)">{aluno.nome}</span>
                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAluno(aluno.id)}
                        disabled={busy}
                        className="text-(--muted) hover:text-rose-500 transition-colors disabled:opacity-40"
                        title={`Remover ${aluno.nome}`}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
              {t('modals.reposicao.close')}
            </Button>
            {isTeacher ? (
              <Button size="sm" variant="danger" onClick={handleDelete} disabled={busy} className="flex-1">
                <Trash2 size={13} /> {t('modals.reposicao.deleteBtn')}
              </Button>
            ) : currentAlunoId && reposicao.status === 'ABERTA' && (
              <Button
                size="sm"
                variant={isEnrolled ? 'secondary' : 'primary'}
                onClick={handleEnrollToggle}
                disabled={busy || (!isEnrolled && !enrollmentOpen)}
                className="flex-1"
              >
                {busy ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isEnrolled ? (
                  <><UserMinus size={13} /> {t('modals.reposicao.unenroll')}</>
                ) : (
                  <><UserPlus size={13} /> {t('modals.reposicao.enroll')}</>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
