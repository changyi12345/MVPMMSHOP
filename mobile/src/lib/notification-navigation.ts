/** Map web-style notification URLs to in-app navigation hints. */
export type NotificationNavTarget =
  | { kind: 'order'; id: string }
  | { kind: 'wallet' }
  | { kind: 'wallet-topup' }
  | { kind: 'orders-tab' }
  | { kind: 'profile-tab' }
  | { kind: 'cart-tab' }
  | { kind: 'events' }
  | { kind: 'event'; slug: string }
  | { kind: 'referral' };

export function parseNotificationUrl(url: string | null | undefined): NotificationNavTarget | null {
  if (!url?.trim()) return null;

  let path = url.trim();
  try {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      path = new URL(path).pathname;
    }
  } catch {
    return null;
  }

  if (!path.startsWith('/')) path = `/${path}`;

  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'orders' && parts[1]) {
    return { kind: 'order', id: parts[1] };
  }
  if (parts[0] === 'orders') return { kind: 'orders-tab' };
  if (parts[0] === 'wallet' && parts[1] === 'topup') return { kind: 'wallet-topup' };
  if (parts[0] === 'wallet') return { kind: 'wallet' };
  if (parts[0] === 'profile') return { kind: 'profile-tab' };
  if (parts[0] === 'cart') return { kind: 'cart-tab' };
  if (parts[0] === 'events' && parts[1]) return { kind: 'event', slug: parts[1] };
  if (parts[0] === 'events') return { kind: 'events' };
  if (parts[0] === 'referral') return { kind: 'referral' };

  return null;
}
