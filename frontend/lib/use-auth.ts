'use client';

import { useEffect, useState } from 'react';
import { AuthUser, getStoredUser } from '@/lib/api/auth';

export const AUTH_CHANGE_EVENT = 'authchange';

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setUser(getStoredUser());
      setReady(true);
    };
    refresh();
    window.addEventListener(AUTH_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return { user, isLoggedIn: !!user, ready };
}
