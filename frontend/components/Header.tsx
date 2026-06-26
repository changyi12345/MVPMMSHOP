'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LangToggle from './LangToggle';
import UserMenu from './UserMenu';
import { useShop } from './ShopProvider';
import { useLang } from '@/lib/useLang';
import { resolveMediaUrl } from '@/lib/media-url';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const shopName = shop?.shopName ?? 'MVPMMSHOP';
  const logoSrc = resolveMediaUrl(shop?.logoUrl ?? null);

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
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo" onClick={closeMenu}>
          {logoSrc ? (
            <Image src={logoSrc} alt={shopName} width={140} height={40} unoptimized className="logo-image" />
          ) : (
            <span className="logo-text">{shopName}</span>
          )}
        </Link>

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
              <span aria-hidden>💰</span>
              <span>{formatPrice(user.walletBalance)}</span>
            </Link>
          )}
          <LangToggle />
          {isLoggedIn && <UserNotificationBell />}
          <Link href="/cart" className="header-cart-btn" aria-label={t('cart')}>
            <span aria-hidden>🛒</span>
            {cartCount > 0 && <span className="header-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </Link>
          <UserMenu />
          <button
            type="button"
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`mobile-nav-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} aria-hidden={!menuOpen} />
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation">
        <div className="mobile-nav-section">
          <p className="mobile-nav-label">{t('shopMenu')}</p>
          {allLinks.filter((l) => !l.authOnly).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-nav-link ${isActive(link.href) ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon" aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className={`mobile-nav-link ${isActive('/cart') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-icon" aria-hidden>🛒</span>
            {t('cart')}
            {cartCount > 0 && <span className="mobile-nav-badge">{cartCount}</span>}
          </Link>
        </div>

        <div className="mobile-nav-section">
          <p className="mobile-nav-label">{t('accountMenu')}</p>
          {isLoggedIn ? (
            <>
              {user?.walletBalance != null && (
                <div className="mobile-nav-wallet">
                  💰 {formatPrice(user.walletBalance)}
                </div>
              )}
              <Link href="/wallet" className={`mobile-nav-link ${isActive('/wallet') ? 'active' : ''}`} onClick={closeMenu}>
                <span className="nav-icon" aria-hidden>💰</span>
                {t('wallet')}
              </Link>
              <Link href="/orders" className={`mobile-nav-link ${isActive('/orders') ? 'active' : ''}`} onClick={closeMenu}>
                <span className="nav-icon" aria-hidden>📦</span>
                {t('orders')}
              </Link>
              <Link href="/notifications" className={`mobile-nav-link ${isActive('/notifications') ? 'active' : ''}`} onClick={closeMenu}>
                <span className="nav-icon" aria-hidden>🔔</span>
                {t('notifications')}
              </Link>
              <Link href="/profile" className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={closeMenu}>
                <span className="nav-icon" aria-hidden>👤</span>
                {t('profile')}
              </Link>
              <Link href="/referral" className={`mobile-nav-link ${isActive('/referral') ? 'active' : ''}`} onClick={closeMenu}>
                <span className="nav-icon" aria-hidden>🎁</span>
                {t('referral')}
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="mobile-nav-link mobile-nav-cta" onClick={closeMenu}>
                {t('login')}
              </Link>
              <Link href="/auth/register" className="mobile-nav-link" onClick={closeMenu}>
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
