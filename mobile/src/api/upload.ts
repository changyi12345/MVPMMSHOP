import { API_BASE, apiFetch } from './client';
import { getAuth } from './auth';

export async function uploadPaymentProofBase64(dataUri: string): Promise<string> {
  const result = await apiFetch<{ url: string }>('/uploads/payment-proof-base64', {
    method: 'POST',
    body: JSON.stringify({ data: dataUri }),
  });
  return result.url;
}

export async function uploadPaymentProofUri(uri: string, mimeType = 'image/jpeg'): Promise<string> {
  const auth = getAuth();
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: mimeType,
    name: 'proof.jpg',
  } as unknown as Blob);

  const res = await fetch(`${API_BASE}/uploads/payment-proof`, {
    method: 'POST',
    headers: auth?.access_token ? { Authorization: `Bearer ${auth.access_token}` } : {},
    body: formData,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Upload failed');
  return body.url as string;
}
