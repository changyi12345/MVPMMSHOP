'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShopBanner } from '@/lib/api/content';
import { DEFAULT_HERO_BANNERS, isBrandAssetUrl } from '@/lib/branding';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLang } from '@/lib/useLang';

interface Props {
  banners: ShopBanner[];
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

function isPromoBanner(banner: ShopBanner): boolean {
  return banner.id < 0 || isBrandAssetUrl(banner.imageUrl);
}

export default function BannerCarousel({ banners }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const { t } = useLang();

  const slides = useMemo(
    () => (banners.length > 0 ? banners : DEFAULT_HERO_BANNERS),
    [banners],
  );

  const promo = slides.some(isPromoBanner);
  const total = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (total <= 1) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 6000);
    return () => clearInterval(id);
  }, [total, paused]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || total <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    if (Math.abs(delta) > 48) {
      goTo(delta > 0 ? index + 1 : index - 1);
    }
    touchStartX.current = null;
  };

  const banner = slides[index];
  const img = resolveMediaUrl(banner.imageUrl);
  const slidePromo = isPromoBanner(banner);

  const slideInner = (
    <div
      key={banner.id}
      className={`hero-banner-slide${slidePromo ? ' hero-banner-slide--promo' : ''} ${
        slidePromo ? 'hero-banner-slide--animate-promo' : 'hero-banner-slide--animate'
      }`}
    >
      {img ? (
        slidePromo ? (
          <div className="hero-banner-promo-wrap">
            <Image
              src={img}
              alt={banner.title}
              width={1600}
              height={900}
              className="hero-banner-promo-img"
              unoptimized
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ) : (
          <Image
            src={img}
            alt={banner.title}
            fill
            className="hero-banner-img"
            unoptimized
            priority={index === 0}
            sizes="100vw"
          />
        )
      ) : null}
      {!slidePromo && (
        <div className="hero-banner-overlay home-hero-overlay">
          <h1 className="home-hero-title">{banner.title}</h1>
          {banner.linkUrl && (
            <span className="btn btn-home-primary btn-sm hero-banner-cta">
              {t('learnMore')} →
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section
      className={`home-hero home-hero--banner${promo ? ' home-hero--promo' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={t('home')}
      aria-roledescription="carousel"
    >
      <div className="hero-carousel">
        {banner.linkUrl ? (
          <Link
            href={banner.linkUrl.startsWith('/') ? banner.linkUrl : banner.linkUrl}
            className="hero-banner-link"
            aria-label={banner.title}
          >
            {slideInner}
          </Link>
        ) : (
          slideInner
        )}

        {total > 1 && promo && (
          <>
            <button
              type="button"
              className="hero-nav hero-nav--prev"
              aria-label="Previous slide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goPrev();
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className="hero-nav hero-nav--next"
              aria-label="Next slide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goNext();
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className={`hero-carousel-ui${promo ? ' hero-carousel-ui--promo' : ''}`}>
          <div className={`hero-dots${promo ? ' hero-dots--promo' : ''}`} role="tablist" aria-label="Banner slides">
            {slides.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${b.title} (${i + 1} / ${total})`}
                className={`hero-dot${promo ? ' hero-dot--promo' : ''} ${i === index ? 'active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          {promo && (
            <span className="hero-slide-count" aria-live="polite">
              {index + 1} / {total}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
