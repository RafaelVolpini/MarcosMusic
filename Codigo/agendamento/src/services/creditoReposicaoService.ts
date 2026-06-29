export interface CreditoReposicaoDTO {
  id: number;
  dataCriacao: string;
  dataExpiracao: string;
  status: 'VALIDO' | 'EXPIRADO' | 'USADO';
  observacao?: string;
  diasAteExpiracao: number;
  disponivel: boolean;
}

export interface SaldoCreditosDTO {
  totalDisponivel: number;
  totalUsado: number;
  totalExpirado: number;
  diasAteProximaExpiracao: number;
  creditosAtivos: CreditoReposicaoDTO[];
  historicoCompleto: CreditoReposicaoDTO[];
}

export async function getSaldoCreditos(alunoId: string): Promise<SaldoCreditosDTO> {
  const res = await fetch(`/credito-reposicao/aluno/${alunoId}/saldo`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Cache-Control': 'no-cache' }
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const text = await res.text();
  if (!text) throw new Error('Resposta vazia do servidor');
  try {
    return JSON.parse(text) as SaldoCreditosDTO;
  } catch {
    throw new Error(`Resposta inválida: ${text.substring(0, 100)}`);
  }
}

export async function getCreditosDisponivel(alunoId: string): Promise<CreditoReposicaoDTO[]> {
  const res = await fetch(`/credito-reposicao/aluno/${alunoId}/disponivel`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json() as Promise<CreditoReposicaoDTO[]>;
}

export async function getTotalCreditosDisponivel(alunoId: string): Promise<number> {
  const res = await fetch(`/credito-reposicao/aluno/${alunoId}/total`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json() as number;
  return data;
}
