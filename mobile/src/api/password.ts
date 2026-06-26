import { API_BASE } from '../config/api';

function parseError(data: { message?: string | string[] }): string {
  if (Array.isArray(data.message)) return data.message[0] ?? 'Request failed';
  return data.message ?? 'Request failed';
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(parseError(body));
  return body;
}
