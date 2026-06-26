const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

import type { FeatureFlags } from '../feature-flags';
import { DEFAULT_FEATURE_FLAGS } from '../feature-flags';

export interface PaymentAccount {
  id: string;
  name: string;
  accountNumber: string;
  accountHolder: string;
  enabled?: boolean;
}

export interface PublicShopInfo {
  shopName: string;
  shopTagline: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  supportTelegram: string | null;
  liveChatUrl: string | null;
  paymentMethods: string[];
  paymentAccounts: PaymentAccount[];
  minWalletTopup: number;
  logoUrl: string | null;
  faviconUrl: string | null;
  featureFlags: FeatureFlags;
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
}

export async function fetchShopInfo(): Promise<PublicShopInfo> {
  const res = await fetch(`${API_BASE}/settings/shop`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load shop info');
  const data = await res.json();
  return {
    ...data,
    featureFlags: { ...DEFAULT_FEATURE_FLAGS, ...data.featureFlags },
  };
}
