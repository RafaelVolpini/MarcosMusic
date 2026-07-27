import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck2, Music } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Aluno } from '../../types';
import type { AuthUser } from '../../lib/auth';
import { buscarAulas } from '../../services/aulaService';
import { SaldoCreditosCard } from '../creditos/SaldoCreditosCard';

/** Plano padrão quando o aluno ainda não tem um plano definido no cadastro. */
const AULAS_POR_SEMANA_PADRAO = 3;

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface CreditosPageProps {
  currentUser: AuthUser;
  students: Aluno[];
}

export function CreditosPage({ currentUser, students }: CreditosPageProps) {
  const [aulasNoMes, setAulasNoMes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const aluno = useMemo(() => {
    const byEmail = students.find(
      (a) => a.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase(),
    );
    if (byEmail) return byEmail;
    const sessionFirstName = currentUser.firstName || currentUser.name.split(' ')[0] || '';
    return students.find(
      (a) => normalizeName(a.nome.split(' ')[0] ?? '') === normalizeName(sessionFirstName),
    ) ?? null;
  }, [students, currentUser]);

  const aulasPorSemana = aluno?.aulasPorSemanaPlano ?? AULAS_POR_SEMANA_PADRAO;
  const now = useMemo(() => new Date(), []);
  const monthStart = useMemo(() => startOfMonth(now), [now]);
  const monthEnd = useMemo(() => endOfMonth(now), [now]);
  const semanasNoMes = Math.ceil(monthEnd.getDate() / 7);
  const quotaMensal = semanasNoMes * aulasPorSemana;
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  useEffect(() => {
    // Sem aluno vinculado não há o que buscar; a UI trata esse caso à parte (ver JSX abaixo).
    if (!aluno) return;
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect -- início de uma busca assíncrona (não é setState direto)
    buscarAulas(`${fmt(monthStart)}T00:00:00`, `${fmt(monthEnd)}T23:59:59`)
      .then((dtos) => {
        const minhas = dtos.filter((d) => d.idAluno === aluno.id && !d.flagCancelada);
        setAulasNoMes(minhas.length);
      })
      .catch(() => setAulasNoMes(null))
      .finally(() => setLoading(false));
  }, [aluno, monthStart, monthEnd]);

  const usadas = aulasNoMes ?? 0;
  const restantes = Math.max(quotaMensal - usadas, 0);
  const percentual = quotaMensal > 0 ? Math.min((usadas / quotaMensal) * 100, 100) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-(--heading)">Meus Créditos</h1>
        <p className="text-sm text-(--muted) mt-0.5 capitalize">{monthLabel}</p>
      </div>

      {!aluno ? (
        <Card className="p-6 text-sm text-(--muted)">
          Não encontramos seu cadastro de aluno vinculado a esta conta. Fale com o professor.
        </Card>
      ) : (
        <>
          {/* Créditos de aula (plano semanal) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="p-6 app-surface">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-(--accent-50) rounded-xl flex items-center justify-center">
                  <Music size={20} className="text-(--accent-600)" />
                </div>
                <div>
                  <h3 className="font-semibold text-(--heading)">Créditos de Aula</h3>
                  <p className="text-xs text-(--muted)">Plano: até {aulasPorSemana} aulas por semana</p>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-(--muted)">Carregando...</p>
              ) : (
                <>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-bold text-(--heading)">
                      {usadas}
                      <span className="text-sm font-medium text-(--muted)"> / {quotaMensal} aulas</span>
                    </span>
                    <span className="text-xs font-semibold text-(--accent-600)">
                      {restantes} restante{restantes === 1 ? '' : 's'} este mês
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-(--surface-soft) overflow-hidden">
                    <div
                      className="h-full bg-(--accent-600) transition-all duration-300"
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-(--muted) mt-3 flex items-center gap-1.5">
                    <CalendarCheck2 size={12} className="shrink-0" />
                    Cálculo baseado em {semanasNoMes} semanas neste mês × {aulasPorSemana} aulas/semana.
                  </p>
                </>
              )}
            </Card>
          </motion.div>

          {/* Créditos de reposição */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }}>
            <SaldoCreditosCard alunoId={aluno.id} />
          </motion.div>
        </>
      )}
    </div>
  );
}
