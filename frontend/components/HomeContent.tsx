'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import GamesGrid from '@/components/GamesGrid';
import VouchersGrid from '@/components/VouchersGrid';
import BannerCarousel from '@/components/BannerCarousel';
import EventsSection from '@/components/EventsSection';
import { useShop } from '@/components/ShopProvider';
import { fetchHomeContent, type HomeContent as HomeContentData } from '@/lib/api/content';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLang } from '@/lib/useLang';

const QUICK_LINKS = [
  { href: '/games', icon: '🎮', labelKey: 'browseGames' as const, descKey: 'gameTopUp' as const, tone: 'violet' },
  { href: '/vouchers', icon: '🎁', labelKey: 'viewVouchers' as const, descKey: 'vouchersGiftCards' as const, tone: 'cyan' },
  { href: '/wallet', icon: '💰', labelKey: 'wallet' as const, descKey: 'featureSecurePayment' as const, tone: 'pink' },
  { href: '/orders', icon: '📦', labelKey: 'orders' as const, descKey: 'featureInstantDelivery' as const, tone: 'amber' },
];

export default function HomeContent() {
  const shop = useShop();
  const { t } = useLang();
  const [content, setContent] = useState<HomeContentData | null>(null);

  useEffect(() => {
    fetchHomeContent().then(setContent).catch(() => setContent(null));
  }, []);

  const shopName = shop?.shopName ?? content?.shopName ?? 'MVPMMSHOP';

  return (
    <PageLayout>
      <div className="home-page">
        <BannerCarousel
          banners={content?.heroBanners ?? []}
          fallbackTitle={content?.shopName ? `${content.shopName} — ${t('gameTopUp')}` : undefined}
          fallbackSubtitle={content?.shopTagline ?? undefined}
        />

        <section className="home-quick-nav">
          <div className="container home-quick-nav-inner">
            {QUICK_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className={`home-quick-card home-quick-card--${item.tone}`}>
                <span className="home-quick-icon">{item.icon}</span>
                <span className="home-quick-label">{t(item.labelKey)}</span>
                <span className="home-quick-desc">{t(item.descKey)}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="container home-body">
          {content && content.midBanners.length > 0 && (
            <div className="home-mid-banners">
              {content.midBanners.map((b) => {
                const img = resolveMediaUrl(b.imageUrl);
                if (!img) return null;
                const el = (
                  <div key={b.id} className="home-mid-banner-item">
                    <Image src={img} alt={b.title} width={1200} height={200} unoptimized className="home-mid-banner-img" />
                  </div>
                );
                return b.linkUrl ? (
                  <Link key={b.id} href={b.linkUrl.startsWith('/') ? b.linkUrl : b.linkUrl}>{el}</Link>
                ) : el;
              })}
            </div>
          )}

          <EventsSection events={content?.events ?? []} />

          <section className="home-section">
            <div className="home-section-head">
              <div>
                <span className="home-section-badge">🔥 Hot</span>
                <h2 className="home-section-title">{t('popularGames')}</h2>
              </div>
              <Link href="/games" className="home-section-link">{t('viewAll')} →</Link>
            </div>
            <div className="home-section-panel">
              <GamesGrid compact />
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-head">
              <div>
                <span className="home-section-badge home-section-badge--cyan">🎁 Deals</span>
                <h2 className="home-section-title">{t('vouchersGiftCards')}</h2>
              </div>
              <Link href="/vouchers" className="home-section-link">{t('viewAll')} →</Link>
            </div>
            <div className="home-section-panel">
              <VouchersGrid compact limit={8} />
            </div>
          </section>

          <section className="home-section">
            <div className="home-section-head home-section-head--center">
              <span className="home-section-badge">✨ Trusted</span>
              <h2 className="home-section-title">{t('whyChoose')} {shopName}</h2>
            </div>
            <div className="home-features">
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
          </section>

          <section className="home-referral-cta">
            <div className="home-referral-glow" aria-hidden />
            <div className="home-referral-content">
              <span className="home-referral-emoji">🎁</span>
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
