'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { is2FALogin, loginUser, saveAuth } from '@/lib/api/auth';
import { trackLogin } from '@/lib/analytics';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthBrandLogo from '@/components/AuthBrandLogo';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginUser({ username: username.trim(), password });
      if (is2FALogin(result)) {
        throw new Error('This account requires admin login with 2FA');
      }
      saveAuth(result);
      trackLogin('password');
      showToast(t('loginSuccess'), 'success');
      const redirect = searchParams.get('redirect');
      router.push(redirect && redirect.startsWith('/') ? redirect : '/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('loginFailed');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthBrandLogo />
        <h2 className="auth-title">{t('login')}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">{t('username')}</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder={t('enterUsername')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              aria-invalid={!!error}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <Link href="/auth/forgot-password" className="auth-link" style={{ fontSize: 13 }}>{t('forgotPassword')}</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? t('loggingIn') : t('login')}
          </button>
        </form>
        <GoogleSignInButton
          onSuccess={() => {
            showToast(t('loginSuccess'), 'success');
            const redirect = searchParams.get('redirect');
            router.push(redirect && redirect.startsWith('/') ? redirect : '/');
          }}
          onError={(msg) => {
            setError(msg);
            showToast(msg, 'error');
          }}
        />
        <p className="auth-footer">
          {t('noAccount')} <Link href="/auth/register" className="auth-link">{t('register')}</Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  const { t } = useLang();
  return (
    <Suspense fallback={<div className="auth-page"><p>{t('loading')}</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
