'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/useLang';
import { CART_CHANGE_EVENT, getCartItemCount } from '@/lib/cart-store';
import { useShop } from './ShopProvider';
import ShopIcon from './ShopIcon';
import type { FeatureFlags } from '@/lib/feature-flags';

type TabId = 'home' | 'games' | 'vouchers' | 'cart' | 'orders' | 'profile';

type TabItem = {
  id: TabId;
  href: string;
  labelKey: string;
  flag?: keyof FeatureFlags;
};

const TABS: TabItem[] = [
  { id: 'home', href: '/', labelKey: 'home' },
  { id: 'games', href: '/games', labelKey: 'games', flag: 'gamesTopupEnabled' },
  { id: 'vouchers', href: '/vouchers', labelKey: 'vouchers', flag: 'voucherShopEnabled' },
  { id: 'cart', href: '/cart', labelKey: 'cart' },
  { id: 'orders', href: '/orders', labelKey: 'orders' },
  { id: 'profile', href: '/profile', labelKey: 'profile' },
];

const HIDDEN_PREFIXES = ['/admin', '/auth'];

function isHiddenPath(pathname: string): boolean {
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (pathname === '/checkout') return true;
  return false;
}

function isTabActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileTabBar() {
  const pathname = usePathname() ?? '/';
  const { t } = useLang();
  const shop = useShop();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCartCount(getCartItemCount());
    refresh();
    window.addEventListener(CART_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  if (isHiddenPath(pathname)) return null;

  const flags = shop?.featureFlags;
  const visibleTabs = TABS.filter((tab) => {
    if (tab.flag && flags && !flags[tab.flag]) return false;
    return true;
  });

  return (
    <nav className="mobile-tab-bar" aria-label={t('shopMenu')}>
      <div className="mobile-tab-bar-accent" aria-hidden />
      <div className="mobile-tab-bar-inner">
        {visibleTabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`mobile-tab-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={`mobile-tab-icon-wrap${active ? ' active' : ''}`}>
                <ShopIcon name={tab.id} size={22} className="mobile-tab-icon" />
                {tab.id === 'cart' && cartCount > 0 && (
                  <span className="mobile-tab-badge">{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </span>
              <span className="mobile-tab-label">{t(tab.labelKey)}</span>
              {active && <span className="mobile-tab-dot" aria-hidden />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
