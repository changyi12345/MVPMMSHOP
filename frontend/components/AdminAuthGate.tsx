'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { fetchProfile, getStoredUser, isAdmin, logout } from '@/lib/api/auth';

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const stored = getStoredUser();
      const token = localStorage.getItem('access_token');
      if (!stored?.id || !token) {
        logout();
        router.replace('/admin/login');
        return;
      }

      if (!isAdmin(stored)) {
        logout();
        router.replace('/admin/login?error=not_admin');
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);

      try {
        const profile = await fetchProfile(controller.signal);
        if (cancelled) return;
        if (!isAdmin(profile)) {
          logout();
          router.replace('/admin/login?error=not_admin');
          return;
        }
        localStorage.setItem('user', JSON.stringify(profile));
        setReady(true);
      } catch {
        if (!cancelled) {
          logout();
          router.replace('/admin/login');
        }
      } finally {
        window.clearTimeout(timeout);
      }
    }

    check();
    return () => { cancelled = true; };
  }, [router]);

  if (!ready) {
    return (
      <div className="admin-layout" style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--dark-gray)' }}>Checking admin access...</p>
      </div>
    );
  }

  return children;
}
