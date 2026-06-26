'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useShop } from '@/components/ShopProvider';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLang } from '@/lib/useLang';
import { useAuthUser } from '@/lib/use-auth';

export default function Footer() {
  const shop = useShop();
  const { isLoggedIn } = useAuthUser();
  const { t } = useLang();
  const shopName = shop?.shopName ?? 'MVPMMSHOP';
  const tagline = shop?.shopTagline ?? (t('heroDefaultSubtitle'));
  const logoSrc = resolveMediaUrl(shop?.logoUrl ?? null);
  const telegram = shop?.supportTelegram;
  const liveChat = shop?.liveChatUrl;
  const flags = shop?.featureFlags;
  const phone = shop?.contactPhone;
  const email = shop?.contactEmail;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            {logoSrc ? (
              <Image src={logoSrc} alt={shopName} width={140} height={40} unoptimized className="footer-logo" />
            ) : (
              <div className="footer-title">{shopName}</div>
            )}
            <p style={{ opacity: 0.8, fontSize: 14, marginTop: 12 }}>{tagline}</p>
            {(phone || email) && (
              <p style={{ opacity: 0.75, fontSize: 13, marginTop: 8 }}>
                {phone && <span>{phone}</span>}
                {phone && email && ' · '}
                {email && <span>{email}</span>}
              </p>
            )}
          </div>
          <div>
            <div className="footer-title">{t('quickLinks')}</div>
            {(!flags || flags.gamesTopupEnabled) && (
              <Link href="/games" className="footer-link">{t('games')}</Link>
            )}
            {(!flags || flags.voucherShopEnabled) && (
              <Link href="/vouchers" className="footer-link">{t('vouchers')}</Link>
            )}
            {(!flags || flags.eventsEnabled) && (
              <Link href="/events" className="footer-link">{t('events')}</Link>
            )}
            {isLoggedIn && (
              <>
                <Link href="/orders" className="footer-link">{t('orders')}</Link>
                {(!flags || flags.referralEnabled) && (
                  <Link href="/referral" className="footer-link">{t('referral')}</Link>
                )}
              </>
            )}
          </div>
          <div>
            <div className="footer-title">{t('support')}</div>
            {isLoggedIn && (!flags || flags.walletEnabled) && (
              <Link href="/wallet" className="footer-link">{t('wallet')}</Link>
            )}
            <Link href="/help" className="footer-link">{t('helpTitle')}</Link>
            <Link href="/faq" className="footer-link">{t('faqTitle')}</Link>
            <Link href="/terms" className="footer-link">{t('terms')}</Link>
            <Link href="/privacy" className="footer-link">{t('privacy')}</Link>
            {telegram && (!flags || flags.liveChatEnabled) ? (
              <a href={telegram.startsWith('http') ? telegram : `https://t.me/${telegram.replace('@', '')}`} className="footer-link" target="_blank" rel="noopener noreferrer">
                {t('telegram')}
              </a>
            ) : null}
            {liveChat && flags?.liveChatEnabled !== false ? (
              <a href={liveChat} className="footer-link" target="_blank" rel="noopener noreferrer">
                Live Chat
              </a>
            ) : null}
            {(!telegram || flags?.liveChatEnabled === false) && !liveChat && (
              <span className="footer-link" style={{ opacity: 0.5 }}>{t('telegram')}</span>
            )}
            <Link href="/auth/login" className="footer-link">{t('login')}</Link>
          </div>
          <div>
            <div className="footer-title">{t('paymentMethods')}</div>
            {(shop?.paymentMethods ?? ['KBZ Pay', 'Wave Pay', 'Bank Transfer']).map((method) => (
              <span key={method} className="footer-link" style={{ display: 'block', cursor: 'default' }}>{method}</span>
            ))}
          </div>
        </div>
        <div className="footer-bottom">© 2026 {shopName}. {t('allRights')}</div>
      </div>
    </footer>
  );
}
