import { getToken } from '../lib/auth';

export interface GoogleSyncResult {
  total: number;
  success: number;
  failed: number;
}

interface OAuthUrlResponse {
  authUrl: string;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function startGoogleOAuth(loginHint?: string, returnUrl?: string): Promise<void> {
  const res = await fetch('/google/oauth/url', {
    method: 'POST',
    headers: authHeaders(),
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
    headers: authHeaders(),
    body: JSON.stringify({ dataInicio, dataFim }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => 'Erro ao sincronizar');
    throw new Error(msg || 'Erro ao sincronizar');
  }

  return res.json() as Promise<GoogleSyncResult>;
}
