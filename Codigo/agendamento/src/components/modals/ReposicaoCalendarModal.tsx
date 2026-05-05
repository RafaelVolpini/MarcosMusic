import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Clock, Users, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import type { AuthUser } from '../../lib/auth';
import type { ReposicaoDTO } from '../../services/reposicaoService';
import { adicionarAluno, removerAluno, deletarReposicao } from '../../services/reposicaoService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { DAY_LABELS, STATUS_COLOR, STATUS_LABEL } from '../../utils/reposicaoHelpers';

export interface ReposicaoCalendarModalProps {
  reposicao: ReposicaoDTO;
  currentUser: AuthUser;
  /** ID do aluno logado (undefined se for professor) */
  currentAlunoId?: string;
  onClose: () => void;
  onUpdated: (r: ReposicaoDTO) => void;
  onDeleted: (id: number) => void;
}

export function ReposicaoCalendarModal({
  reposicao: initial,
  currentUser,
  currentAlunoId,
  onClose,
  onUpdated,
  onDeleted,
}: ReposicaoCalendarModalProps) {
  const [reposicao, setReposicao] = useState(initial);
  const [busy, setBusy] = useState(false);

  const isTeacher = currentUser.role === 'teacher';
  const isEnrolled = !!currentAlunoId && reposicao.alunos.some(a => a.id === currentAlunoId);
  const isOpen = reposicao.status === 'ABERTA';

  const run = async (fn: () => Promise<ReposicaoDTO | void>) => {
    setBusy(true);
    try {
      const result = await fn();
      if (result) { setReposicao(result); onUpdated(result); }
    } finally {
      setBusy(false);
    }
  };

  const handleEnroll = () =>
    run(async () => {
      if (!currentAlunoId) return;
      return await adicionarAluno(reposicao.id, currentAlunoId);
    });

  const handleUnenroll = () =>
    run(async () => {
      if (!currentAlunoId) return;
      return await removerAluno(reposicao.id, currentAlunoId);
    });

  const handleRemoveAluno = (alunoId: string) =>
    run(async () => removerAluno(reposicao.id, alunoId));

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deletarReposicao(reposicao.id);
      onDeleted(reposicao.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
      >
        <div
          className="w-full max-w-sm bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Accent stripe using theme gradient */}
          <div
            className="h-1.5"
            style={{ background: 'linear-gradient(90deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <RefreshCw size={14} className="text-[var(--accent-600)] shrink-0" />
              <span className="font-semibold text-[var(--heading)] text-sm truncate">
                {DAY_LABELS[reposicao.diaSemana] ?? reposicao.diaSemana} · {reposicao.horario}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[reposicao.status] ?? ''}`}>
                {STATUS_LABEL[reposicao.status] ?? reposicao.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--text)] transition-colors shrink-0 ml-2"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-[var(--text)]">
              <Clock size={13} className="text-[var(--muted)] shrink-0" />
              <span>
                {new Date(`${reposicao.dataAula}T12:00:00`).toLocaleDateString('pt-BR', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </span>
            </div>

            {/* Observation */}
            {reposicao.observacao && (
              <p className="text-xs text-[var(--muted)] italic">{reposicao.observacao}</p>
            )}

            {/* Enrolled students */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users size={12} className="text-[var(--muted)]" />
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Alunos inscritos ({reposicao.alunos.length})
                </span>
              </div>
              {reposicao.alunos.length === 0 ? (
                <p className="text-xs text-[var(--muted)] italic py-1">Nenhum aluno inscrito ainda.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {reposicao.alunos.map(aluno => (
                    <div
                      key={aluno.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]"
                    >
                      <Avatar name={aluno.nome} size="sm" />
                      <span className="flex-1 text-sm text-[var(--text)] truncate">{aluno.nome}</span>
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAluno(aluno.id)}
                          disabled={busy}
                          className="text-[var(--muted)] hover:text-rose-500 transition-colors disabled:opacity-40 shrink-0"
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
                Fechar
              </Button>

              {isTeacher ? (
                <Button size="sm" variant="danger" onClick={handleDelete} disabled={busy} className="flex-1">
                  <Trash2 size={13} /> Excluir
                </Button>
              ) : currentAlunoId && isOpen && (
                <Button
                  size="sm"
                  variant={isEnrolled ? 'secondary' : 'primary'}
                  onClick={isEnrolled ? handleUnenroll : handleEnroll}
                  disabled={busy}
                  className="flex-1"
                >
                  {busy ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isEnrolled ? (
                    <><UserMinus size={13} /> Sair</>
                  ) : (
                    <><UserPlus size={13} /> Me inscrever</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
