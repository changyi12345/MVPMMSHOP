import { apiFetch } from './client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function sendPhoneOtp(phone: string, auth = false) {
  const token = auth && typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const path = auth ? '/auth/phone/send-otp/me' : '/auth/phone/send-otp';
  if (auth) {
    return apiFetch<{ message: string; phone: string; devCode?: string }>(path, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(Array.isArray(body.message) ? body.message[0] : body.message ?? 'Failed');
  return body as { message: string; phone: string; devCode?: string };
}

export async function verifyPhoneOtp(phone: string, code: string, auth = false) {
  const path = auth ? '/auth/phone/verify-otp/me' : '/auth/phone/verify-otp';
  if (auth) {
    return apiFetch<{ verified: boolean; phone: string }>(path, {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(Array.isArray(body.message) ? body.message[0] : body.message ?? 'Failed');
  return body as { verified: boolean; phone: string };
}
