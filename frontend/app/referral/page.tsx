'use client';

import { useEffect, useState } from 'react';
import ShopPageShell from '@/components/ShopPageShell';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';
import { formatPrice } from '@/lib/mock-data';
import { getStoredUser } from '@/lib/api/auth';
import { fetchReferralStats, ReferralStats } from '@/lib/api/referral';

const fallback: ReferralStats = {
  code: 'MVPMM-KO1234',
  referralCount: 2,
  totalEarnings: 10000,
  rewardPerReferral: 5000,
  history: [
    { username: 'User123', date: '2026-06-15', reward: 5000 },
    { username: 'Gamer456', date: '2026-06-18', reward: 5000 },
  ],
};

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats>(fallback);
  const { showToast } = useToast();
  const { t, tf } = useLang();

  useEffect(() => {
    if (!getStoredUser()) return;
    fetchReferralStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(stats.code);
    showToast(t('referralCopied'), 'success');
  };

  const registerUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/register?ref=${encodeURIComponent(stats.code)}`
    : '';

  const shareTelegram = () => {
    const text = encodeURIComponent(`Join MVPMMSHOP with my referral code: ${stats.code}`);
    const url = `https://t.me/share/url?url=${encodeURIComponent(registerUrl)}&text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(registerUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <ShopPageShell
      title={t('referEarnTitle')}
      emoji="🎁"
      badge="Referral"
      subtitle={tf('referEarnPageDesc', { amount: formatPrice(stats.rewardPerReferral) })}
      maxWidth={600}
    >

        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ marginBottom: 8, fontWeight: 500 }}>{t('yourReferralCode')}</p>
          <div className="voucher-box">
            <span>{stats.code}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copyCode}>📋 {t('copy')}</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-blue btn-sm" onClick={shareTelegram}>{t('shareTelegram')}</button>
            <button type="button" className="btn btn-blue btn-sm" onClick={shareFacebook}>{t('shareFacebook')}</button>
          </div>
        </div>

        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">{t('referrals')}</div>
            <div className="stat-value">{stats.referralCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('totalEarnings')}</div>
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{formatPrice(stats.totalEarnings)}</div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">{t('referralHistory')}</h2>
          {stats.history.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon">🎁</div>
              <p className="empty-text">{t('noReferralsYet')}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('user')}</th>
                    <th>{t('date')}</th>
                    <th>{t('reward')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.history.map((r, i) => (
                    <tr key={i}>
                      <td>{r.username}</td>
                      <td>{r.date}</td>
                      <td style={{ color: 'var(--green)', fontWeight: 600 }}>+{formatPrice(r.reward)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </ShopPageShell>
  );
}
