import { Platform } from 'react-native';
import { apiFetch } from './client';

export function registerFcmToken(token: string) {
  return apiFetch<{ ok: boolean; configured?: boolean }>('/push/fcm/register', {
    method: 'POST',
    body: JSON.stringify({ token, platform: Platform.OS }),
  });
}

export function unregisterFcmToken(token: string) {
  return apiFetch<{ ok: boolean }>('/push/fcm/unregister', {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  });
}

export function fetchFcmStatus() {
  return apiFetch<{ configured: boolean }>('/push/fcm/status');
}
