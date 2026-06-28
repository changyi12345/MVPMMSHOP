'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import {
  loginUser,
  saveAuth,
  isAdmin,
  is2FALogin,
  verifyAdmin2FA,
} from '@/lib/api/auth';
import { useToast } from '@/components/Toast';
import AuthBrandLogo from '@/components/AuthBrandLogo';
import { useAdminLang } from '@/lib/useAdminLang';

function AdminLoginForm() {
  const { t } = useAdminLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const notAdmin = searchParams.get('error') === 'not_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginUser({ username: username.trim(), password });
      if (is2FALogin(result)) {
        setTwoFactorToken(result.twoFactorToken);
        showToast('Enter your authenticator code', 'success');
        return;
      }
      if (!isAdmin(result.user)) {
        setError('This account is not an admin. Use an admin account to sign in.');
        showToast('Admin access required', 'error');
        return;
      }
      saveAuth(result);
      showToast('Welcome, Admin!', 'success');
      router.push('/admin/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorToken) return;
    setError('');
    setLoading(true);
    try {
      const result = await verifyAdmin2FA(twoFactorToken, totpCode.trim());
      if (!isAdmin(result.user)) {
        setError('This account is not an admin.');
        return;
      }
      saveAuth(result);
      showToast('Welcome, Admin!', 'success');
      router.push('/admin/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <AuthBrandLogo />
          <h1 className="auth-title" style={{ marginTop: 12, marginBottom: 4 }}>{t('adminLogin')}</h1>
          <p style={{ color: 'var(--dark-gray)', fontSize: 14 }}>{t('adminPanelDesc')}</p>
        </div>

        {notAdmin && (
          <p className="form-error" role="alert" style={{ marginBottom: 16 }}>
            {t('notAdminOnly')}
          </p>
        )}
        {error && <p className="form-error" role="alert" style={{ marginBottom: 16 }}>{error}</p>}

        {twoFactorToken ? (
          <form onSubmit={handleVerify2FA}>
            <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>
              Enter the 6-digit code from Google Authenticator (or a backup code).
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="totp-code">Authenticator Code</label>
              <input
                id="totp-code"
                type="text"
                className="form-input"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? t('signingIn') : 'Verify & Sign In'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-full"
              style={{ marginTop: 8 }}
              onClick={() => { setTwoFactorToken(null); setTotpCode(''); }}
            >
              Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-user">{t('username')}</label>
              <input
                id="admin-user"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-pass">{t('password')}</label>
              <input
                id="admin-pass"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--dark-gray)' }}>
          <Link href="/auth/login">{t('userLogin')}</Link>
          {' · '}
          <Link href="/">{t('backToShop')}</Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="auth-page"><p>Loading...</p></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
