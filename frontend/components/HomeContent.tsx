'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import GamesGrid from '@/components/GamesGrid';
import VouchersGrid from '@/components/VouchersGrid';
import BannerCarousel from '@/components/BannerCarousel';
import EventsSection from '@/components/EventsSection';
import HomeSection from '@/components/HomeSection';
import { useShop } from '@/components/ShopProvider';
import { BRAND } from '@/lib/branding';
import { fetchHomeContent, type HomeContent as HomeContentData } from '@/lib/api/content';
import { useLang } from '@/lib/useLang';
import ShopIcon from '@/components/ShopIcon';

const QUICK_LINKS = [
  { href: '/games', icon: 'games' as const, labelKey: 'browseGames' as const, tone: 'violet' },
  { href: '/vouchers', icon: 'vouchers' as const, labelKey: 'viewVouchers' as const, tone: 'cyan' },
  { href: '/wallet', icon: 'wallet' as const, labelKey: 'wallet' as const, tone: 'pink' },
  { href: '/orders', icon: 'orders' as const, labelKey: 'orders' as const, tone: 'amber' },
];

export default function HomeContent() {
  const shop = useShop();
  const { t } = useLang();
  const [content, setContent] = useState<HomeContentData | null>(null);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    fetchHomeContent()
      .then(setContent)
      .catch(() => setContent(null))
      .finally(() => setContentLoading(false));
  }, []);

  const shopName = shop?.shopName ?? content?.shopName ?? BRAND.name;
  const tagline = shop?.shopTagline ?? content?.shopTagline ?? t('heroDefaultSubtitle');
  const paymentMethods = shop?.paymentMethods ?? ['KBZ Pay', 'Wave Pay', 'Bank Transfer'];

  return (
    <PageLayout>
      <div className="home-page">
        <BannerCarousel banners={content?.heroBanners ?? []} />

        <section className="home-intro" aria-label={t('home')}>
          <div className="container home-intro-inner">
            <div className="home-intro-copy">
              <p className="home-intro-kicker">{t('fastSafeTrusted')}</p>
              <h1 className="home-intro-title">{shopName}</h1>
              <p className="home-intro-tagline">{tagline}</p>
            </div>
            <div className="home-intro-actions">
              <Link href="/games" className="btn home-intro-btn home-intro-btn--primary">
                {t('topUpNow')}
              </Link>
              <Link href="/vouchers" className="btn home-intro-btn home-intro-btn--secondary">
                {t('viewVouchers')}
              </Link>
            </div>
          </div>
        </section>

        <section className="home-quick-nav" aria-label="Quick links">
          <div className="container">
            <div className="home-quick-nav-inner">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`home-quick-card home-quick-card--${item.tone}`}
                >
                  <span className={`home-quick-icon home-quick-icon--${item.tone}`} aria-hidden>
                    <ShopIcon name={item.icon} size={22} />
                  </span>
                  <span className="home-quick-label">{t(item.labelKey)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="container home-body">
          <HomeSection badge="🔥 Hot" title={t('popularGames')} viewAllHref="/games">
            <GamesGrid compact home popular limit={12} />
          </HomeSection>

          <HomeSection
            badge="🎁 Deals"
            badgeTone="cyan"
            title={t('vouchersGiftCards')}
            viewAllHref="/vouchers"
          >
            <VouchersGrid compact home limit={8} />
          </HomeSection>

          {!contentLoading && <EventsSection events={content?.events ?? []} />}

          <HomeSection
            badge="✨ Trusted"
            title={`${t('whyChoose')} ${shopName}`}
            centered
            scrollable={false}
          >
            <div className="home-features cards-scroll-mobile">
              <div className="home-feature-card">
                <div className="home-feature-icon home-feature-icon--violet">⚡</div>
                <div className="home-feature-title">{t('featureInstantDelivery')}</div>
                <p className="home-feature-desc">{t('featureInstantDesc')}</p>
              </div>
              <div className="home-feature-card">
                <div className="home-feature-icon home-feature-icon--cyan">🔒</div>
                <div className="home-feature-title">{t('featureSecurePayment')}</div>
                <p className="home-feature-desc">{t('featureSecureDesc')}</p>
              </div>
              <div className="home-feature-card">
                <div className="home-feature-icon home-feature-icon--pink">💬</div>
                <div className="home-feature-title">{t('featureSupport')}</div>
                <p className="home-feature-desc">{t('featureSupportDesc')}</p>
              </div>
            </div>
          </HomeSection>

          <div className="home-trust-bar">
            <div className="home-trust-icon" aria-hidden>🛡️</div>
            <div className="home-trust-content">
              <span className="home-trust-label">{t('paymentMethods')}</span>
              <div className="home-trust-pills">
                {paymentMethods.map((method) => (
                  <span key={method} className="home-trust-pill">{method}</span>
                ))}
              </div>
            </div>
          </div>

          <section className="home-referral-cta">
            <div className="home-referral-glow" aria-hidden />
            <div className="home-referral-content">
              <span className="home-referral-emoji" aria-hidden>🎁</span>
              <div>
                <h3 className="home-referral-title">{t('referEarn')}</h3>
                <p className="home-referral-desc">{t('referEarnDesc')}</p>
              </div>
            </div>
            <Link href="/referral" className="btn btn-home-cta">{t('getReferralCode')}</Link>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
