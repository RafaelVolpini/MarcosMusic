import { getToken } from '../lib/auth';
import type { WeeklyAvailability } from '../types';

// ─── DTOs espelhados do backend ──────────────────────────────────────────────

export interface CalendarResponseDTO {
  id: number;
  dataInicio: string;
  dataFim: string;
  idAluno?: string;
  nomeAluno?: string;
  flagCancelada?: boolean;
  presencaConfirmada?: boolean;
  recorrente?: boolean;
}

export interface HorarioValidatorDTO {
  dia: number;       // 1 = Segunda … 7 = Domingo (padrão Java DayOfWeek)
  horarioInicio: string; // "HH:mm"
  horarioFim: string;    // "HH:mm"
}

// ─── Helpers internos ────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch { /* ignora */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─── Serviços públicos ───────────────────────────────────────────────────────

/**
 * POST /aula/buscar
 * Retorna aulas no intervalo [dataInicio, dataFim] (formato ISO-8601).
 */
export async function buscarAulas(
  dataInicio: string,
  dataFim: string,
): Promise<CalendarResponseDTO[]> {
  try {
    const res = await fetch('/aula/buscar', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ dataInicio, dataFim }),
    });
    return handleResponse<CalendarResponseDTO[]>(res);
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('Não foi possível carregar as aulas. Verifique sua conexão.');
  }
}

/**
 * GET /aula/cancelar/{id}
 * Marca a aula como cancelada (flag_cancelada = true).
 */
export async function cancelarAula(id: string): Promise<void> {
  try {
    const res = await fetch(`/aula/cancelar/${id}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || 'Não foi possível cancelar a aula. Tente novamente.');
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('Não foi possível cancelar a aula. Verifique sua conexão.');
  }
}

export interface CriarAulaDTO {
  studentId: string;   // UUID do aluno
  dataInicio: string;  // ISO-8601 "2026-04-22T09:00:00"
  dataFim: string;     // ISO-8601 "2026-04-22T09:50:00"
  recorrente?: boolean;
}

/**
 * POST /aula/criar
 * Cria uma ou mais aulas (recorrente = toda semana por 1 ano).
 * Retorna sempre um array de CalendarResponseDTO.
 */
export async function criarAula(dto: CriarAulaDTO): Promise<CalendarResponseDTO[]> {
  try {
    const res = await fetch('/aula/criar', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    });
    const raw = await handleResponse<CalendarResponseDTO[] | CalendarResponseDTO>(res);
    return Array.isArray(raw) ? raw : [raw];
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('Não foi possível criar a aula. Verifique sua conexão.');
  }
}

/**
 * PUT /aula/reagendar/{id}
 * Reagenda a aula para uma nova data/hora.
 */
export async function reagendarAula(
  id: string,
  dataInicio: string,
  dataFim: string,
): Promise<CalendarResponseDTO> {
  const res = await fetch(`/aula/reagendar/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ dataInicio, dataFim }),
  });
  return handleResponse<CalendarResponseDTO>(res);
}

/**
 * PUT /aula/confirmarPresenca/{id}
 * Confirma presença do aluno na aula.
 */
export async function confirmarPresenca(id: string): Promise<CalendarResponseDTO> {
  const res = await fetch(`/aula/confirmarPresenca/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  return handleResponse<CalendarResponseDTO>(res);
}

/**
 * POST /aluno/validar-horario
 * Retorna true se o horário está livre, false se há conflito.
 */
export async function validarHorario(dto: HorarioValidatorDTO): Promise<boolean> {
  try {
    const res = await fetch('/aluno/validar-horario', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    });
    return handleResponse<boolean>(res);
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('Não foi possível validar o horário. Tente novamente.');
  }
}

// ─── Disponibilidade ─────────────────────────────────────────────────────────

export interface DisponibilidadeResponseDTO {
  id: number;
  diaSemana: string;
  horario: string;
  disponivel: boolean;
  reposicao: boolean;
  aulaMarcada: boolean;
  aulaId: number | null;
  alunoId: string | null;
  alunoNome: string | null;
  flagCancelada: boolean;
}

/**
 * GET /disponibilidade
 * Lista todos os slots de disponibilidade cadastrados no banco.
 */
export async function buscarDisponibilidade(): Promise<DisponibilidadeResponseDTO[]> {
  const res = await fetch('/disponibilidade', { headers: authHeaders() });
  return handleResponse<DisponibilidadeResponseDTO[]>(res);
}

/**
 * POST /disponibilidade/sincronizar
 * Sincroniza apenas as flags de aula (aulaMarcada) nos slots existentes,
 * sem alterar os campos disponivel/reposicao definidos pelo professor.
 */
export async function sincronizarDisponibilidade(): Promise<DisponibilidadeResponseDTO[]> {
  const res = await fetch('/disponibilidade/sincronizar', {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse<DisponibilidadeResponseDTO[]>(res);
}

/**
 * POST /disponibilidade/salvar
 * Salva (upsert) a disponibilidade semanal completa do professor.
 */
export async function salvarDisponibilidade(
  availability: WeeklyAvailability,
  availabilityReposicao: WeeklyAvailability,
): Promise<DisponibilidadeResponseDTO[]> {
  const res = await fetch('/disponibilidade/salvar', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ availability, availabilityReposicao }),
  });
  return handleResponse<DisponibilidadeResponseDTO[]>(res);
}

/**
 * PATCH /disponibilidade/{id}/cancelar
 * Cancela a aula vinculada a um slot de disponibilidade.
 */
export async function cancelarSlotDisponibilidade(id: number): Promise<DisponibilidadeResponseDTO> {
  const res = await fetch(`/disponibilidade/${id}/cancelar`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse<DisponibilidadeResponseDTO>(res);
}
