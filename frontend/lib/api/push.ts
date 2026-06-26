import { apiFetch } from './client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function fetchVapidPublicKey() {
  const res = await fetch(`${API_BASE}/push/vapid-public-key`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load push config');
  return res.json() as Promise<{ configured: boolean; publicKey: string | null }>;
}

export function subscribePush(subscription: PushSubscription, userAgent?: string) {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('Invalid push subscription');
  }
  return apiFetch('/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      subscription: {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      },
      userAgent,
    }),
  });
}

export function unsubscribePush(endpoint: string) {
  return apiFetch('/push/subscribe', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint }),
  });
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export async function enableWebPush(): Promise<'granted' | 'denied' | 'unsupported' | 'unconfigured'> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }

  const { configured, publicKey } = await fetchVapidPublicKey();
  if (!configured || !publicKey) return 'unconfigured';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await subscribePush(sub, navigator.userAgent);
  return 'granted';
}

export async function disableWebPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await unsubscribePush(sub.endpoint);
    await sub.unsubscribe();
  }
}
