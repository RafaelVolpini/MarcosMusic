import { getToken } from '../lib/auth';
import type { Aluno } from '../types';

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listarAlunos(): Promise<Aluno[]> {
  const res = await fetch('/aluno', { method: 'GET', headers: authHeaders() });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json() as Array<{ id: string; nome: string | null; email: string | null; telefone: string | null; status: boolean }>;
  return data.map(d => ({
    id: d.id,
    nome: d.nome ?? d.email ?? 'Aluno',
    email: d.email ?? '',
    telefone: d.telefone ?? '',
    ativo: d.status !== false,
  }));
}
