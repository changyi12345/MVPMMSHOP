import type { AuthResponse } from './auth';

const AUTH_KEY = 'mvpmms_auth';
const LANG_KEY = 'mvpmms_lang';

let storedAuth: AuthResponse | null = null;
let storageReady = false;

type Storage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function getStorage(): Storage | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-async-storage/async-storage').default as Storage;
  } catch {
    return null;
  }
}

export async function hydrateAuth(): Promise<AuthResponse | null> {
  const storage = getStorage();
  if (!storage) {
    storageReady = true;
    return storedAuth;
  }
  try {
    const raw = await storage.getItem(AUTH_KEY);
    if (raw) {
      storedAuth = JSON.parse(raw) as AuthResponse;
    }
  } catch {
    storedAuth = null;
  }
  storageReady = true;
  return storedAuth;
}

export function saveAuth(data: AuthResponse) {
  storedAuth = data;
  const storage = getStorage();
  if (storage) {
    storage.setItem(AUTH_KEY, JSON.stringify(data)).catch(() => {});
  }
}

export function getAuth(): AuthResponse | null {
  return storedAuth;
}

export function clearAuth() {
  storedAuth = null;
  const storage = getStorage();
  if (storage) {
    storage.removeItem(AUTH_KEY).catch(() => {});
  }
}

export function isLoggedIn(): boolean {
  return storedAuth != null;
}

export function isAuthHydrated(): boolean {
  return storageReady;
}

export async function persistLang(lang: string) {
  const storage = getStorage();
  if (storage) await storage.setItem(LANG_KEY, lang).catch(() => {});
}

export async function loadPersistedLang(): Promise<string | null> {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return await storage.getItem(LANG_KEY);
  } catch {
    return null;
  }
}
