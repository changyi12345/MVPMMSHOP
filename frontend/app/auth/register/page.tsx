'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { registerUser, saveAuth } from '@/lib/api/auth';
import { trackSignUp } from '@/lib/analytics';
import { sendPhoneOtp } from '@/lib/api/phone';
import { fetchShopInfo } from '@/lib/api/settings';
import { DEFAULT_FEATURE_FLAGS } from '@/lib/feature-flags';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthBrandLogo from '@/components/AuthBrandLogo';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';

export default function Register() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [smsOtpEnabled, setSmsOtpEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShopInfo()
      .then((shop) => {
        const flags = { ...DEFAULT_FEATURE_FLAGS, ...shop.featureFlags };
        setSmsOtpEnabled(flags.smsOtpEnabled);
      })
      .catch(() => setSmsOtpEnabled(false));
  }, []);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      showToast(t('enterPhone') ?? 'Enter phone number', 'error');
      return;
    }
    setSendingOtp(true);
    try {
      const result = await sendPhoneOtp(phone.trim());
      setOtpSent(true);
      showToast(t('otpSent') ?? 'Verification code sent', 'success');
      if (result.devCode) {
        showToast(`Dev code: ${result.devCode}`, 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send code', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
        ...(smsOtpEnabled ? { phone: phone.trim(), otpCode: otpCode.trim() } : phone.trim() ? { phone: phone.trim() } : {}),
      });
      saveAuth(result);
      trackSignUp('email');
      showToast(t('registerSuccess'), 'success');
      router.push('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('registerFailed');
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
        <h2 className="auth-title">{t('register')}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">{t('username')}</label>
            <input
              id="reg-username"
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
            <label className="form-label" htmlFor="reg-email">{t('email')}</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder={t('enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!error}
            />
          </div>
          {smsOtpEnabled && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">{t('phone') ?? 'Phone'}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="form-input"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={sendingOtp}
                    onClick={handleSendOtp}
                  >
                    {sendingOtp ? '...' : t('sendOtp') ?? 'Send OTP'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-otp">{t('otpCode') ?? 'Verification code'}</label>
                <input
                  id="reg-otp"
                  type="text"
                  className="form-input"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  maxLength={6}
                />
                {otpSent && (
                  <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 4 }}>
                    {t('otpSentHint') ?? 'Enter the 6-digit code sent to your phone'}
                  </p>
                )}
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder={t('passwordMin6')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
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
          <div className="form-group">
            <label className="form-label" htmlFor="reg-referral">{t('referralOptional')}</label>
            <input
              id="reg-referral"
              type="text"
              className="form-input"
              placeholder={t('enterReferral')}
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? t('registering') : t('register')}
          </button>
        </form>
        <GoogleSignInButton
          referralCode={referralCode.trim() || undefined}
          onSuccess={() => {
            showToast(t('registerSuccess'), 'success');
            router.push('/');
          }}
          onError={(msg) => {
            setError(msg);
            showToast(msg, 'error');
          }}
        />
        <p className="auth-footer">
          {t('hasAccount')} <Link href="/auth/login" className="auth-link">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}
