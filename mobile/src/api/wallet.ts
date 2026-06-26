import { apiFetch } from './client';

export interface WalletData {
  balance: number;
  transactions: {
    id: number;
    type: string;
    amount: number;
    balanceAfter: number;
    status: string;
    description: string | null;
    createdAt: string;
  }[];
}

export function fetchWallet() {
  return apiFetch<WalletData>('/wallet');
}

export function requestTopUp(amount: number, paymentMethod: string, reference?: string) {
  return apiFetch<{ id: number; status: string; amount: number; message: string }>('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ amount, paymentMethod, reference }),
  });
}

export const WALLET_TOPUP_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];
