'use client';

import { useCallback, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import ConfirmModal from '@/components/ConfirmModal';
import StatusBadge from '@/components/StatusBadge';
import {
  fetchPendingWalletTopups,
  fetchWalletTransactions,
  verifyWalletTopup,
  rejectWalletTopup,
  WalletTopupRequest,
  WalletTransactionRow,
} from '@/lib/api/admin';
import { formatPrice } from '@/lib/format-price';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';
import { useToast } from '@/components/Toast';
import ProofImageModal, { ProofPreviewData } from '@/components/ProofImageModal';

type Tab = 'pending' | 'transactions';

export default function AdminWalletPage() {
  const { t } = useAdminLang();
  const pendingLoader = useCallback(() => fetchPendingWalletTopups(), []);
  const txLoader = useCallback(() => fetchWalletTransactions(150), []);
  const pending = useAdminLoad<WalletTopupRequest[]>(pendingLoader, []);
  const transactions = useAdminLoad<WalletTransactionRow[]>(txLoader, []);
  const [tab, setTab] = useState<Tab>('pending');
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [proofPreview, setProofPreview] = useState<ProofPreviewData | null>(null);
  const { showToast } = useToast();

  const openProof = (row: { username: string; amount: number; reference?: string | null; proofImageUrl?: string | null }) => {
    setProofPreview({
      title: `Payment Proof — ${row.username}`,
      amount: row.amount,
      reference: row.reference,
      proofImageUrl: row.proofImageUrl ?? null,
    });
  };

  const reload = async () => {
    await Promise.all([pending.reload(), transactions.reload()]);
  };

  const handleVerify = async (id: number) => {
    try {
      await verifyWalletTopup(id);
      showToast('Wallet top-up verified', 'success');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Verify failed', 'error');
    }
  };

  const confirmReject = async () => {
    if (rejectId == null) return;
    try {
      await rejectWalletTopup(rejectId, 'Rejected by admin');
      showToast('Top-up rejected', 'warning');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Reject failed', 'error');
    }
    setRejectId(null);
  };

  const loading = tab === 'pending' ? pending.loading : transactions.loading;
  const error = tab === 'pending' ? pending.error : transactions.error;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('wallet')}</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
      </div>

      <div className="filter-chips" style={{ marginBottom: 16 }}>
        <button type="button" className={`chip ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          {t('pendingTopupsTab')} ({pending.data.length})
        </button>
        <button type="button" className={`chip ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>
          {t('allTransactionsTab')} ({transactions.data.length})
        </button>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      {tab === 'pending' ? (
        <div className="card">
          {pending.data.length === 0 && !pending.loading ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <p className="empty-text">{t('noPendingTopups')}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('colUser')}</th>
                    <th>{t('amount')}</th>
                    <th>{t('reference')}</th>
                    <th>{t('proof')}</th>
                    <th>{t('date')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.data.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{row.username}</div>
                        <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>{row.email}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{formatPrice(row.amount)}</td>
                      <td>{row.reference ?? '—'}</td>
                      <td>
                        {row.proofImageUrl ? (
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => openProof(row)}>
                            {t('view')}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{row.createdAt.slice(0, 10)}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleVerify(row.id)}>
                            {t('verify')}
                          </button>
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => setRejectId(row.id)}>
                            {t('rejectTopup')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {transactions.data.length === 0 && !transactions.loading ? (
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <p className="empty-text">{t('noWalletTransactions')}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('colUser')}</th>
                    <th>{t('type')}</th>
                    <th>{t('amount')}</th>
                    <th>{t('status')}</th>
                    <th>{t('reference')}</th>
                    <th>{t('proof')}</th>
                    <th>{t('date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.data.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{row.username}</div>
                        <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>{row.email}</div>
                      </td>
                      <td>{row.type}</td>
                      <td style={{ fontWeight: 600, color: row.amount >= 0 ? 'var(--gold)' : 'var(--red)' }}>
                        {formatPrice(row.amount)}
                      </td>
                      <td><StatusBadge status={row.status} /></td>
                      <td>{row.reference ?? row.description ?? '—'}</td>
                      <td>
                        {row.type === 'topup' && row.proofImageUrl ? (
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => openProof(row)}>
                            {t('view')}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{row.createdAt.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={rejectId != null}
        title="Reject Top-Up?"
        message="This wallet top-up request will be rejected."
        confirmLabel="Reject"
        danger
        onConfirm={confirmReject}
        onCancel={() => setRejectId(null)}
      />

      <ProofImageModal data={proofPreview} onClose={() => setProofPreview(null)} />
    </AdminLayout>
  );
}
