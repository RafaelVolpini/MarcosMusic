import { getToken } from '../lib/auth';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface AlunoResumo {
  id: string;
  nome: string;
}

export interface ReposicaoDTO {
  id: number;
  disponibilidadeId: number;
  diaSemana: string;
  horario: string;
  dataAula: string; // "YYYY-MM-DD"
  status: 'ABERTA' | 'REALIZADA' | 'CANCELADA';
  observacao?: string;
  alunos: AlunoResumo[];
  aulaId: number;
}

export interface CriarReposicaoPayload {
  disponibilidadeId: number;
  dataAula: string; // "YYYY-MM-DD"
  alunoIds: string[];
  observacao?: string;
  aulaId: number; 
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as unknown as T);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export async function listarReposicoes(): Promise<ReposicaoDTO[]> {
  const res = await fetch('/reposicao', { headers: authHeaders() });
  return handleResponse<ReposicaoDTO[]>(res);
}

export async function criarReposicao(payload: CriarReposicaoPayload): Promise<ReposicaoDTO> {
  const res = await fetch('/reposicao', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ReposicaoDTO>(res);
}

export async function adicionarAluno(id: number, alunoId: string): Promise<ReposicaoDTO> {
  const res = await fetch(`/reposicao/${id}/aluno/${alunoId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse<ReposicaoDTO>(res);
}

export async function removerAluno(id: number, alunoId: string): Promise<ReposicaoDTO> {
  const res = await fetch(`/reposicao/${id}/aluno/${alunoId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<ReposicaoDTO>(res);
}

export async function deletarReposicao(id: number): Promise<void> {
  const res = await fetch(`/reposicao/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}
