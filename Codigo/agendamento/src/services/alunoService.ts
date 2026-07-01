import type { Aluno } from '../types';

export interface AlunoFormData {
  nome: string;
  email: string;
  telefone: string;
  apelido?: string;
  ativo: boolean;
  planoAulasSem?: number | null;
}

export async function listarAlunos(): Promise<Aluno[]> {
  const res = await fetch('/aluno', { method: 'GET', credentials: 'include' });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json() as Array<{ id: string; nome: string | null; email: string | null; telefone: string | null; status: boolean; apelido?: string | null; reposicoes?: number | null; planoAulasSem?: number | null }>;
  return data.map(d => ({
    id: d.id,
    nome: d.nome ?? d.email ?? 'Aluno',
    email: d.email ?? '',
    telefone: d.telefone ?? '',
    ativo: d.status !== false,
    apelido: d.apelido ?? undefined,
    reposicoes: d.reposicoes ?? 0,
    planoAulasSem: d.planoAulasSem ?? undefined,
  }));
}

export async function criarAluno(data: AlunoFormData): Promise<Aluno> {
  const body = {
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    apelido: data.apelido ?? null,
    status: data.ativo,
    planoAulasSem: data.planoAulasSem ?? null,
  };
  const res = await fetch('/aluno/salvar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const d = await res.json() as { id: string; nome: string; telefone: string | null; status: boolean; apelido?: string | null; planoAulasSem?: number | null };
  return {
    id: d.id,
    nome: d.nome,
    email: data.email,
    telefone: d.telefone ?? '',
    ativo: d.status !== false,
    apelido: d.apelido ?? undefined,
    planoAulasSem: d.planoAulasSem ?? undefined,
  };
}

export async function atualizarAluno(id: string, data: AlunoFormData): Promise<Aluno> {
  const body = {
    id,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    apelido: data.apelido ?? null,
    status: data.ativo,
    planoAulasSem: data.planoAulasSem ?? null,
  };
  const res = await fetch('/aluno/salvar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const d = await res.json() as { id: string; nome: string; telefone: string | null; status: boolean; apelido?: string | null; planoAulasSem?: number | null };
  return {
    id: d.id,
    nome: d.nome,
    email: data.email,
    telefone: d.telefone ?? '',
    ativo: d.status !== false,
    apelido: d.apelido ?? undefined,
    planoAulasSem: d.planoAulasSem ?? undefined,
  };
}

export async function deletarAluno(id: string): Promise<void> {
  const res = await fetch(`/aluno/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 404) throw new Error(`Erro ${res.status}`);
}
