'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LangToggle from './LangToggle';
import UserMenu from './UserMenu';
import BrandLogo from './BrandLogo';
import ShopIcon from './ShopIcon';
import { useShop } from './ShopProvider';
import { useLang } from '@/lib/useLang';
import { CART_CHANGE_EVENT, getCartItemCount } from '@/lib/cart-store';
import { useAuthUser } from '@/lib/use-auth';
import { formatPrice } from '@/lib/format-price';
import UserNotificationBell from './UserNotificationBell';
import type { FeatureFlags } from '@/lib/feature-flags';

type NavLink = {
  href: string;
  label: string;
  icon: string;
  authOnly?: boolean;
  flag?: keyof FeatureFlags;
};

export default function Header() {
  const pathname = usePathname();
  const shop = useShop();
  const { user, isLoggedIn } = useAuthUser();
  const { t } = useLang();
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const shopName = shop?.shopName ?? 'MVPMMSHOP';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const allLinks: (NavLink & { flag?: keyof FeatureFlags })[] = [
    { href: '/', label: t('home'), icon: '🏠' },
    { href: '/games', label: t('games'), icon: '🎮', flag: 'gamesTopupEnabled' },
    { href: '/vouchers', label: t('vouchers'), icon: '🎁', flag: 'voucherShopEnabled' },
    { href: '/events', label: t('events'), icon: '📢', flag: 'eventsEnabled' },
    { href: '/wallet', label: t('wallet'), icon: '💰', authOnly: true, flag: 'walletEnabled' },
    { href: '/orders', label: t('orders'), icon: '📦', authOnly: true },
  ];

  const flags = shop?.featureFlags;
  const visibleLinks = allLinks.filter((link) => {
    if (link.authOnly && !isLoggedIn) return false;
    if (link.flag && flags && !flags[link.flag]) return false;
    return true;
  });

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="header-accent" aria-hidden />
      <div className="header-inner">
        <div className="header-logo-center">
          <Link href="/" className="logo" aria-label={shopName}>
            <span className="logo-mark" aria-hidden="true">
              <span className="logo-ring" />
              <span className="logo-ring-glow" />
              <span className="logo-mark-inner">
                <BrandLogo
                  shopLogoUrl={shop?.logoUrl}
                  shopName={shopName}
                  priority
                  variant="mark"
                />
              </span>
            </span>
            <span className="logo-brand">
              <span className="logo-label">{shopName}</span>
              <span className="logo-tagline">Game Top-Up</span>
            </span>
          </Link>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
            >
              <span className="nav-icon" aria-hidden>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="header-toolbar">
          {isLoggedIn && user?.walletBalance != null && (
            <Link href="/wallet" className="header-wallet-chip" title={t('wallet')}>
              <ShopIcon name="wallet" size={16} />
              <span>{formatPrice(user.walletBalance)}</span>
            </Link>
          )}
          <LangToggle compact />
          {isLoggedIn && <UserNotificationBell inHeader />}
          <Link href="/cart" className="header-icon-btn header-cart-btn" aria-label={t('cart')}>
            <ShopIcon name="cart" size={20} />
            {cartCount > 0 && <span className="header-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </Link>
          {!isLoggedIn && (
            <Link href="/auth/login" className="header-icon-btn header-login-icon" aria-label={t('login')}>
              <ShopIcon name="profile" size={20} />
            </Link>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
