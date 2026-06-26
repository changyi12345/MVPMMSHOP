'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AuthUser, getStoredUser, logout } from '@/lib/api/auth';
import { formatPrice } from '@/lib/format-price';
import { useLang } from '@/lib/useLang';
import { AUTH_CHANGE_EVENT } from '@/lib/use-auth';

export default function UserMenu() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    const refresh = () => setUser(getStoredUser());
    refresh();
    window.addEventListener(AUTH_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) {
    return (
      <Link href="/auth/login" className="header-login-btn">
        {t('login')}
      </Link>
    );
  }

  const handleLogout = () => {
    logout();
    setUser(null);
    setOpen(false);
    window.location.href = '/';
  };

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
        <span className="user-name">{user.username}</span>
        <span className="user-menu-chevron" aria-hidden>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <strong>{user.username}</strong>
            <span>{user.email}</span>
          </div>
          {user.walletBalance != null && (
            <div className="user-menu-wallet">
              💰 {formatPrice(user.walletBalance)}
            </div>
          )}
          <Link href="/profile" className="user-menu-item" onClick={() => setOpen(false)}>
            👤 {t('profile')}
          </Link>
          <Link href="/wallet" className="user-menu-item" onClick={() => setOpen(false)}>
            💰 {t('wallet')}
          </Link>
          <Link href="/orders" className="user-menu-item" onClick={() => setOpen(false)}>
            📦 {t('orders')}
          </Link>
          <Link href="/referral" className="user-menu-item" onClick={() => setOpen(false)}>
            🎁 {t('referral')}
          </Link>
          <button type="button" className="user-menu-item user-menu-logout" onClick={handleLogout}>
            🚪 {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
