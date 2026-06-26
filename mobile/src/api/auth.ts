import { API_BASE } from '../config/api';

export { saveAuth, getAuth, clearAuth, isLoggedIn, hydrateAuth, loadPersistedLang, persistLang } from './authStorage';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  walletBalance?: number;
  phone?: string | null;
  phoneVerified?: boolean;
  referralCode?: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

function parseError(data: { message?: string | string[] }): string {
  if (Array.isArray(data.message)) return data.message[0] ?? 'Request failed';
  return data.message ?? 'Request failed';
}

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
  phone?: string;
  otpCode?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function loginUser(data: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function loginWithGoogle(data: {
  idToken: string;
  referralCode?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}
