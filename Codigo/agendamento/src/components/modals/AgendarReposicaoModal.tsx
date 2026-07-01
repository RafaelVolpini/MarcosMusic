import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Aluno } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { criarReposicao, type ReposicaoDTO } from '../../services/reposicaoService';
import type { DisponibilidadeResponseDTO } from '../../services/aulaService';
import { DAY_LABELS } from '../../utils/reposicaoHelpers';
import { useLanguage } from '../../context/LanguageContext';

export interface AgendarReposicaoModalProps {
  slot: DisponibilidadeResponseDTO;
  defaultDate: string;
  alunos: Aluno[];
  onClose: () => void;
  onCreated: (r: ReposicaoDTO) => void;
}

export function AgendarReposicaoModal({ slot, defaultDate, alunos, onClose, onCreated }: AgendarReposicaoModalProps) {
  const [dataAula, setDataAula] = useState(defaultDate);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await criarReposicao({
        disponibilidadeId: slot.id,
        dataAula,
        alunoIds: Array.from(selected),
        observacao: observacao.trim() || undefined,
      });
      onCreated(result);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('modals.reposicao.createError'));
    } finally {
      setSaving(false);
    }
  };

  const activeAlunos = alunos.filter(a => a.ativo);

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md bg-(--surface) rounded-2xl shadow-2xl border border-(--border) overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <div className="flex items-center gap-2">
            <CalendarPlus size={18} className="text-(--accent-600)" />
            <span className="font-semibold text-(--heading) text-sm">
              {DAY_LABELS[slot.diaSemana] ?? slot.diaSemana} • {slot.horario}
            </span>
          </div>
          <button onClick={onClose} className="text-(--muted) hover:text-(--text) transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Data */}
          <div>
            <label className="block text-xs font-medium text-(--muted) mb-1">{t('modals.reposicao.dateLabel')}</label>
            <input
              type="date"
              value={dataAula}
              onChange={e => setDataAula(e.target.value)}
              className="w-full text-sm border border-(--input-border) rounded-xl px-3 py-2 bg-(--input-bg) text-(--text) focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-500)_30%,transparent)]"
            />
          </div>

          {/* Alunos */}
          <div>
            <label className="block text-xs font-medium text-(--muted) mb-2">
              {t('modals.reposicao.studentsLabel')}{' '}
              <span className="font-normal">({t('modals.reposicao.selectedCount').replace('{n}', String(selected.size))})</span>
            </label>
            <div className="max-h-52 overflow-y-auto space-y-1 rounded-xl border border-(--border) p-2">
              {activeAlunos.map(aluno => {
                const checked = selected.has(aluno.id);
                return (
                  <button
                    key={aluno.id}
                    type="button"
                    onClick={() => toggle(aluno.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      checked
                        ? 'bg-[color-mix(in_srgb,var(--accent-500)_12%,var(--surface))] border border-[color-mix(in_srgb,var(--accent-500)_30%,transparent)]'
                        : 'hover:bg-(--hover-bg)'
                    }`}
                  >
                    <Avatar name={aluno.nome} size="sm" />
                    <span className="flex-1 text-sm text-(--text)">{aluno.nome}</span>
                    {checked && <CheckCircle2 size={15} className="text-(--accent-600) shrink-0" />}
                  </button>
                );
              })}
              {activeAlunos.length === 0 && (
                <p className="text-xs text-(--muted) text-center py-4">{t('modals.reposicao.loadingStudents')}</p>
              )}
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="block text-xs font-medium text-(--muted) mb-1">{t('modals.reposicao.obsLabel')}</label>
            <input
              type="text"
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder={t('modals.reposicao.obsPH')}
              className="w-full text-sm border border-(--input-border) rounded-xl px-3 py-2 bg-(--input-bg) text-(--text) placeholder:text-(--muted) focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-500)_30%,transparent)]"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-lg px-3 py-2"
              >
                <AlertCircle size={13} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">{t('modals.reposicao.cancel')}</Button>
            <Button size="sm" onClick={handleSubmit} disabled={saving} className="flex-1">
              {saving ? t('modals.reposicao.saving') : t('modals.reposicao.createBtn')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
