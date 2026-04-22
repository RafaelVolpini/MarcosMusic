import { getToken } from '../lib/auth';

// ─── DTOs espelhados do backend ──────────────────────────────────────────────

export interface CalendarResponseDTO {
  id: number;
  dataInicio: string;
  dataFim: string;
  idAluno?: string;
  nomeAluno?: string;
  flagCancelada?: boolean;
  presencaConfirmada?: boolean;
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
}

/**
 * POST /aula/criar
 * Cria uma nova aula para o aluno autenticado (identificado pelo JWT).
 */
export async function criarAula(dto: CriarAulaDTO): Promise<CalendarResponseDTO> {
  try {
    const res = await fetch('/aula/criar', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    });
    return handleResponse<CalendarResponseDTO>(res);
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
