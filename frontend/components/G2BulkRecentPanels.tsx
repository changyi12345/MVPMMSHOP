'use client';

import { useMemo } from 'react';
import { useAdminLang } from '@/lib/useAdminLang';

export type G2BulkTx = {
  id: number;
  transaction_type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  status: string;
  description: string;
  created_at: string;
};

export type G2BulkOrder = {
  id: number;
  product_title: string;
  quantity: number;
  total_price: string;
  status: string;
  created_at: string;
};

function formatUsd(amount: string | number) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return '$0.000';
  return `$${n.toFixed(3)}`;
}

function formatDateParts(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  };
}

function isCreditTx(type: string) {
  return type === 'add_balance';
}

function g2bulkStatusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('complete') || s.includes('success')) return 'badge badge-gold';
  if (s.includes('pending') || s.includes('process')) return 'badge badge-yellow';
  if (s.includes('fail') || s.includes('cancel') || s.includes('reject')) return 'badge badge-red';
  return 'badge badge-gray';
}

function formatG2bulkStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  transactions: G2BulkTx[];
  orders: G2BulkOrder[];
}

export default function G2BulkRecentPanels({ transactions, orders }: Props) {
  const { t } = useAdminLang();

  const txSummary = useMemo(() => {
    let credits = 0;
    let debits = 0;
    for (const tx of transactions) {
      const amt = parseFloat(tx.amount);
      if (Number.isNaN(amt)) continue;
      if (isCreditTx(tx.transaction_type)) credits += amt;
      else debits += amt;
    }
    return { credits, debits };
  }, [transactions]);

  const orderTotal = useMemo(
    () => orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0),
    [orders],
  );

  return (
    <div className="g2bulk-activity">
      <section className="card g2bulk-panel">
        <header className="g2bulk-panel-header">
          <div className="g2bulk-panel-title-wrap">
            <span className="g2bulk-panel-icon" aria-hidden>💸</span>
            <div>
              <h2 className="g2bulk-panel-title">{t('recentTransactions')}</h2>
              <p className="g2bulk-panel-sub">{t('g2bulkTxSub')}</p>
            </div>
          </div>
          <div className="g2bulk-panel-meta">
            <span className="g2bulk-count-badge">{transactions.length}</span>
            {transactions.length > 0 && (
              <div className="g2bulk-mini-stats">
                <span className="g2bulk-mini-stat g2bulk-mini-stat--up">
                  +{formatUsd(txSummary.credits)}
                </span>
                <span className="g2bulk-mini-stat g2bulk-mini-stat--down">
                  −{formatUsd(txSummary.debits)}
                </span>
              </div>
            )}
          </div>
        </header>

        {transactions.length === 0 ? (
          <div className="empty-state g2bulk-empty">
            <div className="empty-icon">📭</div>
            <p className="empty-text">{t('noTransactionsYet')}</p>
          </div>
        ) : (
          <div className="table-wrap g2bulk-table-wrap">
            <table className="data-table g2bulk-table">
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('type')}</th>
                  <th className="g2bulk-th-num">{t('amount')}</th>
                  <th className="g2bulk-th-num">{t('balance')}</th>
                  <th>{t('description')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const credit = isCreditTx(tx.transaction_type);
                  const { date, time } = formatDateParts(tx.created_at);
                  return (
                    <tr key={tx.id}>
                      <td className="g2bulk-date-cell">
                        <span className="g2bulk-date-main">{date}</span>
                        <span className="g2bulk-date-sub">{time}</span>
                      </td>
                      <td>
                        <span className={`g2bulk-type-pill ${credit ? 'g2bulk-type-pill--credit' : 'g2bulk-type-pill--debit'}`}>
                          {credit ? `↑ ${t('topUp')}` : `↓ ${t('charge')}`}
                        </span>
                      </td>
                      <td className="g2bulk-num-cell">
                        <span className={credit ? 'g2bulk-amount--credit' : 'g2bulk-amount--debit'}>
                          {credit ? '+' : '−'}{formatUsd(tx.amount)}
                        </span>
                      </td>
                      <td className="g2bulk-num-cell">
                        <span className="g2bulk-balance-after">{formatUsd(tx.balance_after)}</span>
                      </td>
                      <td className="g2bulk-desc-cell" title={tx.description || undefined}>
                        {tx.description || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card g2bulk-panel">
        <header className="g2bulk-panel-header">
          <div className="g2bulk-panel-title-wrap">
            <span className="g2bulk-panel-icon" aria-hidden>🎫</span>
            <div>
              <h2 className="g2bulk-panel-title">{t('recentVoucherOrders')}</h2>
              <p className="g2bulk-panel-sub">{t('g2bulkOrdersSub')}</p>
            </div>
          </div>
          <div className="g2bulk-panel-meta">
            <span className="g2bulk-count-badge">{orders.length}</span>
            {orders.length > 0 && (
              <span className="g2bulk-mini-stat g2bulk-mini-stat--neutral">
                {formatUsd(orderTotal)} {t('total')}
              </span>
            )}
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="empty-state g2bulk-empty">
            <div className="empty-icon">🛒</div>
            <p className="empty-text">{t('noVoucherOrdersYet')}</p>
          </div>
        ) : (
          <div className="table-wrap g2bulk-table-wrap">
            <table className="data-table g2bulk-table">
              <thead>
                <tr>
                  <th>{t('orderId')}</th>
                  <th>{t('product')}</th>
                  <th className="g2bulk-th-num">{t('qty')}</th>
                  <th className="g2bulk-th-num">{t('total')}</th>
                  <th>{t('status')}</th>
                  <th>{t('date')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const { date, time } = formatDateParts(order.created_at);
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="g2bulk-order-id">#{order.id}</span>
                      </td>
                      <td className="g2bulk-product-cell">
                        <span className="g2bulk-product-icon" aria-hidden>🎁</span>
                        <span className="g2bulk-product-name" title={order.product_title}>
                          {order.product_title}
                        </span>
                      </td>
                      <td className="g2bulk-num-cell">
                        <span className="g2bulk-qty-badge">×{order.quantity}</span>
                      </td>
                      <td className="g2bulk-num-cell">
                        <span className="g2bulk-order-total">{formatUsd(order.total_price)}</span>
                      </td>
                      <td>
                        <span className={g2bulkStatusClass(order.status)}>
                          {formatG2bulkStatus(order.status)}
                        </span>
                      </td>
                      <td className="g2bulk-date-cell">
                        <span className="g2bulk-date-main">{date}</span>
                        <span className="g2bulk-date-sub">{time}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
