import { API_BASE, getToken } from './client';

function parseError(data: { message?: string | string[] }): string {
  if (Array.isArray(data.message)) return data.message[0] ?? 'Upload failed';
  return data.message ?? 'Upload failed';
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadPaymentProofImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only PNG, JPG, WEBP, or GIF images are allowed');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be under 5MB');
  }

  const token = getToken();
  if (!token) throw new Error('Please login first');

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/uploads/payment-proof`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseError(body));

  const url = body.url as string | undefined;
  if (!url) throw new Error('Upload failed — no URL returned');
  return url;
}

export async function uploadAdminImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only PNG, JPG, WEBP, or GIF images are allowed');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be under 5MB');
  }

  const token = getToken();
  if (!token) throw new Error('Please login as admin');

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseError(body));

  const url = body.url as string | undefined;
  if (!url) throw new Error('Upload failed — no URL returned');
  return url;
}
