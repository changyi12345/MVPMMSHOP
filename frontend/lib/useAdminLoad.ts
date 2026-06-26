'use client';

import { useCallback, useEffect, useState } from 'react';

export function useAdminLoad<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setError(msg.includes('fetch') || msg.includes('Failed to fetch')
        ? 'Backend server မချိတ်နိုင်ပါ — port 4000 မှာ backend run ထားပါ'
        : msg);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}
