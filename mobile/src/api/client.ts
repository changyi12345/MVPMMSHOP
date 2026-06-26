import { getAuth } from './auth';
import { API_BASE } from '../config/api';
import { ApiError, isRetryableError, NetworkError, sleep } from '../lib/errors';

export { API_BASE };

function parseError(data: { message?: string | string[] }, status: number): never {
  const msg = Array.isArray(data.message)
    ? data.message[0] ?? 'Request failed'
    : data.message ?? 'Request failed';
  throw new ApiError(msg, status);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const auth = getAuth();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth?.access_token) {
    headers.Authorization = `Bearer ${auth.access_token}`;
  }

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
      let body: { message?: string | string[] } = {};
      try {
        body = await res.json();
      } catch {
        body = {};
      }
      if (!res.ok) parseError(body, res.status);
      return body as T;
    } catch (err) {
      lastError = err;
      if (err instanceof ApiError) {
        if (attempt < maxAttempts - 1 && isRetryableError(err)) {
          await sleep(400 * (attempt + 1));
          continue;
        }
        throw err;
      }
      if (attempt < maxAttempts - 1) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      throw new NetworkError(
        err instanceof Error ? err.message : 'Unable to reach the server',
      );
    }
  }

  throw lastError instanceof Error ? lastError : new NetworkError();
}

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
