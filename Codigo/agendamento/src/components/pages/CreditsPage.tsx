import { useEffect, useState } from 'react';
import { Gift, Calendar, Check, AlertCircle, TrendingDown, Clock } from 'lucide-react';

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
  VALIDO:   { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500' },
  EXPIRADO: { bg: 'bg-red-50 dark:bg-red-950',     border: 'border-red-200 dark:border-red-800',     dot: 'bg-red-500'   },
  USADO:    { bg: 'bg-blue-50 dark:bg-blue-950',   border: 'border-blue-200 dark:border-blue-800',   dot: 'bg-blue-500'  },
};

const statusLabel = { VALIDO: 'Disponível', EXPIRADO: 'Expirado', USADO: 'Utilizado' };

function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function CreditsPage() {
  const [saldo, setSaldo] = useState<SaldoCreditos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'mes' | 'historico'>('mes');

  useEffect(() => { fetchCreditos(); }, []);

  const fetchCreditos = async () => {
    try {
      const res = await fetch('/credito-reposicao/meus-creditos', { credentials: 'include' });
      if (!res.ok) throw new Error('Erro ao buscar créditos');
      setSaldo(await res.json());
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

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Créditos do mês atual
  const creditosMes = saldo.historicoCompleto.filter(c => {
    const d = new Date(c.dataCriacao);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });

  // Agrupa por semana
  const porSemana = new Map<number, { label: string; creditos: CreditoReposicao[] }>();
  creditosMes.forEach(c => {
    const d = new Date(c.dataCriacao);
    const monday = getMondayOfWeek(d);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const semana = getWeekOfMonth(d);
    if (!porSemana.has(semana)) {
      const fmt = (dt: Date) => dt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      porSemana.set(semana, { label: `Semana ${semana} — ${fmt(monday)} a ${fmt(sunday)}`, creditos: [] });
    }
    porSemana.get(semana)!.creditos.push(c);
  });

  const semanasOrdenadas = Array.from(porSemana.entries()).sort((a, b) => a[0] - b[0]);

  const nomeMes = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="page-padding space-y-6 pb-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-(--heading) flex items-center gap-2">
          <Gift className="text-(--accent-600)" size={26} />
          Meus Créditos
        </h1>
        <p className="text-(--muted) text-sm">Créditos de reposição ganhos por cancelamentos dentro do prazo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium opacity-90">Disponíveis</span>
            <Check size={16} />
          </div>
          <p className="text-3xl font-bold">{saldo.totalDisponivel}</p>
          <p className="text-xs opacity-75 mt-1">
            {saldo.diasAteProximaExpiracao >= 0
              ? `Próx. expira em ${saldo.diasAteProximaExpiracao}d`
              : 'Nenhum ativo'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium opacity-90">Utilizados</span>
            <TrendingDown size={16} />
          </div>
          <p className="text-3xl font-bold">{saldo.totalUsado}</p>
          <p className="text-xs opacity-75 mt-1">Desde o início</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium opacity-90">Expirados</span>
            <AlertCircle size={16} />
          </div>
          <p className="text-3xl font-bold">{saldo.totalExpirado}</p>
          <p className="text-xs opacity-75 mt-1">Vencidos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-(--border) flex gap-4">
        <button
          onClick={() => setTab('mes')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${tab === 'mes' ? 'text-(--accent-600) border-b-2 border-(--accent-600)' : 'text-(--muted) hover:text-(--text)'}`}
        >
          <span className="capitalize">{nomeMes}</span>
          <span className="ml-1.5 text-xs opacity-70">({creditosMes.length})</span>
        </button>
        <button
          onClick={() => setTab('historico')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${tab === 'historico' ? 'text-(--accent-600) border-b-2 border-(--accent-600)' : 'text-(--muted) hover:text-(--text)'}`}
        >
          Histórico completo
          <span className="ml-1.5 text-xs opacity-70">({saldo.historicoCompleto.length})</span>
        </button>
      </div>

      {/* Conteúdo */}
      {tab === 'mes' && (
        <div className="space-y-5">
          {creditosMes.length === 0 ? (
            <div className="bg-(--surface) border border-(--border) rounded-lg p-8 text-center">
              <Calendar className="mx-auto mb-3 text-(--muted) opacity-40" size={36} />
              <p className="text-(--muted) text-sm">Nenhum crédito ganho este mês</p>
            </div>
          ) : (
            semanasOrdenadas.map(([semana, { label, creditos }]) => (
              <div key={semana}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={13} className="text-(--muted)" />
                  <span className="text-xs font-semibold text-(--muted) uppercase tracking-wide">{label}</span>
                  <span className="text-xs bg-(--accent-50) text-(--accent-700) px-2 py-0.5 rounded-full font-medium">
                    {creditos.filter(c => c.status === 'VALIDO').length} disponível
                    {creditos.filter(c => c.status === 'VALIDO').length !== 1 ? 'is' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {creditos.map(c => <CreditoCard key={c.id} credito={c} />)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'historico' && (
        <div className="space-y-2">
          {saldo.historicoCompleto.length === 0 ? (
            <div className="bg-(--surface) border border-(--border) rounded-lg p-8 text-center">
              <Calendar className="mx-auto mb-3 text-(--muted) opacity-40" size={36} />
              <p className="text-(--muted) text-sm">Sem histórico de créditos</p>
            </div>
          ) : (
            saldo.historicoCompleto.map(c => <CreditoCard key={c.id} credito={c} />)
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-(--surface) border border-(--border) rounded-xl p-4 space-y-2">
        <p className="text-xs font-medium text-(--text)">Como funcionam os créditos?</p>
        <ul className="text-xs text-(--muted) space-y-1 ml-2">
          <li>• Você ganha 1 crédito ao cancelar uma aula com mais de 24h de antecedência</li>
          <li>• Créditos podem ser usados para agendar reposições em semanas futuras</li>
          <li>• Expiram 12 meses após a data de criação</li>
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
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-3.5 flex items-center gap-3`}>
      <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
      <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-(--muted) opacity-70">Criado em</p>
          <p className="font-medium text-(--text)">{dataCriacao.toLocaleDateString('pt-BR')}</p>
        </div>
        <div>
          <p className="text-(--muted) opacity-70">Expira em</p>
          <p className="font-medium text-(--text)">{dataExpiracao.toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          status === 'VALIDO' ? 'bg-green-100 text-green-700' :
          status === 'USADO' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>{label}</span>
        {status === 'VALIDO' && diasAteExpiracao < 30 && (
          <p className="text-xs text-(--muted) mt-0.5">{diasAteExpiracao}d restantes</p>
        )}
      </div>
    </div>
  );
}
