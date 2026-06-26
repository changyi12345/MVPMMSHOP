'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShopBanner } from '@/lib/api/content';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLang } from '@/lib/useLang';

interface Props {
  banners: ShopBanner[];
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export default function BannerCarousel({ banners, fallbackTitle, fallbackSubtitle }: Props) {
  const [index, setIndex] = useState(0);
  const { t } = useLang();

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="home-hero">
        <div className="home-hero-bg" aria-hidden />
        <div className="container home-hero-inner">
          <span className="home-hero-badge">⚡ {t('gameTopUp')}</span>
          <h1 className="home-hero-title">{fallbackTitle ?? t('heroDefaultTitle')}</h1>
          <p className="home-hero-subtitle">{fallbackSubtitle ?? t('heroDefaultSubtitle')}</p>
          <div className="home-hero-actions">
            <Link href="/games" className="btn btn-home-primary">{t('browseGames')}</Link>
            <Link href="/vouchers" className="btn btn-home-outline">{t('viewVouchers')}</Link>
          </div>
        </div>
      </section>
    );
  }

  const banner = banners[index];
  const img = resolveMediaUrl(banner.imageUrl);

  const inner = (
    <div className="hero-banner-slide">
      {img ? (
        <Image src={img} alt={banner.title} fill className="hero-banner-img" unoptimized priority />
      ) : null}
      <div className="hero-banner-overlay home-hero-overlay">
        <h1 className="home-hero-title">{banner.title}</h1>
        {banner.linkUrl && <span className="btn btn-home-primary btn-sm" style={{ marginTop: 12 }}>{t('learnMore')} →</span>}
      </div>
    </div>
  );

  return (
    <section className="home-hero home-hero--banner">
      {banner.linkUrl ? (
        <Link href={banner.linkUrl.startsWith('/') ? banner.linkUrl : banner.linkUrl} className="hero-banner-link">
          {inner}
        </Link>
      ) : inner}
      {banners.length > 1 && (
        <div className="hero-dots">
          {banners.map((b, i) => (
            <button key={b.id} type="button" className={`hero-dot ${i === index ? 'active' : ''}`} aria-label={`Slide ${i + 1}`} onClick={() => setIndex(i)} />
          ))}
        </div>
      )}
    </section>
  );
}
