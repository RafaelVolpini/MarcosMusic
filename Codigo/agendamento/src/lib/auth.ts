export interface AuthUser {
  role: 'teacher' | 'student';
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
}

interface StoredUser {
  role: 'teacher' | 'student';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

export interface ContractAcceptance {
  email: string;
  acceptedAt: string;
}

const USER_KEY = 'musga:auth:user';
const USERS_KEY = 'musga:auth:users';
const CONTRACT_KEY = 'musga:contract:acceptances';
const TEACHER_LOGIN_EMAIL = 'marcos@musga.com';
const TEACHER_LOGIN_PASSWORD = '1234';

const safeReadJSON = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export function getUser(): AuthUser | null {
  return safeReadJSON<AuthUser | null>(USER_KEY, null);
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const buildAuthUser = (user: StoredUser): AuthUser => ({
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  phone: user.phone,
});

const getStoredUsers = (): StoredUser[] =>
  safeReadJSON<StoredUser[]>(USERS_KEY, []);

const saveStoredUsers = (users: StoredUser[]) => {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const saveSession = (user: AuthUser) => {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const users = getStoredUsers();

  if (users.some((u) => u.email === email)) {
    throw new Error('Ja existe um cadastro com este e-mail.');
  }

  const newUser: StoredUser = {
    role: 'student',
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    phone: input.phone.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);

}

export function login(emailInput: string, passwordInput: string): AuthUser | null {
  const email = normalizeEmail(emailInput);
  const password = passwordInput.trim();

  if (email === TEACHER_LOGIN_EMAIL && password === TEACHER_LOGIN_PASSWORD) {
    const teacherUser: AuthUser = {
      role: 'teacher',
      firstName: 'Marcos',
      lastName: 'Mello',
      name: 'Marcos Mello',
      email: TEACHER_LOGIN_EMAIL,
      phone: '(11) 99999-9999',
    };
    saveSession(teacherUser);
    return teacherUser;
  }

  const users = getStoredUsers();
  const found = users.find((u) => u.email === email && u.password === password);

  if (!found && email && password) {
    const autoStudent: StoredUser = {
      role: 'student',
      firstName: email.split('@')[0] || 'Aluno',
      lastName: '',
      email,
      phone: '',
      password,
      createdAt: new Date().toISOString(),
    };
    users.push(autoStudent);
    saveStoredUsers(users);
    const authUser = buildAuthUser(autoStudent);
    saveSession(authUser);
    return authUser;
  }

  if (!found) return null;

  const authUser = buildAuthUser(found);
  saveSession(authUser);
  return authUser;
}

export function logout() {
  window.localStorage.removeItem(USER_KEY);
}

export function hasAcceptedContract(email: string): boolean {
  const acceptances = safeReadJSON<Record<string, ContractAcceptance>>(CONTRACT_KEY, {});
  return Boolean(acceptances[email.trim().toLowerCase()]);
}

export function getContractAcceptance(email: string): ContractAcceptance | null {
  const acceptances = safeReadJSON<Record<string, ContractAcceptance>>(CONTRACT_KEY, {});
  return acceptances[email.trim().toLowerCase()] ?? null;
}

export function acceptContract(email: string): ContractAcceptance {
  const normalizedEmail = email.trim().toLowerCase();
  const acceptances = safeReadJSON<Record<string, ContractAcceptance>>(CONTRACT_KEY, {});
  const record: ContractAcceptance = {
    email: normalizedEmail,
    acceptedAt: new Date().toISOString(),
  };

  acceptances[normalizedEmail] = record;
  window.localStorage.setItem(CONTRACT_KEY, JSON.stringify(acceptances));
  return record;
}
