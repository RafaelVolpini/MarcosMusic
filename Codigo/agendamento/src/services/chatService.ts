// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface ChatDTO {
  id: number;
  alunoId: string;
  alunoNome: string;
  ultimaMensagem: string | null;
  ultimaMensagemEm: string | null; // ISO datetime
  naoLidas: number;
}

export interface ChatMensagemDTO {
  id: number;
  chatId: number;
  remetente: 'professor' | 'aluno';
  remetenteId: string;
  conteudo: string;
  tipo: 'text' | 'image' | 'video';
  lida: boolean;
  criadaEm: string; // ISO datetime
}

export interface NovaMensagemPayload {
  remetenteId: string;
  remetente: 'professor' | 'aluno';
  conteudo: string;
  tipo?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as unknown as T);
}

const BASE = '/chat';

// ─── API ──────────────────────────────────────────────────────────────────────

export const chatService = {
  /** Lista todos os chats (professor vê todos; aluno chama iniciar) */
  listar: (): Promise<ChatDTO[]> =>
    fetch(BASE, { credentials: 'include' }).then(r => handleResponse<ChatDTO[]>(r)),

  /** Inicia ou retorna o chat do professor com um aluno */
  iniciar: (alunoId: string): Promise<ChatDTO> =>
    fetch(`${BASE}/iniciar/${alunoId}`, {
      method: 'POST',
      credentials: 'include',
    }).then(r => handleResponse<ChatDTO>(r)),

  /** Retorna o chat de um aluno (aluno busca o próprio) */
  porAluno: (alunoId: string): Promise<ChatDTO> =>
    fetch(`${BASE}/aluno/${alunoId}`, { credentials: 'include' })
      .then(r => handleResponse<ChatDTO>(r)),

  /** Mensagens de um chat */
  getMensagens: (chatId: number): Promise<ChatMensagemDTO[]> =>
    fetch(`${BASE}/${chatId}/mensagens`, { credentials: 'include' })
      .then(r => handleResponse<ChatMensagemDTO[]>(r)),

  /** Envia uma mensagem */
  enviarMensagem: (chatId: number, payload: NovaMensagemPayload): Promise<ChatMensagemDTO> =>
    fetch(`${BASE}/${chatId}/mensagem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).then(r => handleResponse<ChatMensagemDTO>(r)),

  /** Marca mensagens do chat como lidas para o remetente informado */
  marcarLidas: (chatId: number, remetente: 'professor' | 'aluno'): Promise<void> =>
    fetch(`${BASE}/${chatId}/ler?remetente=${remetente}`, {
      method: 'PUT',
      credentials: 'include',
    }).then(r => handleResponse<void>(r)),

  /** Total de mensagens não lidas (para badge) */
  naoLidas: (remetente: 'professor' | 'aluno'): Promise<number> =>
    fetch(`${BASE}/nao-lidas?remetente=${remetente}`, { credentials: 'include' })
      .then(r => handleResponse<number>(r)),
};
