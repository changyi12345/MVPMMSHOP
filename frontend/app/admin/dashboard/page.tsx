'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import StatusBadge from '@/components/StatusBadge';
import { formatPrice } from '@/lib/mock-data';
import { fetchDashboard, type G2BulkPriceAlert } from '@/lib/api/admin';
import { formatOrderId } from '@/lib/api/orders';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';

const emptyStats = {
  totalSales: 0,
  totalOrders: 0,
  totalUsers: 0,
  pendingOrders: 0,
  pendingWalletTopups: 0,
  todayOrders: 0,
  todaySales: 0,
  activePromos: 0,
  salesChart: [] as { day: string; date: string; amount: number }[],
  recentOrders: [] as { id: number; customer: string; total: number; status: string }[],
  g2bulkBalanceAlert: null as { balance: number; threshold: number } | null,
  g2bulkPriceAlertCount: 0,
  g2bulkPriceAlerts: [] as G2BulkPriceAlert[],
};

export default function AdminDashboard() {
  const { t } = useAdminLang();
  const loader = useCallback(() => fetchDashboard(), []);
  const { data: stats, loading, error, reload } = useAdminLoad(loader, emptyStats);

  const maxSales = Math.max(...stats.salesChart.map((d) => d.amount), 1);

  const statCards = [
    { label: t('totalSales'), value: formatPrice(stats.totalSales), icon: '💰', color: 'var(--gold)' },
    { label: t('todaySales'), value: formatPrice(stats.todaySales), icon: '📈', color: 'var(--gold)' },
    { label: t('totalOrders'), value: String(stats.totalOrders), icon: '📦', color: 'var(--blue)' },
    { label: t('todayOrders'), value: String(stats.todayOrders), icon: '🛒', color: 'var(--blue)' },
    { label: t('totalUsers'), value: String(stats.totalUsers), icon: '👥', color: 'var(--red)' },
    { label: t('pendingOrders'), value: String(stats.pendingOrders), icon: '⏳', color: 'var(--warning)' },
    { label: t('pendingTopups'), value: String(stats.pendingWalletTopups), icon: '💳', color: 'var(--warning)' },
    { label: t('activePromos'), value: String(stats.activePromos), icon: '🏷️', color: 'var(--red)' },
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('dashboard')}</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      <div className="stat-grid">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {(stats.g2bulkBalanceAlert ||
        (stats.g2bulkPriceAlertCount ?? 0) > 0 ||
        stats.pendingOrders > 0 ||
        stats.pendingWalletTopups > 0) && (
        <div className="card" style={{ marginBottom: 24, padding: 16 }}>
          <h2 className="section-title" style={{ marginBottom: 12 }}>⚡ {t('quickActions')}</h2>
          {stats.g2bulkBalanceAlert && (
            <p style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: 12 }}>
              ⚠️ G2Bulk balance low: ${stats.g2bulkBalanceAlert.balance.toFixed(2)} (threshold ${stats.g2bulkBalanceAlert.threshold})
            </p>
          )}
          {(stats.g2bulkPriceAlertCount ?? 0) > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: 8 }}>
                📈 {t('g2bulkPriceIncreaseAlert')}: {stats.g2bulkPriceAlertCount} {t('items')}
              </p>
              <Link href="/admin/g2bulk" style={{ fontSize: 14, color: 'var(--blue)' }}>
                {t('viewAll')} {t('g2bulkPriceAlerts')} →
              </Link>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(stats.g2bulkPriceAlertCount ?? 0) > 0 && (
              <Link href="/admin/g2bulk" className="btn btn-secondary btn-sm">
                {t('g2bulkPriceAlerts')}
              </Link>
            )}
            {stats.pendingOrders > 0 && (
              <Link href="/admin/orders" className="btn btn-secondary btn-sm">
                Verify {stats.pendingOrders} Pending Order{stats.pendingOrders > 1 ? 's' : ''}
              </Link>
            )}
            {stats.pendingWalletTopups > 0 && (
              <Link href="/admin/wallet" className="btn btn-outline btn-sm">
                Verify {stats.pendingWalletTopups} Wallet Top-Up{stats.pendingWalletTopups > 1 ? 's' : ''}
              </Link>
            )}
            <Link href="/admin/products" className="btn btn-outline btn-sm">{t('manageProducts')}</Link>
            <Link href="/admin/settings" className="btn btn-outline btn-sm">{t('exchangeRate')}</Link>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">{t('salesLast7Days')}</h2>
        {stats.salesChart.length === 0 ? (
          <p style={{ color: 'var(--dark-gray)', textAlign: 'center', padding: 24 }}>{t('noSalesWeek')}</p>
        ) : (
          <div className="sales-chart">
            {stats.salesChart.map((d) => (
              <div key={d.date} className="sales-chart-bar-wrap">
                <div className="sales-chart-bar" style={{ height: `${(d.amount / maxSales) * 100}%` }} title={formatPrice(d.amount)} />
                <span className="sales-chart-label">{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">{t('recentOrders')}</h2>
        {stats.recentOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-icon">📦</div>
            <p className="empty-text">{t('noOrdersYet')}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('orderId')}</th>
                  <th>{t('customer')}</th>
                  <th>{t('total')}</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>
                      <Link href="/admin/orders" style={{ color: 'inherit' }}>{formatOrderId(order.id)}</Link>
                    </td>
                    <td>{order.customer}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td><StatusBadge status={order.status} /></td>
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
