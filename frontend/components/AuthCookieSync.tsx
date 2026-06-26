'use client';

import { useEffect } from 'react';
import { getStoredUser } from '@/lib/api/auth';
import { setAuthCookies } from '@/lib/auth-cookies';

/** Sync localStorage auth to cookies so middleware can read session */
export default function AuthCookieSync() {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = getStoredUser();
    if (token && user) {
      setAuthCookies(token, user.role);
    }
  }, []);

  return null;
}
