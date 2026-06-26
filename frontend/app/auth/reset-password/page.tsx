'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { resetPassword } from '@/lib/api/auth';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';
import PageMeta from '@/components/PageMeta';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { t } = useLang();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      showToast(t('passwordMismatch'), 'error');
      return;
    }
    if (!token) {
      showToast(t('invalidResetToken'), 'error');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      showToast(t('passwordResetSuccess'), 'success');
      router.push('/auth/login');
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('networkError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">MVPMMSHOP</div>
        <h2 className="auth-title">{t('resetPassword')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-pw">{t('newPassword')}</label>
            <input
              id="new-pw"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-pw">{t('confirmPassword')}</label>
            <input
              id="confirm-pw"
              type="password"
              className="form-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !token}>
            {loading ? t('updating') : t('resetPassword')}
          </button>
        </form>
        <p className="auth-footer">
          <Link href="/auth/login" className="auth-link">{t('backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLang();
  return (
    <>
      <PageMeta title={t('resetPassword')} />
      <Suspense fallback={<div className="auth-page"><p>{t('loading')}</p></div>}>
        <ResetForm />
      </Suspense>
    </>
  );
}
