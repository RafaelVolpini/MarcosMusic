import { useEffect, useState } from 'react';
import { Gift, AlertCircle, Clock } from 'lucide-react';
import { getSaldoCreditos, type SaldoCreditosDTO } from '../../services/creditoReposicaoService';

interface SaldoCreditosCardProps {
  alunoId: string;
  isTeacher?: boolean;
}

export function SaldoCreditosCard({ alunoId, isTeacher = false }: SaldoCreditosCardProps) {
  const [saldo, setSaldo] = useState<SaldoCreditosDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarSaldo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSaldoCreditos(alunoId);
        setSaldo(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar créditos';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    carregarSaldo();
  }, [alunoId]);

  if (loading) {
    return (
      <div className="app-surface rounded-2xl p-6 border border-(--border)">
        <div className="flex items-center gap-3 mb-4">
          <Gift size={20} className="text-(--accent-600)" />
          <h3 className="font-semibold text-(--heading)">Carregando créditos...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-surface rounded-2xl p-6 border border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-600" />
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!saldo) return null;

  const percentualUsados = saldo.totalDisponivel + saldo.totalUsado > 0
    ? (saldo.totalUsado / (saldo.totalDisponivel + saldo.totalUsado)) * 100
    : 0;

  return (
    <div className="app-surface rounded-2xl p-6 border border-(--border)">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-(--accent-50) rounded-xl flex items-center justify-center">
          <Gift size={20} className="text-(--accent-600)" />
        </div>
        <div>
          <h3 className="font-semibold text-(--heading)">Créditos de Reposição</h3>
          {!isTeacher && (
            <p className="text-xs text-(--muted)">Ganhe créditos cancelando aulas com antecedência</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Disponível */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-3">
          <div className="text-xs text-(--muted) mb-1">Disponível</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {saldo.totalDisponivel}
          </div>
        </div>

        {/* Usado */}
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3">
          <div className="text-xs text-(--muted) mb-1">Utilizado</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {saldo.totalUsado}
          </div>
        </div>

        {/* Expirado */}
        <div className="rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 p-3">
          <div className="text-xs text-(--muted) mb-1">Expirado</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {saldo.totalExpirado}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {saldo.totalDisponivel + saldo.totalUsado > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-(--muted)">Taxa de utilização</span>
            <span className="text-xs font-semibold text-(--heading)">
              {percentualUsados.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-(--surface-soft) overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${percentualUsados}%` }}
            />
          </div>
        </div>
      )}

      {/* Proxima Expiração */}
      {saldo.totalDisponivel > 0 && saldo.diasAteProximaExpiracao >= 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-(--surface-soft) border border-(--border)">
          <Clock size={16} className="text-(--muted)" />
          <div>
            <div className="text-xs font-medium text-(--heading)">
              Próxima expiração em {saldo.diasAteProximaExpiracao} dia(s)
            </div>
            <div className="text-[11px] text-(--muted)">
              Use seus créditos antes que expirem
            </div>
          </div>
        </div>
      )}

      {/* Se não há créditos */}
      {saldo.totalDisponivel === 0 && saldo.totalUsado === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium">Você não tem créditos</p>
              <p className="text-xs opacity-80 mt-0.5">
                Cancele aulas com até 23:00 do dia anterior para ganhar créditos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      {saldo.historicoCompleto.length > 0 && (
        <details className="mt-6 pt-6 border-t border-(--border)">
          <summary className="cursor-pointer text-sm font-medium text-(--heading) hover:text-(--accent-600) transition-colors">
            Ver histórico completo ({saldo.historicoCompleto.length})
          </summary>
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {saldo.historicoCompleto.map((credito) => (
              <div
                key={credito.id}
                className="text-xs p-2 rounded border border-(--border) flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-(--text)">
                    {credito.status === 'VALIDO' && '✓ Válido'}
                    {credito.status === 'USADO' && '✓✓ Utilizado'}
                    {credito.status === 'EXPIRADO' && '✗ Expirado'}
                  </div>
                  <div className="text-(--muted) text-[10px]">
                    {credito.status === 'VALIDO' && `Expira em ${credito.diasAteExpiracao} dias`}
                    {credito.observacao && ` • ${credito.observacao}`}
                  </div>
                </div>
                <div className="text-[10px] text-(--muted)">
                  {new Date(credito.dataCriacao).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
