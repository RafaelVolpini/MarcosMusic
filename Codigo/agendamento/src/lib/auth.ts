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

const BACKEND_URL = 'http://localhost:8081';

const SESSION_KEY = 'musga:auth:session';

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

  const namePart = email.split('@')[0] ?? 'Usuário';
  const firstName = role === 'teacher' ? 'Marcos' : namePart;
  const lastName  = role === 'teacher' ? 'Mello'  : '';

  const user: AuthUser = {
    role,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email,
    phone: '',
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
