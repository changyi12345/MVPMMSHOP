'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthUser } from '@/lib/use-auth';
import { fetchWalletAndSync, WalletData, WalletTransaction } from '@/lib/api/wallet';

export function useWallet() {
  const { isLoggedIn, ready } = useAuthUser();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isLoggedIn) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const wallet = await fetchWalletAndSync();
      setData(wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!ready) return;
    reload();
  }, [ready, reload]);

  return {
    balance: data?.balance ?? 0,
    transactions: (data?.transactions ?? []) as WalletTransaction[],
    loading,
    error,
    reload,
  };
}
