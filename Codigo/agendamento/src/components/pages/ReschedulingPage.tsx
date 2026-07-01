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
  thisWeekDate, normalizeName,
} from '../../utils/reposicaoHelpers';

// --- Page ---

interface ReschedulingPageProps {
  sessionUser: AuthUser;
}

// Returns minutes until the reposiï¿½ï¿½o starts (negative if already started)
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
      const todayISO = new Date().toISOString().slice(0, 10);
      const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

      // Slots disponÃ­veis: qualquer slot de reposiÃ§Ã£o desta semana em diante
      // que ainda nÃ£o tenha uma reposiÃ§Ã£o criada para aquela data
      setSlots(
        disp
          .filter(d => {
            if (!d.reposicao) return false;
            const date = thisWeekDate(d.diaSemana);
            if (!date) return false;
            // Oculta slot se jÃ¡ existe reposiÃ§Ã£o criada para esse dia+slot
            if (repos.some(r => r.disponibilidadeId === d.id && r.dataAula === date)) return false;
            // Se Ã© hoje, sÃ³ mostra horÃ¡rios que ainda nÃ£o passaram
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

      // ReposiÃ§Ãµes: todas a partir de hoje, em ordem cronolÃ³gica (data + horÃ¡rio)
      setReposicoes(
        repos
          .filter(r => r.dataAula >= todayISO)
          .sort((a, b) => {
            const cmp = a.dataAula.localeCompare(b.dataAula);
            return cmp !== 0 ? cmp : a.horario.localeCompare(b.horario);
          }),
      );
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (r: ReposicaoDTO) => {
    setReposicoes(prev =>
      [...prev, r].sort((a, b) => {
        const cmp = a.dataAula.localeCompare(b.dataAula);
        return cmp !== 0 ? cmp : a.horario.localeCompare(b.horario);
      }),
    );
    // Remove o slot da lista de disponï¿½veis, jï¿½ que a reposiï¿½ï¿½o foi criada para ele
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

  // Agrupa reposiÃ§Ãµes por data para exibir separadores de dia
  const reposicoesPorData = reposicoes.reduce<Record<string, ReposicaoDTO[]>>((acc, r) => {
    if (!acc[r.dataAula]) acc[r.dataAula] = [];
    acc[r.dataAula].push(r);
    return acc;
  }, {});
  const datasOrdenadas = Object.keys(reposicoesPorData).sort();

  function formatDataLabel(iso: string) {
    const d = new Date(`${iso}T12:00:00`);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const hojeFmt = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;
    const amanhaFmt = `${amanha.getFullYear()}-${String(amanha.getMonth()+1).padStart(2,'0')}-${String(amanha.getDate()).padStart(2,'0')}`;
    if (iso === hojeFmt) return 'Hoje';
    if (iso === amanhaFmt) return 'AmanhÃ£';
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const [selectedData, setSelectedData] = useState<string | null>(null);
  const datasVisiveis = selectedData ? [selectedData] : datasOrdenadas;

  return (
    <div className="page-padding space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 pt-2 pb-1 border-b border-(--border)">
        <div>
          <p className="text-xs font-medium text-(--muted) uppercase tracking-widest mb-1">CalendÃ¡rio</p>
          <h1 className="text-2xl font-bold text-(--heading) leading-tight">{t('rescheduling.title')}</h1>
          {!loading && (
            <p className="text-sm text-(--muted) mt-0.5">
              {reposicoes.length} {reposicoes.length === 1 ? 'reposiÃ§Ã£o agendada' : 'reposiÃ§Ãµes agendadas'}
              {isTeacher && slots.length > 0 && ` Â· ${slots.length} horÃ¡rio${slots.length !== 1 ? 's' : ''} disponÃ­vel${slots.length !== 1 ? 'is' : ''}`}
            </p>
          )}
        </div>
        {isTeacher && slots.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSlotsPicker(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-(--accent-600) text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <CalendarPlus size={15} />
            Agendar reposiÃ§Ã£o
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-(--accent-500) border-t-transparent animate-spin" />
          <p className="text-sm text-(--muted)">Carregando reposiÃ§Ãµes...</p>
        </div>
      ) : reposicoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-(--surface-soft) flex items-center justify-center">
            {isTeacher && slots.length === 0 ? <CalendarPlus size={28} className="text-(--muted)" /> : <Clock size={28} className="text-(--muted)" />}
          </div>
          <div className="text-center">
            <p className="font-semibold text-(--heading)">
              {isTeacher && slots.length === 0 ? 'Nenhum horÃ¡rio aberto' : isTeacher ? t('rescheduling.noScheduled') : t('rescheduling.noAvailable')}
            </p>
            <p className="text-sm text-(--muted) mt-1">
              {isTeacher && slots.length === 0
                ? 'Marque horÃ¡rios de reposiÃ§Ã£o na aba de Disponibilidade.'
                : !isTeacher ? 'Aguarde o professor liberar horÃ¡rios de reposiÃ§Ã£o.' : ''}
            </p>
          </div>
        </div>
      ) : (
        /* Layout duas colunas: sidebar de datas + lista principal */
        <div className="flex gap-5 flex-col lg:flex-row items-start">

          {/* Sidebar â navegaÃ§Ã£o de datas */}
          <div className="lg:w-60 shrink-0 sticky top-4">
            <p className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-3 px-1">Datas</p>
            <div className="space-y-1">
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => setSelectedData(null)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-sm ${
                  selectedData === null
                    ? 'bg-(--surface-soft) border-(--accent-400) text-(--heading) font-semibold'
                    : 'border-transparent text-(--muted) hover:text-(--heading) hover:bg-(--surface-soft)'
                }`}
              >
                <span className="flex-1">Todas</span>
                <span className="text-xs font-bold text-(--accent-600) bg-[color-mix(in_srgb,var(--accent-500)_12%,var(--surface))] px-2 py-0.5 rounded-full">
                  {reposicoes.length}
                </span>
              </motion.button>

              {datasOrdenadas.map(data => {
                const d = new Date(`${data}T12:00:00`);
                const label = formatDataLabel(data);
                const isSelected = selectedData === data;
                return (
                  <motion.button
                    key={data}
                    whileHover={{ x: 2 }}
                    onClick={() => setSelectedData(isSelected ? null : data)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-(--surface-soft) border-(--accent-400)'
                        : 'border-transparent hover:bg-(--surface-soft)'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 ${
                      isSelected ? 'bg-(--accent-600)' : 'bg-[color-mix(in_srgb,var(--accent-500)_12%,var(--surface))]'
                    }`}>
                      <span className={`text-[9px] font-bold uppercase leading-none ${isSelected ? 'text-white/70' : 'text-(--muted)'}`}>
                        {d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className={`text-sm font-black leading-tight ${isSelected ? 'text-white' : 'text-(--accent-600)'}`}>
                        {d.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate capitalize ${isSelected ? 'text-(--heading)' : 'text-(--text)'}`}>
                        {label}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ConteÃºdo principal â lista cronolÃ³gica */}
          <div className="flex-1 min-w-0 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedData ?? 'all'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {datasVisiveis.map(data => (
                  <div key={data}>
                    {/* Separador de data */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-semibold text-(--heading) capitalize">{formatDataLabel(data)}</span>
                      <div className="flex-1 h-px bg-(--border)" />
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence>
                        {reposicoesPorData[data].map((r, i) => {
                          const isEnrolled = !!currentAluno && r.alunos.some(a => a.id === currentAluno.id);
                          const mins = minutesUntilStart(r.dataAula, r.horario);
                          const isHappening = mins >= -60 && mins <= 0;
                          return (
                            <motion.div
                              key={r.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.97 }}
                              transition={{ delay: i * 0.04 }}
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  if (!isTeacher && r.status === 'ABERTA') {
                                    if (mins < 0 && !isHappening) { toast(t('rescheduling.started'), 'warning'); }
                                    else if (mins < 30 && mins > 0) { toast(t('rescheduling.closed30').replace('{n}', String(Math.ceil(mins))), 'warning'); }
                                  }
                                  setViewModal(r);
                                }}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
                                className="block w-full text-left cursor-pointer"
                              >
                                <Card className={`p-4 app-surface cursor-pointer transition-all group ${
                                  isHappening
                                    ? 'border-emerald-400 dark:border-emerald-600 shadow-md shadow-emerald-500/10'
                                    : 'hover:border-(--accent-400) hover:shadow-sm'
                                }`}>
                                  <div className="flex items-center gap-4">
                                    {/* HorÃ¡rio */}
                                    <div className={`shrink-0 w-16 text-center px-2 py-2 rounded-xl ${isHappening ? 'bg-emerald-500/15' : 'bg-(--surface-soft)'}`}>
                                      <p className={`text-xl font-black leading-none ${isHappening ? 'text-emerald-600 dark:text-emerald-400' : 'text-(--accent-600)'}`}>
                                        {r.horario.slice(0, 5)}
                                      </p>
                                      <p className="text-[9px] font-semibold uppercase tracking-wide text-(--muted) mt-0.5">
                                        {DAY_LABELS[r.diaSemana] ?? r.diaSemana}
                                      </p>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {isHappening && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Acontecendo agora
                                          </span>
                                        )}
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status] ?? ''}`}>
                                          {STATUS_LABEL[r.status] ?? r.status}
                                        </span>
                                        {!isTeacher && isEnrolled && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 size={10} /> Inscrito
                                          </span>
                                        )}
                                      </div>
                                      {r.observacao && <p className="text-xs text-(--muted) mt-1 truncate">{r.observacao}</p>}
                                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                        <span className="text-xs text-(--muted) flex items-center gap-1">
                                          <Users size={11} />
                                          {r.alunos.length === 0 ? 'Sem inscritos' : `${r.alunos.length} inscrito${r.alunos.length !== 1 ? 's' : ''}`}
                                        </span>
                                        {isTeacher && r.alunos.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {r.alunos.map(a => (
                                              <span key={a.id} className="text-[10px] bg-[color-mix(in_srgb,var(--accent-500)_10%,var(--surface))] text-(--text) border border-(--border) px-1.5 py-0.5 rounded-full">
                                                {a.nome.split(' ')[0]}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* AÃ§Ãµes */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      {isTeacher && (
                                        <button
                                          type="button"
                                          onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                                          disabled={deletingId === r.id}
                                          className="cursor-pointer p-2 rounded-lg text-(--muted) hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                          title="Deletar reposiÃ§Ã£o"
                                        >
                                          {deletingId === r.id
                                            ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                            : <Trash2 size={15} />}
                                        </button>
                                      )}
                                      <ChevronRight size={15} className="text-(--muted) group-hover:text-(--accent-600) transition-colors" />
                                    </div>
                                  </div>
                                </Card>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-70"
        onClick={onClose}
      />
      <motion.div
        key="panel"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="fixed inset-0 z-80 flex items-center justify-center pointer-events-none px-4"
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
                      {DAY_LABELS[slot.diaSemana] ?? slot.diaSemana} &middot; {slot.horario}
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