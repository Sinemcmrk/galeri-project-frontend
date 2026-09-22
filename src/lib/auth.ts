export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
}

export interface Session {
  token: string;
  user: SessionUser;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_session';

export function saveSession(session: Session): void {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;
  try {
    const user = JSON.parse(rawUser) as SessionUser;
    return { token, user };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
