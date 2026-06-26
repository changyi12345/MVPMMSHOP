'use client';

import { useCallback, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import { fetchReferralStats, ReferralStat } from '@/lib/api/admin';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';
import { downloadCsv } from '@/lib/export-csv';

export default function AdminReferralsPage() {
  const { t } = useAdminLang();
  const loader = useCallback(() => fetchReferralStats(), []);
  const { data: stats, loading, error, reload } = useAdminLoad<ReferralStat[]>(loader, []);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stats;
    return stats.filter(
      (s) =>
        s.username.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.referralCode?.toLowerCase().includes(q) ?? false),
    );
  }, [stats, search]);

  const totalReferrals = stats.reduce((sum, s) => sum + s.referralCount, 0);
  const activeReferrers = stats.filter((s) => s.referralCount > 0).length;

  const handleExport = () => {
    downloadCsv(
      `referrals-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Username', 'Email', 'Referral Code', 'Referrals', 'Joined'],
      filtered.map((s) => [
        s.username,
        s.email,
        s.referralCode ?? '',
        String(s.referralCount),
        s.joinedAt.slice(0, 10),
      ]),
    );
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('referralsTitle')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-secondary btn-sm" disabled={filtered.length === 0} onClick={handleExport}>
            {t('exportCsv')}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
        </div>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Referrals</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{totalReferrals}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Referrers</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{activeReferrers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Users with Code</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{stats.filter((s) => s.referralCode).length}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <input
          type="search"
          className="form-input"
          placeholder="Search by username, email, or referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="card">
        {filtered.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <p className="empty-text">{stats.length === 0 ? 'No users yet' : 'No matches'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Referral Code</th>
                  <th>Referrals</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>{s.email}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{s.referralCode ?? '—'}</td>
                    <td style={{ fontWeight: 600, color: s.referralCount > 0 ? 'var(--gold)' : undefined }}>
                      {s.referralCount}
                    </td>
                    <td>{s.joinedAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
