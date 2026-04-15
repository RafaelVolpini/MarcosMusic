export interface AuthUser {
  role: 'teacher' | 'student';
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  token?: string;
  termos?: boolean | null;
}

export interface ContractAcceptance {
  email: string;
  acceptedAt: string;
}

const BACKEND_URL = '';

const SESSION_KEY = 'musga:auth:session';
const PROFILE_KEY = 'musga:auth:profiles';

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

// ─── Session helpers (token + user stored in sessionStorage) ────────────────

function saveSession(user: AuthUser): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getUser()?.token ?? null;
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
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
    body: JSON.stringify({ email: input.email.trim().toLowerCase(), password: input.password }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => 'Erro ao registrar');
    throw new Error(msg || 'Erro ao registrar');
  }

  // O backend devolve o token diretamente como string
  const token = await res.text();

  const user: AuthUser = {
    role: 'student',
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    token,
  };

  saveProfile(user.email, {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });

  saveSession(user);
}

// ─── Login ───────────────────────────────────────────────────────────────────

interface LoginResponse {
  token: string;
  termos: boolean | null;
  ultimoLogin: string | null;
}

export async function login(emailInput: string, passwordInput: string): Promise<AuthUser | null> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) return null;

  const data: LoginResponse = await res.json();

  // Deriva papel: professor tem email fixo
  const role: AuthUser['role'] = email === 'marcos@musga.com' ? 'teacher' : 'student';

  const profile = getProfile(email);
  const firstName = role === 'teacher' ? 'Marcos' : (profile?.firstName?.trim() || 'Aluno');
  const lastName  = role === 'teacher' ? 'Mello'  : (profile?.lastName?.trim() || '');

  const user: AuthUser = {
    role,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email,
    phone: profile?.phone?.trim() || '',
    token: data.token,
    termos: data.termos ?? false,
  };

  saveSession(user);
  return user;
}

// ─── Contract ────────────────────────────────────────────────────────────────

export async function acceptContract(email: string): Promise<ContractAcceptance> {
  const normalizedEmail = email.trim().toLowerCase();

  const res = await fetch(`${BACKEND_URL}/auth/accept-terms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail }),
  });

  if (!res.ok) {
    throw new Error('Falha ao registrar aceitação dos termos');
  }

  return { email: normalizedEmail, acceptedAt: new Date().toISOString() };
}

export function hasAcceptedContract(email: string): boolean {
  const user = getUser();
  if (!user || user.email !== email.trim().toLowerCase()) return false;
  return user.termos === true;
}
