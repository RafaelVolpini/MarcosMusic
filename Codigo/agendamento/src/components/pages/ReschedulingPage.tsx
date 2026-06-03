import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../ui/Toast';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Clock, Trash2, Users, X, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Aluno } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { buscarDisponibilidade, type DisponibilidadeResponseDTO } from '../../services/aulaService';
import { listarAlunos } from '../../services/alunoService';
import {
  listarReposicoes,
  adicionarAluno,
  deletarReposicao,
  removerAluno,
  type ReposicaoDTO,
} from '../../services/reposicaoService';
import { ReposicaoViewModal } from '../modals/ReposicaoViewModal';
import { AgendarReposicaoModal } from '../modals/AgendarReposicaoModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  DAY_LABELS, STATUS_COLOR, STATUS_LABEL,
  getThisWeek, thisWeekDate, normalizeName,
} from '../../utils/reposicaoHelpers';

// --- Page ---

interface ReschedulingPageProps {
  sessionUser: AuthUser;
}

// Returns minutes until the reposição starts (negative if already started)
function minutesUntilStart(dataAula: string, horario: string): number {
  const start = new Date(`${dataAula}T${horario}:00`);
  return (start.getTime() - Date.now()) / 60_000;
}

export function ReschedulingPage({ sessionUser }: ReschedulingPageProps) {
  const isTeacher = sessionUser.role === 'teacher';
  const toast = useToast();
  const { t } = useLanguage();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [slots, setSlots] = useState<DisponibilidadeResponseDTO[]>([]);
  const [reposicoes, setReposicoes] = useState<ReposicaoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSlotsPicker, setShowSlotsPicker] = useState(false);
  const [agendarSlot, setAgendarSlot] = useState<DisponibilidadeResponseDTO | null>(null);
  const [viewModal, setViewModal] = useState<ReposicaoDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [, setRemovingKey] = useState<string | null>(null);
  const [, setEnrollingId] = useState<number | null>(null);

  const currentAluno = !isTeacher
    ? alunos.find(a => a.email.trim().toLowerCase() === sessionUser.email.trim().toLowerCase())
      ?? alunos.find(a =>
          normalizeName(a.nome.split(' ')[0] ?? '') ===
          normalizeName(sessionUser.firstName || sessionUser.name.split(' ')[0] || '')
        )
    : undefined;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [alunosList, disp, repos] = await Promise.all([
        listarAlunos(),
        buscarDisponibilidade(),
        listarReposicoes(),
      ]);
      setAlunos(alunosList);
      const { weekStart, weekEnd } = getThisWeek();
      const todayISO = new Date().toISOString().slice(0, 10);
      const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
      setSlots(
        disp
          .filter(d => {
            if (!d.reposicao) return false;
            const date = thisWeekDate(d.diaSemana);
            if (!date) return false;
            // Não mostra slots que já têm reposição criada para essa semana
            if (repos.some(r => r.disponibilidadeId === d.id && r.dataAula === date)) return false;
            // Se é hoje, só mostra horários que ainda não passaram
            if (date === todayISO) {
              const [h, m] = d.horario.split(':').map(Number);
              return h * 60 + m > nowMins;
            }
            return true;
          })
          .sort((a, b) => {
            const dateA = thisWeekDate(a.diaSemana) ?? '';
            const dateB = thisWeekDate(b.diaSemana) ?? '';
            if (dateA !== dateB) return dateA.localeCompare(dateB);
            return a.horario.localeCompare(b.horario);
          }),
      );
      setReposicoes(
        repos
          .filter(r => r.dataAula >= weekStart && r.dataAula <= weekEnd)
          .sort((a, b) => a.dataAula.localeCompare(b.dataAula)),
      );
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (r: ReposicaoDTO) => {
    setReposicoes(prev => [...prev, r].sort((a, b) => a.dataAula.localeCompare(b.dataAula)));
    // Remove o slot da lista de disponíveis, já que a reposição foi criada para ele
    setSlots(prev => prev.filter(s => !(s.id === r.disponibilidadeId && thisWeekDate(s.diaSemana) === r.dataAula)));
    setAgendarSlot(null);
    toast(t('rescheduling.created'), 'success');
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deletarReposicao(id);
      setReposicoes(prev => prev.filter(r => r.id !== id));
      toast(t('rescheduling.deleted'), 'info');
    } catch {
      toast(t('rescheduling.deleteError'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveAluno = async (reposicaoId: number, alunoId: string) => {
    const key = `${reposicaoId}-${alunoId}`;
    setRemovingKey(key);
    try {
      const updated = await removerAluno(reposicaoId, alunoId);
      setReposicoes(prev => prev.map(r => r.id === reposicaoId ? updated : r));
      setViewModal(prev => prev?.id === reposicaoId ? updated : prev);
      toast(t('rescheduling.studentRemoved'), 'info');
    } catch {
      toast(t('rescheduling.studentRemoveError'), 'error');
    } finally {
      setRemovingKey(null);
    }
  };

  const handleEnroll = async (reposicaoId: number, alunoId: string) => {
    setEnrollingId(reposicaoId);
    try {
      const updated = await adicionarAluno(reposicaoId, alunoId);
      setReposicoes(prev => prev.map(r => r.id === reposicaoId ? updated : r));
      setViewModal(prev => prev?.id === reposicaoId ? updated : prev);
      toast(t('rescheduling.enrolled'), 'success');
    } catch {
      toast(t('rescheduling.enrollError'), 'error');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleUnenroll = async (reposicaoId: number, alunoId: string) => {
    setEnrollingId(reposicaoId);
    try {
      const updated = await removerAluno(reposicaoId, alunoId);
      setReposicoes(prev => prev.map(r => r.id === reposicaoId ? updated : r));
      setViewModal(prev => prev?.id === reposicaoId ? updated : prev);
      toast(t('rescheduling.unenrolled'), 'info');
    } catch {
      toast(t('rescheduling.unenrollError'), 'error');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="page-padding space-y-7">
      {/* Header */}
      <Card className="p-5 border-l-4 border-l-(--accent-500) app-surface">
        <div className="flex items-start gap-3">
          <Users size={18} className="text-(--accent-600) shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-(--heading)">{t('rescheduling.title')}</h3>
            <p className="text-xs text-(--muted) mt-0.5">
              {isTeacher
                ? t('rescheduling.teacherInfo')
                : t('rescheduling.studentInfo')}
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-(--accent-500) border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Professor: horarios disponiveis como botao compacto */}
          {isTeacher && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--muted) mb-3">
                {t('rescheduling.slotsTitle')} ({slots.length})
              </h2>
              {slots.length === 0 ? (
                <Card className="p-6 app-surface text-center">
                  <p className="text-sm text-(--muted)">
                    {t('rescheduling.noSlots')}
                  </p>
                </Card>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSlotsPicker(true)}
                  className="w-full text-left"
                >
                  <Card className="p-4 app-surface flex items-center gap-4 hover:border-(--accent-400) transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--accent-500)_12%,var(--surface))] flex items-center justify-center shrink-0">
                      <CalendarPlus size={18} className="text-(--accent-600)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-(--heading)">
                        {slots.length} {t('rescheduling.slotsCount')}
                      </p>
                      <p className="text-xs text-(--muted)">
                        {t('rescheduling.click')}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-(--muted) group-hover:text-(--accent-600) transition-colors shrink-0" />
                  </Card>
                </button>
              )}
            </section>
          )}

          {/* Reposicoes list */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-(--muted) mb-3">
              {isTeacher ? t('rescheduling.scheduledTitle') : t('rescheduling.availableTitle')}{' '}
              ({reposicoes.length})
            </h2>
            {reposicoes.length === 0 ? (
              <Card className="p-6 app-surface text-center">
                <p className="text-sm text-(--muted)">
                  {isTeacher
                    ? t('rescheduling.noScheduled')
                    : t('rescheduling.noAvailable')}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {reposicoes.map((r, i) => {
                    const isEnrolled = !!currentAluno && r.alunos.some(a => a.id === currentAluno.id);
                    return (
                      <motion.div
                        key={r.id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          className="w-full text-left cursor-pointer"
                          onClick={() => {
                            if (!isTeacher && r.status === 'ABERTA') {
                              const mins = minutesUntilStart(r.dataAula, r.horario);
                              if (mins < 0) {
                                toast(t('rescheduling.started'), 'warning');
                              } else if (mins < 30) {
                                toast(
                                  t('rescheduling.closed30').replace('{n}', String(Math.ceil(mins))),
                                  'warning',
                                );
                              }
                            }
                            setViewModal(r);
                          }}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
                        >
                        <Card
                          className="p-4 app-surface cursor-pointer hover:border-(--accent-400) transition-colors group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 shrink-0 flex flex-col items-center pt-0.5">
                              <span className="text-lg font-black text-(--accent-600) leading-none">
                                {new Date(`${r.dataAula}T12:00:00`).getDate()}
                              </span>
                              <span className="text-[10px] text-(--muted) uppercase tracking-wide">
                                {new Date(`${r.dataAula}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' })}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-(--heading)">
                                  {DAY_LABELS[r.diaSemana] ?? r.diaSemana} · {r.horario}
                                </p>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status] ?? ''}`}>
                                  {STATUS_LABEL[r.status] ?? r.status}
                                </span>
                              </div>
                              {r.observacao && (
                                <p className="text-xs text-(--muted) mt-0.5">{r.observacao}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-xs text-(--muted) flex items-center gap-1">
                                  <Users size={11} />
                                  {r.alunos.length} {t('rescheduling.inscribed')}
                                </span>
                                {!isTeacher && isEnrolled && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={10} /> {t('rescheduling.enrolled')}
                                  </span>
                                )}
                                {isTeacher && r.alunos.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {r.alunos.map(a => (
                                      <span
                                        key={a.id}
                                        className="text-[10px] bg-[color-mix(in_srgb,var(--accent-500)_10%,var(--surface))] text-(--text) border border-(--border) px-1.5 py-0.5 rounded-full"
                                      >
                                        {a.nome.split(' ')[0]}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {isTeacher && (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                                disabled={deletingId === r.id}
                                className="p-1.5 rounded-lg text-(--muted) hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 shrink-0 self-start"
                                title={t('rescheduling.deleteTitle')}
                              >
                                {deletingId === r.id ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        </Card>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>
        </>
      )}

      {/* Slots picker modal */}
      <AnimatePresence>
        {showSlotsPicker && !agendarSlot && (
          <SlotsPickerModal
            key="slots-picker"
            slots={slots}
            onClose={() => setShowSlotsPicker(false)}
            onSelect={slot => {
              setShowSlotsPicker(false);
              setAgendarSlot(slot);
            }}
          />
        )}
      </AnimatePresence>

      {/* Agendar modal */}
      <AnimatePresence>
        {agendarSlot && (
          <AgendarReposicaoModal
            key="agendar-modal"
            slot={agendarSlot}
            defaultDate={thisWeekDate(agendarSlot.diaSemana) ?? agendarSlot.diaSemana}
            alunos={alunos}
            onClose={() => setAgendarSlot(null)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>

      {/* View modal */}
      <AnimatePresence>
        {viewModal && (
          <ReposicaoViewModal
            key="view-modal"
            reposicao={viewModal}
            isTeacher={isTeacher}
            currentAlunoId={currentAluno?.id}
            onClose={() => setViewModal(null)}
            onEnroll={handleEnroll}
            onUnenroll={handleUnenroll}
            onDeleteAluno={handleRemoveAluno}
            onDelete={async id => {
              await handleDelete(id);
              setViewModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SlotsPickerModal ---

interface SlotsPickerModalProps {
  slots: DisponibilidadeResponseDTO[];
  onClose: () => void;
  onSelect: (slot: DisponibilidadeResponseDTO) => void;
}

function SlotsPickerModal({ slots, onClose, onSelect }: SlotsPickerModalProps) {
  const { t } = useLanguage();
  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        key="panel"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
      >
        <div
          className="w-full max-w-md bg-(--surface) rounded-2xl shadow-2xl border border-(--border) overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-(--border) shrink-0">
            <div className="flex items-center gap-2">
              <CalendarPlus size={15} className="text-(--accent-600)" />
              <span className="font-semibold text-(--heading) text-sm">{t('rescheduling.selectSlot')}</span>
              <span className="text-xs text-(--muted) bg-(--surface-soft) px-2 py-0.5 rounded-full border border-(--border)">
                {slots.length}
              </span>
            </div>
            <button onClick={onClose} className="text-(--muted) hover:text-(--text) transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-4 space-y-2">
            {slots.map((slot, i) => {
              const dateStr = thisWeekDate(slot.diaSemana);
              const dateLabel = dateStr
                ? new Date(`${dateStr}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
                : '-';
              return (
                <motion.button
                  key={slot.id}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelect(slot)}
                  className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl border border-(--border) bg-(--surface-soft) hover:border-(--accent-400) hover:bg-[color-mix(in_srgb,var(--accent-500)_6%,var(--surface))] transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[color-mix(in_srgb,var(--accent-500)_12%,var(--surface))] flex items-center justify-center shrink-0">
                    <Clock size={15} className="text-(--accent-600)" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--heading)">
                       {DAY_LABELS[slot.diaSemana] ?? slot.diaSemana} · {slot.horario}
                    </p>
                    <p className="text-xs text-(--muted)">{dateLabel}</p>
                  </div>
                  <ChevronRight size={14} className="text-(--muted) group-hover:text-(--accent-600) transition-colors shrink-0" />
                </motion.button>
              );
            })}
          </div>

          <div className="px-5 py-3 border-t border-(--border) shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full">{t('common.cancel')}</Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}