'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { verifyEmail } from '@/lib/api/auth';
import { useLang } from '@/lib/useLang';
import PageMeta from '@/components/PageMeta';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('invalidVerifyToken'));
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setStatus('ok');
        setMessage(res.message ?? t('emailVerified'));
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : t('networkError'));
      });
  }, [token, t]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">MVPMMSHOP</div>
        <h2 className="auth-title">{t('verifyEmail')}</h2>
        {status === 'loading' && <p>{t('loading')}</p>}
        {status === 'ok' && (
          <>
            <p style={{ color: 'var(--green)' }}>✓ {message}</p>
            <button type="button" className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={() => router.push('/auth/login')}>
              {t('login')}
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="form-error">{message}</p>
            <Link href="/auth/login" className="auth-link">{t('backToLogin')}</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const { t } = useLang();
  return (
    <>
      <PageMeta title={t('verifyEmail')} />
      <Suspense fallback={<div className="auth-page"><p>{t('loading')}</p></div>}>
        <VerifyForm />
      </Suspense>
    </>
  );
}
