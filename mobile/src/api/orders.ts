import { apiFetch } from './client';
import type { CartItem } from '../lib/cart-store';

export interface OrderItemPayload {
  productId?: number;
  g2bulkProductId?: number;
  g2bulkGameCode?: string;
  gameCode?: string;
  catalogueName?: string;
  packageName?: string;
  unitPrice?: number;
  quantity: number;
  playerId?: string;
  serverId?: string;
  playerName?: string;
}

export interface ApiOrder {
  id: number;
  status: string;
  paymentMethod: string | null;
  quantity: number;
  totalPrice: number | string;
  createdAt: string;
  completedAt?: string | null;
  batchId?: string | null;
  product: { name: string; type: string };
  topUpInput?: {
    gameCode: string;
    playerId: string;
    serverId: string | null;
    playerName: string | null;
    catalogueName: string;
  } | null;
  paymentProof?: { reference: string | null; status: string; imageUrl?: string | null } | null;
  voucherCodes?: { voucherCode: string }[];
}

export interface CreateOrderBatchResult {
  batchId: string;
  primaryOrderId: number;
  orders: ApiOrder[];
  totalPrice: number;
}

export function cartItemsToOrderPayload(items: CartItem[]): OrderItemPayload[] {
  return items.map((item) => ({
    ...(item.productId != null ? { productId: item.productId } : {}),
    ...(item.g2bulkProductId != null ? { g2bulkProductId: item.g2bulkProductId } : {}),
    ...(item.g2bulkGameCode
      ? { g2bulkGameCode: item.g2bulkGameCode, gameCode: item.gameCode ?? item.g2bulkGameCode }
      : {}),
    ...(item.catalogueName
      ? { catalogueName: item.catalogueName, packageName: item.packageName ?? item.catalogueName }
      : {}),
    unitPrice: item.price,
    quantity: item.quantity,
    ...(item.playerId
      ? { playerId: item.playerId, serverId: item.serverId, playerName: item.playerName }
      : {}),
  }));
}

export function fetchMyOrders() {
  return apiFetch<ApiOrder[]>('/orders');
}

export function fetchOrder(id: number) {
  return apiFetch<ApiOrder>(`/orders/${id}`);
}

export function createOrder(payload: {
  items: OrderItemPayload[];
  paymentMethod?: string;
  promoCode?: string;
}) {
  return apiFetch<ApiOrder | CreateOrderBatchResult>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resolvePrimaryOrderId(result: ApiOrder | CreateOrderBatchResult): number {
  if ('primaryOrderId' in result) return result.primaryOrderId;
  return result.id;
}

export function submitPaymentProof(
  orderId: number,
  data: { method: string; reference?: string; note?: string; imageUrl?: string },
) {
  return apiFetch(`/orders/${orderId}/payment-proof`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function cancelOrder(orderId: number) {
  return apiFetch<ApiOrder>(`/orders/${orderId}/cancel`, { method: 'POST' });
}

export function canCancelOrder(status: string, paymentMethod: string | null | undefined) {
  return paymentMethod !== 'wallet' && (status === 'PENDING' || status === 'PAYMENT_PENDING');
}

export function formatOrderId(id: number) {
  return `ORD${String(id).padStart(3, '0')}`;
}
