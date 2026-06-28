'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useLang } from '@/lib/useLang';

type BadgeTone = 'default' | 'cyan' | 'amber' | 'violet';

type Props = {
  badge: string;
  badgeTone?: BadgeTone;
  title: string;
  viewAllHref?: string;
  centered?: boolean;
  scrollable?: boolean;
  children: ReactNode;
};

export default function HomeSection({
  badge,
  badgeTone = 'default',
  title,
  viewAllHref,
  centered,
  scrollable = true,
  children,
}: Props) {
  const { t } = useLang();
  const badgeClass =
    badgeTone === 'default'
      ? 'home-section-badge'
      : `home-section-badge home-section-badge--${badgeTone}`;

  return (
    <section className="home-section">
      <div className={`home-section-head${centered ? ' home-section-head--center' : ''}`}>
        <div>
          <span className={badgeClass}>{badge}</span>
          <h2 className="home-section-title">{title}</h2>
        </div>
        {viewAllHref && !centered && (
          <Link href={viewAllHref} className="home-section-link">
            {t('viewAll')} →
          </Link>
        )}
      </div>
      <div className={`home-scroll-wrap${scrollable ? ' home-scroll-wrap--fade' : ''}`}>
        <div className="home-section-scroll cards-scroll-host">{children}</div>
      </div>
    </section>
  );
}
