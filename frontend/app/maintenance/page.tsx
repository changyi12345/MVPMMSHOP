'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useLang } from '@/lib/useLang';

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('msg');
  const { t } = useLang();

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛠️</div>
        <h1 className="auth-title">{t('maintenanceTitle')}</h1>
        <p style={{ color: 'var(--dark-gray)', marginBottom: 24, lineHeight: 1.6 }}>
          {message || t('maintenanceDefault')}
        </p>
        <Link href="/auth/login" className="btn btn-outline btn-sm">
          {t('adminLogin')}
        </Link>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const { t } = useLang();
  return (
    <Suspense fallback={<div className="auth-page"><p>{t('loading')}</p></div>}>
      <MaintenanceContent />
    </Suspense>
  );
}
