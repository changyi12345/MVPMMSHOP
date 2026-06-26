import { apiFetch } from './client';
import { getStoredUser, refreshStoredUser } from './auth';

export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  description: string | null;
  reference?: string | null;
  proofImageUrl?: string | null;
  createdAt: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

export const WALLET_TOPUP_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

export function fetchWallet() {
  return apiFetch<WalletData>('/wallet');
}

export function requestTopUp(
  amount: number,
  paymentMethod: string,
  reference?: string,
  proofImageUrl?: string,
) {
  return apiFetch<{ id: number; status: string; amount: number; message: string }>('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ amount, paymentMethod, reference, proofImageUrl }),
  });
}

/** Fetch wallet and sync balance into localStorage user (updates header chip). */
export async function fetchWalletAndSync(): Promise<WalletData> {
  const data = await fetchWallet();
  const user = getStoredUser();
  if (user) {
    refreshStoredUser({ ...user, walletBalance: data.balance });
  }
  return data;
}
