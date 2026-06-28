import { apiFetch } from './client';
import { CACHE_TTL_MS, cacheGet, cacheSet } from '../lib/cache';

export interface PaymentAccount {
  id: string;
  name: string;
  accountNumber: string;
  accountHolder: string;
}

export interface ShopInfo {
  shopName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  shopTagline?: string | null;
  paymentMethods: string[];
  paymentAccounts: PaymentAccount[];
  minWalletTopup: number;
  contactPhone: string | null;
  supportTelegram: string | null;
  featureFlags?: {
    smsOtpEnabled?: boolean;
    userOrderCancelEnabled?: boolean;
    registrationEnabled?: boolean;
    googleLoginEnabled?: boolean;
  };
}

const SHOP_CACHE_KEY = 'shop_settings';

export async function fetchShopSettings(): Promise<ShopInfo> {
  try {
    const data = await apiFetch<ShopInfo>('/settings/shop');
    cacheSet(SHOP_CACHE_KEY, data, CACHE_TTL_MS);
    return data;
  } catch (err) {
    const cached = cacheGet<ShopInfo>(SHOP_CACHE_KEY);
    if (cached) return cached;
    throw err;
  }
}

export function getCachedShopSettings(): ShopInfo | null {
  return cacheGet<ShopInfo>(SHOP_CACHE_KEY);
}

export function paymentId(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('kbz')) return 'kbz';
  if (lower.includes('wave')) return 'wave';
  if (lower.includes('bank')) return 'bank';
  return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other';
}

export function resolvePaymentMethods(shop: ShopInfo) {
  if (shop.paymentAccounts?.length) {
    return shop.paymentAccounts.map((a) => ({
      id: a.id || paymentId(a.name),
      name: a.name,
      accountNumber: a.accountNumber,
      accountHolder: a.accountHolder,
    }));
  }
  return (shop.paymentMethods ?? ['KBZ Pay', 'Wave Pay', 'Bank Transfer']).map((name) => ({
    id: paymentId(name),
    name,
    accountNumber: shop.contactPhone ?? '—',
    accountHolder: shop.shopName,
  }));
}
