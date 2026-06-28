'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { BRAND } from '@/lib/branding';
import { useLang } from '@/lib/useLang';

type Props = {
  message?: string | null;
};

export default function MaintenanceOverlay({ message }: Props) {
  const { t } = useLang();

  return (
    <div className="maintenance-overlay" role="dialog" aria-modal="true" aria-labelledby="maintenance-title">
      <div className="maintenance-overlay-backdrop" aria-hidden />
      <div className="maintenance-overlay-glow maintenance-bg-glow--one" aria-hidden />
      <div className="maintenance-overlay-glow maintenance-bg-glow--two" aria-hidden />

      <div className="maintenance-card maintenance-card--overlay">
        <div className="maintenance-logo">
          <span className="logo-mark" aria-hidden="true">
            <span className="logo-ring" />
            <span className="logo-ring-glow" />
            <span className="logo-mark-inner">
              <BrandLogo shopName={BRAND.name} priority variant="mark" />
            </span>
          </span>
          <span className="maintenance-shop-name">{BRAND.name}</span>
        </div>

        <div className="maintenance-icon-wrap" aria-hidden>
          <span className="maintenance-ring" />
          <span className="maintenance-ring maintenance-ring--delay" />
          <span className="maintenance-icon">🛠️</span>
        </div>

        <span className="maintenance-badge">{t('maintenanceBadge')}</span>
        <h1 id="maintenance-title" className="maintenance-title">
          {t('maintenanceTitle')}
        </h1>
        <p className="maintenance-subtitle">{t('maintenanceSubtitle')}</p>

        <div className="maintenance-message-box">
          <p>{message || t('maintenanceDefault')}</p>
        </div>

        <div className="maintenance-status" aria-live="polite">
          <span className="maintenance-pulse" aria-hidden />
          <span>{t('maintenanceBackSoon')}</span>
        </div>

        <Link href="/auth/login" className="maintenance-admin-link">
          {t('adminLogin')} →
        </Link>
      </div>
    </div>
  );
}
