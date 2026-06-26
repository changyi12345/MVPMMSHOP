'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredUser, logout } from '@/lib/api/auth';
import { useAdminNotifications } from '@/components/AdminNotificationProvider';
import { useAdminLang } from '@/lib/useAdminLang';

const navItems = [
  { href: '/admin/dashboard', labelKey: 'dashboard', icon: '📊', badge: null as 'orders' | 'wallet' | null },
  { href: '/admin/products', labelKey: 'products', icon: '🎮', badge: null },
  { href: '/admin/content', labelKey: 'contentAds', icon: '🖼️', badge: null },
  { href: '/admin/orders', labelKey: 'orders', icon: '📦', badge: 'orders' as const },
  { href: '/admin/wallet', labelKey: 'wallet', icon: '💳', badge: 'wallet' as const },
  { href: '/admin/users', labelKey: 'users', icon: '👥', badge: null },
  { href: '/admin/notifications', labelKey: 'sendNotifications', icon: '📣', badge: null },
  { href: '/admin/referrals', labelKey: 'referrals', icon: '🎁', badge: null },
  { href: '/admin/promos', labelKey: 'promos', icon: '🏷️', badge: null },
  { href: '/admin/reports', labelKey: 'reports', icon: '📈', badge: null },
  { href: '/admin/activity', labelKey: 'activity', icon: '📋', badge: null },
  { href: '/admin/g2bulk', labelKey: 'g2bulk', icon: '🔌', badge: null },
  { href: '/admin/settings', labelKey: 'settings', icon: '⚙️', badge: null },
  { href: '/admin/profile', labelKey: 'profile', icon: '👤', badge: null },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  const { pendingOrders, pendingWalletTopups } = useAdminNotifications();
  const { t } = useAdminLang();

  const handleLogout = () => {
    logout();
    onClose?.();
    router.push('/admin/login');
  };

  const badgeCount = (type: 'orders' | 'wallet' | null) => {
    if (type === 'orders') return pendingOrders;
    if (type === 'wallet') return pendingWalletTopups;
    return 0;
  };

  return (
    <>
      <button
        type="button"
        className={`admin-sidebar-backdrop ${open ? 'visible' : ''}`}
        aria-label="Close menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-top">
          <div className="admin-logo">{t('adminPanel')}</div>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => {
            const count = badgeCount(item.badge);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={onClose}
              >
                <span aria-hidden>{item.icon}</span>
                <span className="admin-nav-label">{t(item.labelKey)}</span>
                {count > 0 && (
                  <span className="admin-nav-badge">{count > 99 ? '99+' : count}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          {user && (
            <div className="admin-sidebar-user">
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.username}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{user.email}</div>
            </div>
          )}
          <button type="button" className="admin-nav-link admin-nav-logout" onClick={handleLogout}>
            🚪 {t('logout')}
          </button>
          <Link href="/" className="admin-nav-link admin-nav-back" onClick={onClose}>
            ← {t('backToShop')}
          </Link>
        </div>
      </aside>
    </>
  );
}
