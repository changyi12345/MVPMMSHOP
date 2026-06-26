export type CartItemType = 'direct_topup' | 'voucher';

export interface CartItem {
  cartKey: string;
  type: CartItemType;
  name: string;
  price: number;
  quantity: number;
  productId?: number;
  g2bulkGameCode?: string;
  g2bulkProductId?: number;
  catalogueName?: string;
  packageName?: string;
  playerId?: string;
  serverId?: string;
  playerName?: string;
  gameCode?: string;
  playerInfo?: string;
}

const CART_KEY = 'mvpmms_cart';
const PROMO_KEY = 'mvpmms_checkout_promo';
export const CART_CHANGE_EVENT = 'cartchange';

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

export function getCartItemCount(): number {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCart(item: Omit<CartItem, 'quantity' | 'cartKey'> & { quantity?: number; cartKey?: string }) {
  const cartKey =
    item.cartKey ??
    (item.type === 'voucher'
      ? `voucher-${item.g2bulkProductId}`
      : `topup-${item.g2bulkGameCode}-${item.catalogueName}-${item.playerId}`);
  const quantity = item.quantity ?? 1;
  const items = readCart();
  const existing = items.find((i) => i.cartKey === cartKey);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ ...item, cartKey, quantity });
  }
  writeCart(items);
}

export function buyNow(item: Omit<CartItem, 'quantity' | 'cartKey'> & { quantity?: number; cartKey?: string }) {
  const cartKey =
    item.cartKey ??
    (item.type === 'voucher'
      ? `voucher-${item.g2bulkProductId}`
      : `topup-${item.g2bulkGameCode}-${item.catalogueName}-${item.playerId}`);
  writeCart([{ ...item, cartKey, quantity: item.quantity ?? 1 }]);
}

export function clearCart() {
  writeCart([]);
}

export function saveCheckoutPromo(code: string, discount: number) {
  sessionStorage.setItem(PROMO_KEY, JSON.stringify({ code, discount }));
}

export function readCheckoutPromo(): { code: string; discount: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PROMO_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { code: string; discount: number };
  } catch {
    return null;
  }
}

export function clearCheckoutPromo() {
  sessionStorage.removeItem(PROMO_KEY);
}

export function playerIdFromFields(fields: Record<string, string>): string {
  return (
    fields.userid?.trim() ||
    fields.user_id?.trim() ||
    fields.player_id?.trim() ||
    fields.roleid?.trim() ||
    fields.role_id?.trim() ||
    ''
  );
}

export function serverIdFromFields(fields: Record<string, string>): string | undefined {
  const v =
    fields.serverid?.trim() ||
    fields.server_id?.trim() ||
    fields.server?.trim() ||
    fields.zoneid?.trim() ||
    fields.zone_id?.trim() ||
    fields.zone?.trim();
  return v || undefined;
}

export function formatPlayerInfo(fields: Record<string, string>, playerName?: string): string {
  const parts: string[] = [];
  if (playerName) parts.push(playerName);
  const pid = playerIdFromFields(fields);
  if (pid) parts.push(`ID: ${pid}`);
  const sid = serverIdFromFields(fields);
  if (sid) parts.push(`Server: ${sid}`);
  return parts.join(' · ') || pid;
}
