import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage, isNetworkError } from '../lib/errors';

export function useApiLoad<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsOffline(false);
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsOffline(isNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, isOffline, reload };
}
