'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import G2BulkRecentPanels from '@/components/G2BulkRecentPanels';
import {
  checkG2bulkPrices,
  dismissAllG2bulkPriceAlerts,
  dismissG2bulkPriceAlert,
  fetchG2bulkDashboard,
  G2BulkDashboard,
} from '@/lib/api/admin';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';
import { useToast } from '@/components/Toast';

const emptyDashboard: G2BulkDashboard = {
  connected: false,
  profile: null,
  stats: { gamesCount: 0, categoriesCount: 0, productsCount: 0 },
  recentTransactions: [],
  recentOrders: [],
  priceAlerts: [],
};

function formatUsd(amount: string | number) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${n.toFixed(3)}`;
}

export default function AdminG2bulkPage() {
  const { t } = useAdminLang();
  const { showToast } = useToast();
  const [checking, setChecking] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  const loader = useCallback(() => fetchG2bulkDashboard(), []);
  const { data, loading, error, reload } = useAdminLoad(loader, emptyDashboard);

  const priceAlerts = data.priceAlerts ?? [];

  const handleCheckPrices = async () => {
    setChecking(true);
    try {
      const result = await checkG2bulkPrices(true);
      showToast(
        result.newAlerts > 0
          ? `${t('g2bulkPriceCheckDone')}: ${result.newAlerts} ${t('newAlerts')}`
          : t('g2bulkPriceCheckNoChange'),
        result.newAlerts > 0 ? 'success' : 'info',
      );
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Check failed', 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleDismiss = async (id: number) => {
    try {
      await dismissG2bulkPriceAlert(id);
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Dismiss failed', 'error');
    }
  };

  const handleDismissAll = async () => {
    setDismissing(true);
    try {
      const result = await dismissAllG2bulkPriceAlerts();
      showToast(`${result.dismissed} ${t('alertsDismissed')}`, 'success');
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Dismiss failed', 'error');
    } finally {
      setDismissing(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{t('g2bulkDashboard')}</h1>
          <p style={{ color: 'var(--dark-gray)', margin: 0, fontSize: 14 }}>{t('g2bulkDesc')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleCheckPrices} disabled={checking}>
            {checking ? '...' : `📈 ${t('checkG2bulkPrices')}`}
          </button>
          <Link href="/admin/settings" className="btn btn-outline btn-sm">⚙️ {t('apiKeys')}</Link>
          <a href="https://g2bulk.com/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            g2bulk.com ↗
          </a>
        </div>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      {!loading && priceAlerts.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: 20, borderColor: 'var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>📈 {t('g2bulkPriceAlerts')} ({priceAlerts.length})</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleDismissAll} disabled={dismissing}>
              {dismissing ? '...' : t('dismissAll')}
            </button>
          </div>
          <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>{t('g2bulkPriceAlertDesc')}</p>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('product')}</th>
                  <th>{t('previousPrice')}</th>
                  <th>{t('currentPrice')}</th>
                  <th>{t('increase')}</th>
                  <th>{t('date')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {priceAlerts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.label}</strong>
                      <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>{a.itemType}</div>
                    </td>
                    <td>{formatUsd(a.previousUsd)}</td>
                    <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{formatUsd(a.currentUsd)}</td>
                    <td style={{ color: 'var(--warning)' }}>
                      +{formatUsd(a.increaseUsd)} (+{a.increasePct.toFixed(1)}%)
                    </td>
                    <td style={{ fontSize: 13 }}>{new Date(a.createdAt).toLocaleString()}</td>
                    <td>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDismiss(a.id)}>
                        {t('dismiss')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !data.connected && (
        <div className="card" style={{ padding: 20, marginBottom: 24, borderColor: 'var(--warning)' }}>
          <h2 className="section-title" style={{ marginBottom: 8 }}>⚠️ {t('notConnected')}</h2>
          <p style={{ marginBottom: 12, color: 'var(--dark-gray)' }}>
            {data.error ?? 'Configure your G2Bulk API key to view wallet balance and transactions.'}
          </p>
          <Link href="/admin/settings" className="btn btn-primary btn-sm">
            Go to Settings → Integrations
          </Link>
          <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 12, marginBottom: 0 }}>
            Get an API key from Telegram bot{' '}
            <a href="https://t.me/G2BULKBOT" target="_blank" rel="noopener noreferrer">@G2BULKBOT</a>
          </p>
        </div>
      )}

      {!loading && data.connected && data.profile && (
        <>
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-label">{t('walletBalance')}</div>
              <div className="stat-value" style={{ color: 'var(--gold)' }}>
                {formatUsd(data.profile.balance)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-label">{t('account')}</div>
              <div className="stat-value" style={{ fontSize: 18 }}>
                {data.profile.username}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>{data.profile.firstName}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-label">{t('games')}</div>
              <div className="stat-value">{data.stats.gamesCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-label">{t('voucherProducts')}</div>
              <div className="stat-value">{data.stats.productsCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📂</div>
              <div className="stat-label">{t('categories')}</div>
              <div className="stat-value">{data.stats.categoriesCount}</div>
            </div>
          </div>

          <G2BulkRecentPanels
            transactions={data.recentTransactions}
            orders={data.recentOrders}
          />
        </>
      )}
    </AdminLayout>
  );
}
