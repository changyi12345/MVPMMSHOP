const store = new Map<string, { value: unknown; expiresAt: number }>();

export function cacheGet<T>(key: string): T | null {
  const row = store.get(key);
  if (!row) return null;
  if (Date.now() > row.expiresAt) {
    store.delete(key);
    return null;
  }
  return row.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheClear(key?: string) {
  if (key) store.delete(key);
  else store.clear();
}

/** Default TTL: 5 minutes */
export const CACHE_TTL_MS = 5 * 60 * 1000;
