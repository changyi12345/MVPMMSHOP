import { API_BASE } from '../config/api';
import { getAuth } from './auth';

function parseError(data: { message?: string | string[] }): string {
  if (Array.isArray(data.message)) return data.message[0] ?? 'Request failed';
  return data.message ?? 'Request failed';
}

async function postPhone(path: string, body: Record<string, string>, auth = false) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getAuth()?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(parseError(data));
  return data as { message?: string; phone?: string; verified?: boolean };
}

export function sendRegisterOtp(phone: string) {
  return postPhone('/auth/phone/send-otp', { phone });
}

export function verifyRegisterOtp(phone: string, code: string) {
  return postPhone('/auth/phone/verify-otp', { phone, code });
}

export function sendProfileOtp(phone: string) {
  return postPhone('/auth/phone/send-otp/me', { phone }, true);
}

export function verifyProfileOtp(phone: string, code: string) {
  return postPhone('/auth/phone/verify-otp/me', { phone, code }, true);
}
