'use client';

import { useCallback, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import { formatPrice } from '@/lib/mock-data';
import { fetchSalesReport } from '@/lib/api/admin';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';
import { downloadCsv } from '@/lib/export-csv';

const emptyReport = {
  totalSales: 0,
  totalOrders: 0,
  topProducts: [] as { name: string; sales: number; count: number }[],
  monthlyReport: [] as { month: string; sales: number; orders: number }[],
};

function defaultFromDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}

export default function AdminReports() {
  const { t } = useAdminLang();
  const [from, setFrom] = useState(defaultFromDate);
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const loader = useCallback(() => fetchSalesReport(from, to), [from, to]);
  const { data: report, loading, error, reload } = useAdminLoad(loader, emptyReport);

  const avgOrder = report.totalOrders > 0
    ? Math.round(report.totalSales / report.totalOrders)
    : 0;

  const handleExport = () => {
    downloadCsv(
      `sales-report-${from}-to-${to}.csv`,
      ['Product', 'Revenue', 'Units Sold'],
      report.topProducts.map((p) => [p.name, String(p.sales), String(p.count)]),
    );
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('salesReports')}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" disabled={report.topProducts.length === 0} onClick={handleExport}>
            {t('exportCsv')}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" htmlFor="report-from">From</label>
            <input id="report-from" type="date" className="form-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="form-label" htmlFor="report-to">To</label>
            <input id="report-to" type="date" className="form-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>Apply</button>
        </div>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Sales (Completed)</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{formatPrice(report.totalSales)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Orders</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{report.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{formatPrice(avgOrder)}</div>
        </div>
      </div>

      {report.monthlyReport.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">{t('monthlySales')}</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Sales</th>
                  <th>Orders</th>
                  <th>Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {report.monthlyReport.map((row) => (
                  <tr key={row.month}>
                    <td style={{ fontWeight: 500 }}>{row.month}</td>
                    <td>{formatPrice(row.sales)}</td>
                    <td>{row.orders}</td>
                    <td>{formatPrice(Math.round(row.sales / row.orders))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">{t('topProducts')}</h2>
        {report.topProducts.length === 0 && !loading ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-icon">📊</div>
            <p className="empty-text">No completed orders in this date range</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Revenue</th>
                  <th>Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {report.topProducts.map((p) => (
                  <tr key={p.name}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatPrice(p.sales)}</td>
                    <td>{p.count}</td>
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
