import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, Check, Clock3, RefreshCw, Save, Trash2 } from 'lucide-react';
import type { WeeklyAvailability, DayKey } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../utils';
import { timeToMinutes } from '../../utils';
import { salvarDisponibilidade, buscarDisponibilidade, type DisponibilidadeResponseDTO } from '../../services/aulaService';
import { useToast } from '../ui/Toast';
import { useLanguage } from '../../context/LanguageContext';

const WEEK_DAYS = [
  { key: 'seg' as DayKey, labelKey: 'calendar.fullDays.mon' },
  { key: 'ter' as DayKey, labelKey: 'calendar.fullDays.tue' },
  { key: 'qua' as DayKey, labelKey: 'calendar.fullDays.wed' },
  { key: 'qui' as DayKey, labelKey: 'calendar.fullDays.thu' },
  { key: 'sex' as DayKey, labelKey: 'calendar.fullDays.fri' },
  { key: 'sab' as DayKey, labelKey: 'calendar.fullDays.sat' },
  { key: 'dom' as DayKey, labelKey: 'calendar.fullDays.sun' },
] as const;

const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

interface DisponibilidadePageProps {
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  onChangeAvailability: (next: WeeklyAvailability) => void;
  onChangeAvailabilityReposicao: (next: WeeklyAvailability) => void;
}

export function DisponibilidadePage({
  availability,
  availabilityReposicao,
  onChangeAvailability,
  onChangeAvailabilityReposicao,
}: DisponibilidadePageProps) {
  const toast = useToast();
  const { t } = useLanguage();
  const [warning, setWarning] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadingDb, setLoadingDb] = useState(true);

  const applyDTOs = useCallback((dtos: DisponibilidadeResponseDTO[]) => {
    const empty = (): WeeklyAvailability => ({ seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] });
    const avail = empty();
    const repos = empty();

    for (const dto of dtos) {
      const day = dto.diaSemana as DayKey;
      if (!avail[day]) continue;
      if (dto.disponivel) {
        avail[day] = [...avail[day], dto.horario].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
      }
      if (dto.reposicao) {
        repos[day] = [...repos[day], dto.horario].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
      }
    }

    onChangeAvailability(avail);
    onChangeAvailabilityReposicao(repos);
  }, [onChangeAvailability, onChangeAvailabilityReposicao]);

  const loadAll = useCallback(async () => {
    setLoadingDb(true);
    try {
      const dtos = await buscarDisponibilidade();
      applyDTOs(dtos);
    } catch {
      // fallback: mantém estado atual
    } finally {
      setLoadingDb(false);
    }
  }, [applyDTOs]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const totalSlots = useMemo(
    () => Object.values(availability).reduce((sum, slots) => sum + slots.length, 0),
    [availability],
  );

  const totalReposicaoSlots = useMemo(
    () => Object.values(availabilityReposicao).reduce((sum, slots) => sum + slots.length, 0),
    [availabilityReposicao],
  );

  // Ciclo 3 estados: indisponível ? disponível ? reposição ? indisponível
  const toggleSlot = (day: DayKey, time: string) => {
    const isAvail = availability[day].includes(time);
    const isReposicao = availabilityReposicao[day].includes(time);

    setWarning('');
    setSaveStatus('idle');

    if (!isAvail && !isReposicao) {
      // indisponível ? disponível
      onChangeAvailability({ ...availability, [day]: [...availability[day], time].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)) });
    } else if (isAvail) {
      // disponível ? reposição
      onChangeAvailability({ ...availability, [day]: availability[day].filter(s => s !== time) });
      onChangeAvailabilityReposicao({ ...availabilityReposicao, [day]: [...availabilityReposicao[day], time].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)) });
    } else {
      // reposição ? indisponível
      onChangeAvailabilityReposicao({ ...availabilityReposicao, [day]: availabilityReposicao[day].filter(s => s !== time) });
    }
  };

  const clearAll = () => {
    setWarning('');
    setSaveStatus('idle');
    onChangeAvailability({ seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] });
    onChangeAvailabilityReposicao({ seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] });
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const dtos = await salvarDisponibilidade(availability, availabilityReposicao);
      applyDTOs(dtos);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
      toast(t('availability.saved'), 'success');
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      toast(t('availability.saveError'), 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-(--heading)">{t('availability.title')}</h1>
          <p className="text-sm text-(--muted) mt-0.5">
            {t('availability.hint')}
          </p>
        </div>
      </div>

      {warning && (
        <div className="mb-5 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm flex items-center gap-2 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400">
          <AlertTriangle size={15} className="shrink-0" />
          {warning}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex flex-wrap items-center gap-4 text-xs text-(--muted)">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
            />
            Disponível
          </span>
          <span className="flex items-start gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-violet-500 border-2 border-violet-600">
              <RefreshCw size={9} className="text-white" />
            </span>
            {t('availability.reposicao')}
          </span>
          <span className="flex items-start gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-(--surface-soft) border border-(--border)" />
            {t('availability.unavailable')}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={loadAll} disabled={loadingDb} title={t('availability.reload')}>
            <RefreshCw size={14} className={loadingDb ? 'animate-spin' : ''} />
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 size={14} /> {t('availability.clear')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saveStatus === 'saving' || loadingDb}
          >
            <Save size={14} />
            {saveStatus === 'saving' ? t('availability.saving') : saveStatus === 'saved' ? t('availability.savedLabel') : saveStatus === 'error' ? t('availability.error') : t('availability.save')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {WEEK_DAYS.map(({ key, labelKey }, idx) => {
          const daySlots = availability[key];
          const label = t(labelKey);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.22 }}
              className="app-surface rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
              >
                <span className="text-sm font-black text-(--heading)">{label}</span>
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full border',
                    daySlots.length > 0 ? 'text-(--accent-700)' : 'text-(--muted)',
                  )}
                  style={{
                    borderColor: daySlots.length > 0 ? 'var(--accent-100)' : 'var(--border)',
                    backgroundColor: daySlots.length > 0 ? 'var(--accent-icon-bg)' : 'transparent',
                  }}
                >
                  {daySlots.length}h
                </span>
              </div>

              <div className="p-3 grid grid-cols-3 gap-1.5">
                {TIME_SLOTS.map((time) => {
                  const isActive = daySlots.includes(time);
                  const isReposicao = availabilityReposicao[key].includes(time);

                  return (
                    <button
                      key={time}
                      onClick={() => toggleSlot(key, time)}
                      title={
                        isActive
                          ? `${time} ${t('availability.available')} (${t('availability.clickReposicao')})`
                          : isReposicao
                          ? `${time} ${t('availability.reposicao')} (${t('availability.clickBlock')})`
                          : `${time} ${t('availability.unavailable')} (${t('availability.clickRelease')})`
                      }
                      className={cn(
                        'relative flex flex-col items-center justify-center rounded-lg text-xs font-bold transition-all duration-150 h-11 gap-0',
                        isActive
                          ? 'text-white border-2 border-transparent shadow-sm hover:brightness-110'
                          : isReposicao
                          ? 'bg-violet-500 text-white border-2 border-violet-600 shadow-sm hover:brightness-110'
                          : 'bg-(--surface) text-(--muted) border border-(--border) hover:border-(--accent-300) hover:text-(--text)',
                      )}
                      style={
                        isActive
                          ? { background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }
                          : undefined
                      }
                    >
                      {isActive ? (
                        <><Check size={10} /><span>{time}</span></>
                      ) : isReposicao ? (
                        <><RefreshCw size={10} /><span>{time}</span></>
                      ) : (
                        <span>{time}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div
        className="mt-6 px-5 py-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="flex items-center gap-2 text-(--muted)">
          <CalendarClock size={15} className="opacity-60 shrink-0" />
          {t('availability.info')}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 font-semibold text-(--heading)">
            <Clock3 size={14} className="text-(--accent-600)" />
            {totalSlots} {t('availability.available')}
          </span>
          {totalReposicaoSlots > 0 && (
            <span className="flex items-center gap-1.5 font-semibold text-violet-600">
              <RefreshCw size={13} />
              {totalReposicaoSlots} {t('availability.reposicao')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
