import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, Check, Clock3, GraduationCap, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import type { Lesson, WeeklyAvailability, DayKey } from '../../types';
import { toLesson } from '../../adapters/aulaAdapter';
import { Button } from '../ui/Button';
import { cn } from '../../utils';
import { getDayKeyFromISODate, timeToMinutes } from '../../utils';
import { salvarDisponibilidade, buscarAulas, buscarDisponibilidade, type DisponibilidadeResponseDTO } from '../../services/aulaService';

const WEEK_DAYS = [
  { key: 'seg' as DayKey, label: 'Segunda' },
  { key: 'ter' as DayKey, label: 'Terça' },
  { key: 'qua' as DayKey, label: 'Quarta' },
  { key: 'qui' as DayKey, label: 'Quinta' },
  { key: 'sex' as DayKey, label: 'Sexta' },
  { key: 'sab' as DayKey, label: 'Sábado' },
  { key: 'dom' as DayKey, label: 'Domingo' },
] as const;

// 07:00 → 23:00
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

/** Retorna as datas ISO de início e fim da semana atual (seg–dom). */
function getThisWeek() {
  const today = new Date();
  const dow = today.getDay(); // 0=Dom
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { weekStart: fmt(monday), weekEnd: fmt(sunday) };
}

interface RoomsPageProps {
  availability: WeeklyAvailability;
  availabilityReposicao: WeeklyAvailability;
  lessons: Lesson[];
  onChangeAvailability: (next: WeeklyAvailability) => void;
  onChangeAvailabilityReposicao: (next: WeeklyAvailability) => void;
}

export function RoomsPage({ availability, availabilityReposicao, lessons, onChangeAvailability, onChangeAvailabilityReposicao }: RoomsPageProps) {
  const [warning, setWarning] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadingDb, setLoadingDb] = useState(true);

  // ── Converte DTOs do banco em WeeklyAvailability ────────────────────────
  const applyDTOs = useCallback((dtos: DisponibilidadeResponseDTO[]) => {
    const empty = (): WeeklyAvailability => ({ seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] });
    const avail = empty();
    const repos = empty();

    for (const dto of dtos) {
      const day = dto.diaSemana as DayKey;
      if (!avail[day]) continue; // dia desconhecido — ignora
      // aulaMarcada também entra em avail para evitar badge CONFLITO no calendário
      if (dto.disponivel || dto.aulaMarcada) {
        avail[day] = [...avail[day], dto.horario].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
      }
      if (dto.reposicao) {
        repos[day] = [...repos[day], dto.horario].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
      }
    }

    onChangeAvailability(avail);
    onChangeAvailabilityReposicao(repos);
  }, [onChangeAvailability, onChangeAvailabilityReposicao]);

  // ── Carrega tudo em sequência: aulas desta semana → disponibilidade ───────
  const [apiLessons, setApiLessons] = useState<Lesson[]>([]);

  const loadAll = useCallback(async () => {
    setLoadingDb(true);
    const { weekStart, weekEnd } = getThisWeek();
    try {
      // 1. Aulas desta semana primeiro (para os badges ficarem prontos)
      const lessonDtos = await buscarAulas(`${weekStart}T00:00:00`, `${weekEnd}T23:59:59`);
      setApiLessons(lessonDtos.map(toLesson));
      // 2. Disponibilidade (configuração semanal do professor)
      const dtos = await buscarDisponibilidade();
      applyDTOs(dtos);
    } catch {
      // fallback: mantém estado atual
    } finally {
      setLoadingDb(false);
    }
  }, [applyDTOs]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Mescla apiLessons (semana atual) com lessons prop (30 dias), sem duplicatas
  const effectiveLessons = useMemo(() => {
    const byId = new Map<string, Lesson>();
    for (const l of lessons) byId.set(l.id, l);
    for (const l of apiLessons) byId.set(l.id, l); // apiLessons tem precedência (mais atualizado)
    return [...byId.values()];
  }, [lessons, apiLessons]);

  const totalSlots = useMemo(
    () => Object.values(availability).reduce((sum, slots) => sum + slots.length, 0),
    [availability],
  );

  const scheduledLessonCountBySlot = useMemo(() => {
    const map = new Map<string, number>();
    const today = new Date().toISOString().split('T')[0];
    effectiveLessons
      .filter(l => ['scheduled', 'rescheduled'].includes(l.status) && l.date >= today)
      .forEach((lesson) => {
        const day = getDayKeyFromISODate(lesson.date);
        const hourSlot = `${lesson.startTime.slice(0, 2)}:00`;
        map.set(`${day}-${hourSlot}`, (map.get(`${day}-${hourSlot}`) ?? 0) + 1);
      });
    return map;
  }, [effectiveLessons]);

  const totalReposicaoSlots = useMemo(
    () => Object.values(availabilityReposicao).reduce((sum, slots) => sum + slots.length, 0),
    [availabilityReposicao],
  );

  // Ciclo 3 estados: indisponível → disponível → reposição → indisponível
  const toggleSlot = (day: DayKey, time: string) => {
    const isAvail = availability[day].includes(time);
    const isReposicao = availabilityReposicao[day].includes(time);
    const hasScheduled = (scheduledLessonCountBySlot.get(`${day}-${time}`) ?? 0) > 0;

    setWarning('');
    setSaveStatus('idle');

    if (!isAvail && !isReposicao) {
      // indisponível → disponível
      onChangeAvailability({ ...availability, [day]: [...availability[day], time].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)) });
    } else if (isAvail) {
      // disponível → reposição
      onChangeAvailability({ ...availability, [day]: availability[day].filter(s => s !== time) });
      onChangeAvailabilityReposicao({ ...availabilityReposicao, [day]: [...availabilityReposicao[day], time].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)) });
    } else {
      // reposição → indisponível
      if (hasScheduled) {
        setWarning('Esse horário possui aula agendada. Reagende ou cancele antes de tornar indisponível.');
        return;
      }
      onChangeAvailabilityReposicao({ ...availabilityReposicao, [day]: availabilityReposicao[day].filter(s => s !== time) });
    }
  };

  const clearAll = () => {
    // Preserva slots com aulas em sua lista original (availability ou reposicao)
    const emptyAvail: WeeklyAvailability = { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };
    const emptyRepos: WeeklyAvailability = { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };
    WEEK_DAYS.forEach(({ key }) => {
      TIME_SLOTS.forEach((time) => {
        if ((scheduledLessonCountBySlot.get(`${key}-${time}`) ?? 0) > 0) {
          if (availabilityReposicao[key].includes(time)) {
            emptyRepos[key] = [...emptyRepos[key], time];
          } else {
            emptyAvail[key] = [...emptyAvail[key], time];
          }
        }
      });
    });
    setWarning('Horários com aulas agendadas foram mantidos.');
    setSaveStatus('idle');
    onChangeAvailabilityReposicao(emptyRepos);
    onChangeAvailability(emptyAvail);
  };

  const applyBusinessHours = () => {
    setWarning('');
    setSaveStatus('idle');
    onChangeAvailability({
      seg: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      ter: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      qua: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      qui: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      sex: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      sab: ['09:00', '10:00', '11:00'],
      dom: [],
    });
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const dtos = await salvarDisponibilidade(availability, availabilityReposicao);
      applyDTOs(dtos); // atualiza a view com o retorno confirmado do banco
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="p-6">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-[var(--heading)]">Disponibilidade Semanal</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Clique nos horários para marcar ou remover disponibilidade para aulas
          </p>
        </div>
      </div>

      {/* ── Warning ────────────────────────────────── */}
      {warning && (
        <div className="mb-5 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm flex items-center gap-2 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400">
          <AlertTriangle size={15} className="shrink-0" />
          {warning}
        </div>
      )}

      {/* ── Legend + Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Legenda — lado esquerdo */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
            />
            Disponível
          </span>
          <span className="flex items-start gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-400 border-2 border-amber-500">
              <GraduationCap size={10} className="text-amber-900" />
            </span>
            Com aula agendada (protegido)
          </span>
          <span className="flex items-start gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-violet-500 border-2 border-violet-600">
              <RefreshCw size={9} className="text-white" />
            </span>
            Reposição
          </span>
          <span className="flex items-start gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-[var(--surface-soft)] border border-[var(--border)]" />
            Indisponível
          </span>
        </div>

        {/* Ações — lado direito */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={loadAll} disabled={loadingDb} title="Recarregar do banco">
            <RefreshCw size={14} className={loadingDb ? 'animate-spin' : ''} />
          </Button>
          <Button variant="secondary" size="sm" onClick={applyBusinessHours}>
            <Plus size={14} /> Horário comercial
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 size={14} /> Limpar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saveStatus === 'saving' || loadingDb}
          >
            <Save size={14} />
            {saveStatus === 'saving' ? 'Salvando…' : saveStatus === 'saved' ? '✓ Salvo!' : saveStatus === 'error' ? 'Erro ao salvar' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* ── Day cards ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {WEEK_DAYS.map(({ key, label }, idx) => {
          const daySlots = availability[key];
          const dayLessonsCount = TIME_SLOTS.reduce(
            (sum, t) => sum + (scheduledLessonCountBySlot.get(`${key}-${t}`) ?? 0),
            0,
          );

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.22 }}
              className="app-surface rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Day header */}
              <div
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[var(--heading)]">{label}</span>
                  {dayLessonsCount > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50">
                      {dayLessonsCount} aula{dayLessonsCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full border',
                    daySlots.length > 0
                      ? 'text-[var(--accent-700)]'
                      : 'text-[var(--muted)]',
                  )}
                  style={{
                    borderColor: daySlots.length > 0 ? 'var(--accent-100)' : 'var(--border)',
                    backgroundColor: daySlots.length > 0 ? 'var(--accent-icon-bg)' : 'transparent',
                  }}
                >
                  {daySlots.length}h
                </span>
              </div>

              {/* Time chips */}
              <div className="p-3 grid grid-cols-3 gap-1.5">
                {TIME_SLOTS.map((time) => {
                  const isActive = daySlots.includes(time);
                  const isReposicao = availabilityReposicao[key].includes(time);
                  const lessonCount = scheduledLessonCountBySlot.get(`${key}-${time}`) ?? 0;
                  const hasLesson = lessonCount > 0;

                  return (
                    <button
                      key={time}
                      onClick={() => toggleSlot(key, time)}
                      title={
                        hasLesson
                          ? `${time} — ${lessonCount} aula(s) agendada(s) — não pode ser removido`
                          : isActive
                          ? `${time} — disponível (clique para reposição)`
                          : isReposicao
                          ? `${time} — reposição (clique para bloquear)`
                          : `${time} — indisponível (clique para liberar)`
                      }
                      className={cn(
                        'relative flex flex-col items-center justify-center rounded-lg text-xs font-bold transition-all duration-150',
                        'h-11 gap-0',
                        hasLesson
                          ? 'bg-amber-400 text-amber-900 border-2 border-amber-500 shadow-sm'
                          : isActive
                          ? 'text-white border-2 border-transparent shadow-sm hover:brightness-110'
                          : isReposicao
                          ? 'bg-violet-500 text-white border-2 border-violet-600 shadow-sm hover:brightness-110'
                          : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--accent-300)] hover:text-[var(--text)]',
                      )}
                      style={
                        isActive && !hasLesson
                          ? { background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }
                          : undefined
                      }
                    >
                      {hasLesson ? (
                        <>
                          <GraduationCap size={11} />
                          <span>{time}</span>
                        </>
                      ) : isActive ? (
                        <>
                          <Check size={10} />
                          <span>{time}</span>
                        </>
                      ) : isReposicao ? (
                        <>
                          <RefreshCw size={10} />
                          <span>{time}</span>
                        </>
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

      {/* ── Footer ─────────────────────────────────── */}
      <div
        className="mt-6 px-5 py-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-soft)' }}
      >
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <CalendarClock size={15} className="opacity-60 shrink-0" />
          Horários indisponíveis ficam bloqueados no calendário de agendamento.
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 font-semibold text-[var(--heading)]">
            <Clock3 size={14} className="text-[var(--accent-600)]" />
            {totalSlots} disponíveis
          </span>
          {totalReposicaoSlots > 0 && (
            <span className="flex items-center gap-1.5 font-semibold text-violet-600">
              <RefreshCw size={13} />
              {totalReposicaoSlots} reposição
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


