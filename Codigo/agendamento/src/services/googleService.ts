const GOOGLE_FLAG_KEY      = 'marcos-music:google:connected';
const GOOGLE_AUTO_SYNC_KEY = 'marcos-music:google:auto-sync';

export function setGoogleConnectedFlag(connected: boolean) {
  try {
    if (connected) localStorage.setItem(GOOGLE_FLAG_KEY, '1');
    else localStorage.removeItem(GOOGLE_FLAG_KEY);
  } catch { /* localStorage indisponível */ }
}

export function getGoogleConnectedFlag(): boolean {
  try { return localStorage.getItem(GOOGLE_FLAG_KEY) === '1'; }
  catch { return false; }
}

export function setAutoSyncFlag(enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(GOOGLE_AUTO_SYNC_KEY, '1');
    else localStorage.removeItem(GOOGLE_AUTO_SYNC_KEY);
  } catch { /* localStorage indisponível */ }
}

export function getAutoSyncFlag(): boolean {
  try { return localStorage.getItem(GOOGLE_AUTO_SYNC_KEY) === '1'; }
  catch { return false; }
}

export interface GoogleSyncResult {
  total: number;
  success: number;
  failed: number;
  disconnected?: boolean;
}

interface OAuthUrlResponse {
  authUrl: string;
}

export async function startGoogleOAuth(loginHint?: string, returnUrl?: string): Promise<void> {
  const res = await fetch('/google/oauth/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ loginHint, returnUrl }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    if (res.status === 401) {
      throw new Error('Faça login novamente antes de sincronizar.');
    }
    throw new Error(msg || 'Erro ao iniciar OAuth');
  }

  const data = await res.json() as OAuthUrlResponse;
  window.location.assign(data.authUrl);
}

export async function syncGoogleCalendar(dataInicio: string, dataFim: string): Promise<GoogleSyncResult> {
  const res = await fetch('/google/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ dataInicio, dataFim }),
  });

  if (res.status === 401) {
    // JWT expirou  limpa a flag para parar auto-sync futuro
    setGoogleConnectedFlag(false);
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => 'Erro ao sincronizar');
    throw new Error(msg || 'Erro ao sincronizar');
  }

  const result = await res.json() as GoogleSyncResult;
  if (result.disconnected) {
    // Token Google não está na memória do servidor (ex: reinício do backend)
    setGoogleConnectedFlag(false);
    throw new Error('GOOGLE_RECONNECT');
  }
  return result;
}
