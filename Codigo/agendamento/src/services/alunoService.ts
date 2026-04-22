import { getToken } from '../lib/auth';

export interface AlunoResumoDTO {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  status: boolean;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listarAlunos(): Promise<AlunoResumoDTO[]> {
  const res = await fetch('/aluno', { method: 'GET', headers: authHeaders() });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json() as Promise<AlunoResumoDTO[]>;
}
