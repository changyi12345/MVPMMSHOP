import { API_BASE, apiFetch } from './client';
import { getAuth } from './auth';

export type PaymentProofFile = {
  uri: string;
  type?: string;
  base64?: string;
};

function extFromMime(mime: string): string {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  return 'jpg';
}

function toDataUri(file: PaymentProofFile): string {
  const mime = file.type ?? 'image/jpeg';
  if (file.base64) {
    return file.base64.startsWith('data:') ? file.base64 : `data:${mime};base64,${file.base64}`;
  }
  throw new Error('No image data for upload');
}

export async function uploadPaymentProofBase64(dataUri: string): Promise<string> {
  const result = await apiFetch<{ url: string }>('/uploads/payment-proof-base64', {
    method: 'POST',
    body: JSON.stringify({ data: dataUri }),
  });
  return result.url;
}

async function uploadPaymentProofMultipart(
  uri: string,
  mimeType: string,
  filename: string,
): Promise<string> {
  const auth = getAuth();
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: mimeType,
    name: filename,
  } as unknown as Blob);

  const res = await fetch(`${API_BASE}/uploads/payment-proof`, {
    method: 'POST',
    headers: auth?.access_token ? { Authorization: `Bearer ${auth.access_token}` } : {},
    body: formData,
  });

  let body: { message?: string | string[]; url?: string } = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new Error(msg ?? 'Upload failed');
  }
  if (!body.url) throw new Error('Upload failed — no URL returned');
  return body.url;
}

/** Upload payment proof — multipart first, base64 fallback (works when FormData fails on device). */
export async function uploadPaymentProof(file: PaymentProofFile): Promise<string> {
  const mime = file.type ?? 'image/jpeg';
  const filename = `proof.${extFromMime(mime)}`;

  try {
    return await uploadPaymentProofMultipart(file.uri, mime, filename);
  } catch (multipartErr) {
    if (!file.base64) throw multipartErr;
    return uploadPaymentProofBase64(toDataUri(file));
  }
}

/** @deprecated use uploadPaymentProof */
export async function uploadPaymentProofUri(uri: string, mimeType = 'image/jpeg'): Promise<string> {
  return uploadPaymentProof({ uri, type: mimeType });
}
