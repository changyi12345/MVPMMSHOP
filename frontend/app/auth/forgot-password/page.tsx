'use client';

import Link from 'next/link';
import { useState } from 'react';
import { forgotPassword } from '@/lib/api/auth';
import AuthBrandLogo from '@/components/AuthBrandLogo';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';
import PageMeta from '@/components/PageMeta';

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
      showToast(t('resetEmailSent'), 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('networkError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title={t('forgotPassword')} />
      <div className="auth-page">
        <div className="auth-card">
          <AuthBrandLogo />
          <h2 className="auth-title">{t('forgotPassword')}</h2>
          {sent ? (
            <p>{t('resetEmailSent')}</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">{t('email')}</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder={t('enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? t('submitting') : t('sendResetLink')}
              </button>
            </form>
          )}
          <p className="auth-footer">
            <Link href="/auth/login" className="auth-link">{t('backToLogin')}</Link>
          </p>
        </div>
      </div>
    </>
  );
}
