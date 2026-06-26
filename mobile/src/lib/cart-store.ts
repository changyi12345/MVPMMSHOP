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
}

const CART_KEY = 'mvpmms_mobile_cart';
const PROMO_KEY = 'mvpmms_mobile_checkout_promo';

let memoryCart: CartItem[] = [];

export function readCart(): CartItem[] {
  return memoryCart.map((item) => ({ ...item }));
}

export function writeCart(items: CartItem[]) {
  memoryCart = items.map((item) => ({ ...item }));
}

export function getCartItemCount(): number {
  return memoryCart.reduce((sum, item) => sum + item.quantity, 0);
}

function buildCartKey(item: Omit<CartItem, 'quantity' | 'cartKey'> & { cartKey?: string }): string {
  if (item.cartKey) return item.cartKey;
  if (item.type === 'voucher' && item.g2bulkProductId != null) {
    return `voucher-${item.g2bulkProductId}`;
  }
  return `topup-${item.g2bulkGameCode}-${item.catalogueName}-${item.playerId}`;
}

export function addToCart(item: Omit<CartItem, 'quantity' | 'cartKey'> & { quantity?: number; cartKey?: string }) {
  const cartKey = buildCartKey(item);
  const qty = item.quantity ?? 1;
  const existing = memoryCart.find((c) => c.cartKey === cartKey);
  if (existing) {
    existing.quantity += qty;
  } else {
    memoryCart.push({
      ...item,
      cartKey,
      quantity: qty,
    });
  }
}

export function buyNow(item: Omit<CartItem, 'quantity' | 'cartKey'> & { quantity?: number; cartKey?: string }) {
  clearCart();
  addToCart({ ...item, quantity: item.quantity ?? 1 });
}

export function removeFromCart(cartKey: string) {
  memoryCart = memoryCart.filter((c) => c.cartKey !== cartKey);
}

export function updateCartQuantity(cartKey: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(cartKey);
    return;
  }
  memoryCart = memoryCart.map((c) => (c.cartKey === cartKey ? { ...c, quantity } : c));
}

export function clearCart() {
  memoryCart = [];
}

export function saveCheckoutPromo(code: string, discount: number) {
  // kept in memory for session
  promoStore = { code, discount };
}

let promoStore: { code: string; discount: number } | null = null;

export function readCheckoutPromo() {
  return promoStore;
}

export function clearCheckoutPromo() {
  promoStore = null;
}

export function playerIdFromFields(fields: Record<string, string>): string {
  return (
    fields.userid ??
    fields.user_id ??
    fields.playerid ??
    fields.player_id ??
    fields.uid ??
    Object.values(fields).find((v) => v.trim()) ??
    ''
  );
}

export function serverIdFromFields(fields: Record<string, string>): string | undefined {
  const v =
    fields.serverid ??
    fields.server_id ??
    fields.server ??
    fields.zoneid ??
    fields.zone_id ??
    fields.zone;
  return v?.trim() || undefined;
}
