'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ShopPageShell from '@/components/ShopPageShell';
import { fetchProfile, getStoredUser, logout, refreshStoredUser } from '@/lib/api/auth';
import { sendPhoneOtp, verifyPhoneOtp } from '@/lib/api/phone';
import { formatPrice } from '@/lib/format-price';
import { useLang } from '@/lib/useLang';
import { useAuthUser } from '@/lib/use-auth';
import { useWallet } from '@/lib/use-wallet';
import { enableWebPush, disableWebPush } from '@/lib/api/push';
import { useToast } from '@/components/Toast';
import { useShop } from '@/components/ShopProvider';
import { DEFAULT_FEATURE_FLAGS } from '@/lib/feature-flags';

type ProfileUser = {
  username: string;
  email: string;
  phone?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  avatarUrl?: string | null;
};

function userInitial(name: string) {
  return (name.trim()[0] ?? 'U').toUpperCase();
}

export default function ProfilePage() {
  const { isLoggedIn, ready } = useAuthUser();
  const { balance, loading: walletLoading } = useWallet();
  const shop = useShop();
  const { t } = useLang();
  const { showToast } = useToast();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration('/sw.js').then((reg) => {
      reg?.pushManager.getSubscription().then((sub) => {
        setPushEnabled(!!sub);
      });
    });
  }, []);

  const flags = { ...DEFAULT_FEATURE_FLAGS, ...shop?.featureFlags };
  const smsOtpEnabled = flags.smsOtpEnabled;

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) {
      setProfileLoading(false);
      return;
    }

    const stored = getStoredUser();
    if (stored) {
      setUser({
        username: stored.username,
        email: stored.email,
        phone: stored.phone,
        phoneVerified: stored.phoneVerified,
        emailVerified: stored.emailVerified,
        avatarUrl: stored.avatarUrl,
      });
      if (stored.phone) setPhoneInput(stored.phone);
    }

    fetchProfile()
      .then((profile) => {
        setUser({
          username: profile.username,
          email: profile.email,
          phone: profile.phone,
          phoneVerified: profile.phoneVerified,
          emailVerified: profile.emailVerified,
          avatarUrl: profile.avatarUrl,
        });
        if (profile.phone) setPhoneInput(profile.phone);
        refreshStoredUser(profile);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [ready, isLoggedIn]);

  if (!ready || (isLoggedIn && profileLoading && !user)) {
    return (
      <ShopPageShell title={t('profile')} emoji="👤" badge="Account" maxWidth={560} centered>
        <div className="profile-skeleton">
          <div className="profile-skeleton-block" style={{ height: 200 }} />
          <div className="profile-skeleton-block" style={{ height: 100 }} />
          <div className="profile-skeleton-block" style={{ height: 280 }} />
        </div>
      </ShopPageShell>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <ShopPageShell title={t('profile')} emoji="👤" badge="Account" maxWidth={560} centered>
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p className="empty-text">{t('profileLoginRequired')}</p>
          <Link href="/auth/login" className="btn btn-primary">{t('login')}</Link>
        </div>
      </ShopPageShell>
    );
  }

  const balanceDisplay = walletLoading ? '...' : formatPrice(balance);

  const accountItems = [
    { href: '/profile/change-password', icon: '🔒', label: t('changePassword'), desc: t('updatePassword') },
    { href: '/help', icon: '❓', label: t('helpFaq'), desc: t('helpDesc') },
    { href: '/help', icon: '📞', label: t('contactSupport'), desc: t('contactSupport') },
  ];

  const handleSendOtp = async () => {
    if (!phoneInput.trim()) return;
    setSendingOtp(true);
    try {
      const result = await sendPhoneOtp(phoneInput.trim(), true);
      setOtpSent(true);
      showToast(t('otpSent'), 'success');
      if (result.devCode) showToast(`Dev: ${result.devCode}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPhone = async () => {
    setVerifyingOtp(true);
    try {
      await verifyPhoneOtp(phoneInput.trim(), otpCode.trim(), true);
      const profile = await fetchProfile();
      refreshStoredUser(profile);
      setUser({
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        phoneVerified: profile.phoneVerified,
        emailVerified: profile.emailVerified,
        avatarUrl: profile.avatarUrl,
      });
      setOtpCode('');
      showToast(t('phoneVerified'), 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <ShopPageShell title={t('profile')} emoji="👤" badge="Account" maxWidth={560}>
      <div className="profile-page">
        <header className="profile-hero">
          <div className="profile-hero-glow" aria-hidden />
          <div className="profile-hero-inner">
            <div className="profile-avatar-ring">
              <div className="profile-avatar-inner">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="" width={82} height={82} unoptimized />
                ) : (
                  userInitial(user.username)
                )}
              </div>
            </div>
            <h1 className="profile-hero-name">{user.username}</h1>
            <p className="profile-hero-email">{user.email}</p>
            <div className="profile-badges">
              {user.emailVerified && (
                <span className="profile-badge profile-badge--ok">✓ {t('emailVerifiedBadge')}</span>
              )}
              {user.phoneVerified && user.phone && (
                <span className="profile-badge profile-badge--ok">✓ {t('profilePhoneVerified')}</span>
              )}
            </div>
          </div>
        </header>

        <section aria-label={t('profileQuickActions')}>
          <h2 className="profile-section-title">{t('profileQuickActions')}</h2>
          <div className="profile-quick-grid">
            <Link href="/wallet" className="profile-quick-card profile-quick-card--wallet">
              <span className="profile-quick-icon">💰</span>
              <span className="profile-quick-label">{t('walletBalanceLabel')}</span>
              <span className="profile-quick-value">{balanceDisplay}</span>
            </Link>
            <Link href="/orders" className="profile-quick-card">
              <span className="profile-quick-icon">📦</span>
              <span className="profile-quick-label">{t('myOrders')}</span>
            </Link>
            <Link href="/referral" className="profile-quick-card">
              <span className="profile-quick-icon">🎁</span>
              <span className="profile-quick-label">{t('referralProgram')}</span>
            </Link>
          </div>
        </section>

        {smsOtpEnabled && (
          <section className="profile-section">
            <h2 className="profile-section-title">{t('profilePhoneTitle')}</h2>
            <p className="shop-muted" style={{ fontSize: 13, marginBottom: 14 }}>{t('profilePhoneDesc')}</p>
            {user.phoneVerified && user.phone ? (
              <div className="profile-phone-verified">
                <span className="profile-phone-verified-icon">📱</span>
                <div>
                  <div className="profile-phone-verified-number">{user.phone}</div>
                  <span className="profile-badge profile-badge--ok" style={{ marginTop: 6, color: 'var(--green)', background: 'rgba(16,185,129,0.1)', border: 'none' }}>
                    ✓ {t('profilePhoneVerified')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="profile-phone-form">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="profile-phone">{t('phone')}</label>
                  <div className="profile-otp-row">
                    <input
                      id="profile-phone"
                      type="tel"
                      className="form-input"
                      placeholder="09xxxxxxxxx"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={sendingOtp}
                      onClick={handleSendOtp}
                    >
                      {sendingOtp ? '...' : t('sendOtp')}
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="profile-otp">{t('otpCode')}</label>
                  <input
                    id="profile-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="form-input"
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  {otpSent && <p className="profile-otp-hint">{t('otpSentHint')}</p>}
                </div>
                <div className="profile-otp-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={verifyingOtp || otpCode.length < 6}
                    onClick={handleVerifyPhone}
                  >
                    {verifyingOtp ? '...' : t('verifyPhone')}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="profile-section">
          <h2 className="profile-section-title">{t('profileAccountSettings')}</h2>
          <div className="profile-menu-grid">
            <button
              type="button"
              className="profile-menu-item"
              disabled={pushBusy}
              onClick={async () => {
                setPushBusy(true);
                try {
                  if (pushEnabled) {
                    await disableWebPush();
                    setPushEnabled(false);
                    showToast(t('pushDisabled'), 'success');
                  } else {
                    const result = await enableWebPush();
                    if (result === 'granted') {
                      setPushEnabled(true);
                      showToast(t('pushEnabled'), 'success');
                    } else if (result === 'unconfigured') {
                      showToast('Push not configured on server', 'error');
                    } else {
                      showToast(t('pushDenied'), 'error');
                    }
                  }
                } finally {
                  setPushBusy(false);
                }
              }}
            >
              <span className="profile-menu-icon">🔔</span>
              <span className="profile-menu-text">
                <span className="profile-menu-label">{t('profileNotifications')}</span>
                <span className="profile-menu-desc">
                  {pushEnabled ? t('pushEnabledDesc') : t('profileNotificationsDesc')}
                </span>
              </span>
              <span className="profile-menu-chevron">{pushEnabled ? '✓' : '›'}</span>
            </button>
            {accountItems.map((item) => (
              <Link key={item.label} href={item.href} className="profile-menu-item">
                <span className="profile-menu-icon">{item.icon}</span>
                <span className="profile-menu-text">
                  <span className="profile-menu-label">{item.label}</span>
                  <span className="profile-menu-desc">{item.desc}</span>
                </span>
                <span className="profile-menu-chevron">›</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="profile-logout-wrap">
          <button
            type="button"
            className="profile-logout-btn"
            onClick={() => { logout(); window.location.href = '/auth/login'; }}
          >
            🚪 {t('logout')}
          </button>
        </div>
      </div>
    </ShopPageShell>
  );
}
