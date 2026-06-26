import { clearAuthCookies, setAuthCookies, setRoleCookie } from '../auth-cookies';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  walletBalance?: number;
  phone?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export interface LoginResponse extends AuthResponse {
  requires2FA?: false;
}

export interface Login2FAResponse {
  requires2FA: true;
  twoFactorToken: string;
}

export type LoginResult = LoginResponse | Login2FAResponse;

export function is2FALogin(result: LoginResult): result is Login2FAResponse {
  return 'requires2FA' in result && result.requires2FA === true;
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
}): Promise<LoginResult> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function verifyAdmin2FA(twoFactorToken: string, code: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/admin-2fa/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ twoFactorToken, code }),
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

export function saveAuth(response: AuthResponse) {
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('user', JSON.stringify(response.user));
  setAuthCookies(response.access_token, response.user.role);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authchange'));
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  clearAuthCookies();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authchange'));
  }
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role?.toLowerCase() === 'admin';
}

export async function fetchProfile(signal?: AbortSignal): Promise<AuthUser> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function updateProfile(data: { username?: string; email?: string }): Promise<AuthUser> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function verifyEmail(token: string) {
  const res = await fetch(`${API_BASE}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function resendVerification(email: string) {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export function refreshStoredUser(user: AuthUser) {
  localStorage.setItem('user', JSON.stringify(user));
  setRoleCookie(user.role);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authchange'));
  }
}
