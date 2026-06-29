export interface AuthUser {
  id?: string;
  role: 'teacher' | 'student';
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  termos?: boolean | null;
  photoUrl?: string;
}

export interface ContractAcceptance {
  email: string;
  acceptedAt: string;
}

const BACKEND_URL = '';

// User metadata only the access token lives in an HttpOnly cookie managed by the browser
const SESSION_KEY = 'marcos-music:auth:session';
const PROFILE_KEY = 'marcos-music:auth:profiles';

interface StoredProfile {
  firstName: string;
  lastName: string;
  phone: string;
}

function readProfiles(): Record<string, StoredProfile> {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, StoredProfile>;
  } catch {
    return {};
  }
}

function saveProfile(email: string, profile: StoredProfile): void {
  const normalizedEmail = email.trim().toLowerCase();
  const profiles = readProfiles();
  profiles[normalizedEmail] = profile;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
}

function getProfile(email: string): StoredProfile | null {
  const normalizedEmail = email.trim().toLowerCase();
  const profiles = readProfiles();
  return profiles[normalizedEmail] ?? null;
}

// ─── Session helpers ─────────────────────────────────────────────────────────
//
// User metadata (name, role, etc.) is stored in sessionStorage (tab-scoped) or
// localStorage (when "remember me"). The access token is an HttpOnly cookie 
// the browser sends it automatically and JS cannot read it.

function saveSession(user: AuthUser, persistent: boolean): void {
  const payload = JSON.stringify(user);
  if (persistent) {
    localStorage.setItem(SESSION_KEY, payload);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, payload);
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * No-op kept for API compatibility. The access token is an HttpOnly cookie 
 * JS cannot read it, and it is sent automatically by the browser on every request.
 */
export function getToken(): string | null {
  return null;
}

export async function logout(): Promise<void> {
  // Ask the server to clear the HttpOnly cookie
  try {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore network errors clear local state regardless
  }
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      nome: input.firstName.trim(),
      sobrenome: input.lastName.trim(),
      telefone: input.phone.trim(),
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => 'Erro ao registrar');
    throw new Error(msg || 'Erro ao registrar');
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────

interface LoginResponse {
  termos: boolean | null;
  ultimoLogin: string | null;
  nome: string | null;
  telefone: string | null;
  role: string | null;
  id: string | null;
}

export async function login(emailInput: string, passwordInput: string, rememberMe = false): Promise<AuthUser | null> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // browser stores the HttpOnly cookie from Set-Cookie response header
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || 'Credenciais inválidas');
  }

  const data: LoginResponse = await res.json();

  const backendRole = data.role?.toUpperCase();
  const role: AuthUser['role'] = backendRole === 'ADMIN' ? 'teacher' : 'student';

  const profile = getProfile(email);
  const nomeBackend = data.nome?.trim() || '';
  const parts = nomeBackend.split(' ');
  const firstName = parts[0] || profile?.firstName?.trim() || (role === 'teacher' ? 'Marcos' : 'Aluno');
  const lastName  = parts.slice(1).join(' ') || profile?.lastName?.trim() || (role === 'teacher' ? 'Mello' : '');

  const user: AuthUser = {
    id: data.id ?? undefined,
    role,
    firstName,
    lastName,
    name: nomeBackend || `${firstName} ${lastName}`.trim(),
    email,
    phone: data.telefone?.trim() || profile?.phone?.trim() || '',
    termos: data.termos ?? false,
  };

  // Save profile data for future logins (name pre-fill, etc.)
  saveProfile(email, { firstName, lastName, phone: user.phone });
  saveSession(user, rememberMe);
  return user;
}

// ─── Contract ────────────────────────────────────────────────────────────────

export async function acceptContract(email: string): Promise<ContractAcceptance> {
  const normalizedEmail = email.trim().toLowerCase();

  const res = await fetch(`${BACKEND_URL}/auth/accept-terms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: normalizedEmail }),
  });

  if (!res.ok) {
    throw new Error('Falha ao registrar aceitação dos termos');
  }

  const current = getUser();
  if (current) {
    const isPersistent = !!localStorage.getItem(SESSION_KEY);
    saveSession({ ...current, termos: true }, isPersistent);
  }

  return { email: normalizedEmail, acceptedAt: new Date().toISOString() };
}

export function hasAcceptedContract(email: string): boolean {
  const user = getUser();
  if (!user || user.email !== email.trim().toLowerCase()) return false;
  return user.termos === true;
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || 'Erro ao solicitar recuperação de senha');
  }
}

export async function resetPassword(email: string, verificationCode: string, newPassword: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), verificationCode, newPassword }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || 'Código inválido ou expirado');
  }
}

