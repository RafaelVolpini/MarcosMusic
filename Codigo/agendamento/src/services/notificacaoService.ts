// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface NotificacaoDTO {
  id: number;
  destinatario: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadaEm: string; // ISO datetime
  refId: number | null;
}

export type TipoNotificacao =
  | 'LEMBRETE_HOJE'
  | 'LEMBRETE_AMANHA'
  | 'AULA_AGENDADA'
  | 'AULA_REAGENDADA'
  | 'AULA_CANCELADA'
  | 'CONFIRMOU_PRESENCA'
  | 'REPOSICAO_AGENDADA'
  | 'REPOSICAO_REMOVIDA'
  | 'NOVA_MENSAGEM';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as unknown as T);
}

const BASE = '/notificacao';

// ─── API ──────────────────────────────────────────────────────────────────────

export const notificacaoService = {
  /** Lista notificações de um destinatário */
  listar: (dest: string): Promise<NotificacaoDTO[]> =>
    fetch(`${BASE}?dest=${encodeURIComponent(dest)}`, { credentials: 'include' })
      .then(r => handleResponse<NotificacaoDTO[]>(r)),

  /** Conta não lidas */
  naoLidas: (dest: string): Promise<number> =>
    fetch(`${BASE}/nao-lidas?dest=${encodeURIComponent(dest)}`, { credentials: 'include' })
      .then(r => handleResponse<number>(r)),

  /** Marca uma notificação como lida */
  marcarLida: (id: number): Promise<void> =>
    fetch(`${BASE}/${id}/ler`, { method: 'PUT', credentials: 'include' })
      .then(r => handleResponse<void>(r)),

  /** Marca todas como lidas */
  marcarTodasLidas: (dest: string): Promise<void> =>
    fetch(`${BASE}/ler-todas?dest=${encodeURIComponent(dest)}`, {
      method: 'PUT',
      credentials: 'include',
    }).then(r => handleResponse<void>(r)),
};
