import { useEffect, useState } from 'react';
import { Gift, Calendar, Check, AlertCircle, TrendingDown } from 'lucide-react';

interface CreditoReposicao {
  id: number;
  dataCriacao: string;
  dataExpiracao: string;
  status: string;
}

interface SaldoCreditos {
  totalDisponivel: number;
  totalUsado: number;
  totalExpirado: number;
  diasAteProximaExpiracao: number;
  creditosAtivos: CreditoReposicao[];
  historicoCompleto: CreditoReposicao[];
}

const statusColor = {
  VALIDO: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600 dark:text-green-400' },
  EXPIRADO: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', icon: 'text-red-600 dark:text-red-400' },
  USADO: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600 dark:text-blue-400' },
};

const statusLabel = {
  VALIDO: 'Disponível',
  EXPIRADO: 'Expirado',
  USADO: 'Utilizado',
};

export function CreditsPage() {
  const [saldo, setSaldo] = useState<SaldoCreditos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<'ativos' | 'historico'>('ativos');

  useEffect(() => {
    fetchCreditos();
  }, []);

  const fetchCreditos = async () => {
    try {
      const res = await fetch('/credito-reposicao/meus-creditos', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Erro ao buscar créditos');
      const data = await res.json();
      setSaldo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-padding flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--accent-500) border-t-transparent" />
      </div>
    );
  }

  if (!saldo) {
    return (
      <div className="page-padding py-10">
        <div className="bg-(--surface) border border-(--border) rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-3 text-(--muted)" size={40} />
          <p className="text-(--muted)">{error || 'Nenhum crédito disponível'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-padding space-y-6 pb-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-(--heading) flex items-center gap-2">
          <Gift className="text-(--accent-600)" size={32} />
          Meus Créditos
        </h1>
        <p className="text-(--muted) text-sm">Acompanhe seus créditos de reposição disponíveis e histórico</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Disponível */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Disponíveis</span>
            <Check size={20} />
          </div>
          <p className="text-3xl font-bold">{saldo.totalDisponivel}</p>
          <p className="text-xs opacity-75 mt-1">
            {saldo.diasAteProximaExpiracao >= 0
              ? `Próxima expira em ${saldo.diasAteProximaExpiracao}d`
              : 'Nenhum ativo'}
          </p>
        </div>

        {/* Usados */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Utilizados</span>
            <TrendingDown size={20} />
          </div>
          <p className="text-3xl font-bold">{saldo.totalUsado}</p>
          <p className="text-xs opacity-75 mt-1">Desde o início</p>
        </div>

        {/* Expirados */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Expirados</span>
            <AlertCircle size={20} />
          </div>
          <p className="text-3xl font-bold">{saldo.totalExpirado}</p>
          <p className="text-xs opacity-75 mt-1">Vencidos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-(--border) flex gap-4">
        <button
          onClick={() => setExpandedTab('ativos')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            expandedTab === 'ativos'
              ? 'text-(--accent-600) border-b-2 border-(--accent-600)'
              : 'text-(--muted) hover:text-(--text)'
          }`}
        >
          Créditos Ativos ({saldo.creditosAtivos.length})
        </button>
        <button
          onClick={() => setExpandedTab('historico')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            expandedTab === 'historico'
              ? 'text-(--accent-600) border-b-2 border-(--accent-600)'
              : 'text-(--muted) hover:text-(--text)'
          }`}
        >
          Histórico Completo ({saldo.historicoCompleto.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {expandedTab === 'ativos' && (
          <>
            {saldo.creditosAtivos.length === 0 ? (
              <div className="bg-(--surface) border border-(--border) rounded-lg p-8 text-center">
                <Gift className="mx-auto mb-3 text-(--muted) opacity-50" size={40} />
                <p className="text-(--muted) text-sm">Você não tem créditos disponíveis no momento</p>
              </div>
            ) : (
              saldo.creditosAtivos.map((credito) => (
                <CreditoCard key={credito.id} credito={credito} />
              ))
            )}
          </>
        )}

        {expandedTab === 'historico' && (
          <>
            {saldo.historicoCompleto.length === 0 ? (
              <div className="bg-(--surface) border border-(--border) rounded-lg p-8 text-center">
                <Calendar className="mx-auto mb-3 text-(--muted) opacity-50" size={40} />
                <p className="text-(--muted) text-sm">Sem histórico de créditos</p>
              </div>
            ) : (
              saldo.historicoCompleto.map((credito) => (
                <CreditoCard key={credito.id} credito={credito} />
              ))
            )}
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-(--surface) border border-(--border) rounded-xl p-4 space-y-2">
        <p className="text-xs font-medium text-(--text)">💡 Como funcionam os créditos?</p>
        <ul className="text-xs text-(--muted) space-y-1 ml-2">
          <li>• Você ganha 1 crédito quando cancela uma aula até 23h antes da aula</li>
          <li>• Cada crédito pode ser usado para agendar uma reposição (substituição de aula)</li>
          <li>• Os créditos expiram 12 meses após a data de criação</li>
          <li>• Você pode visualizar seu histórico de créditos nesta página</li>
        </ul>
      </div>
    </div>
  );
}

function CreditoCard({ credito }: { credito: CreditoReposicao }) {
  const status = credito.status as keyof typeof statusColor;
  const colors = statusColor[status] || statusColor.VALIDO;
  const label = statusLabel[status] || credito.status;

  const dataCriacao = new Date(credito.dataCriacao);
  const dataExpiracao = new Date(credito.dataExpiracao);
  const hoje = new Date();
  const diasAteExpiracao = Math.ceil((dataExpiracao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${colors.icon}`} />
            <span className="text-sm font-medium text-(--text)">{label}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-(--muted)">
            <div>
              <p className="opacity-75">Criado em</p>
              <p className="font-medium text-(--text)">{dataCriacao.toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="opacity-75">Expira em</p>
              <p className="font-medium text-(--text)">{dataExpiracao.toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
        {credito.status === 'VALIDO' && diasAteExpiracao < 30 && (
          <div className="text-right">
            <p className="text-xs font-bold text-(--accent-600)">{diasAteExpiracao}d</p>
            <p className="text-xs text-(--muted) opacity-75">restantes</p>
          </div>
        )}
      </div>
    </div>
  );
}
