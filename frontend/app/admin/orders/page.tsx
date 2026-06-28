'use client';

import { useCallback, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import PaymentVerifyModal from '@/components/PaymentVerifyModal';
import OrderStatusModal from '@/components/OrderStatusModal';
import AdminOrderDetailModal from '@/components/AdminOrderDetailModal';
import StatusBadge from '@/components/StatusBadge';
import {
  fetchAdminOrders,
  fetchOrderDetail,
  verifyPayment,
  updateOrderStatus,
  rejectPayment,
  refundOrder,
  retryFulfillment,
  AdminOrder,
  AdminOrderDetail,
} from '@/lib/api/admin';
import { formatOrderId } from '@/lib/api/orders';
import { formatPrice } from '@/lib/mock-data';
import { useToast } from '@/components/Toast';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';
import { downloadCsv } from '@/lib/export-csv';

type StatusFilter = 'ALL' | 'PENDING' | 'PAYMENT_PENDING' | 'PROCESSING' | 'COMPLETED';

export default function AdminOrders() {
  const { t } = useAdminLang();
  const loader = useCallback(() => fetchAdminOrders(), []);
  const { data: orders, loading, error, reload } = useAdminLoad<AdminOrder[]>(loader, []);
  const [verifyOrder, setVerifyOrder] = useState<AdminOrder | null>(null);
  const [statusOrder, setStatusOrder] = useState<AdminOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        String(o.id).includes(q) ||
        formatOrderId(o.id).toLowerCase().includes(q) ||
        o.user.username.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const handleVerified = async (orderId: string) => {
    const numericId = parseInt(orderId.replace(/\D/g, ''), 10);
    try {
      await verifyPayment(numericId);
      showToast(`Payment verified for ${orderId}`, 'success');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Verify failed', 'error');
    }
  };

  const handleStatusSave = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Order ${formatOrderId(orderId)} → ${status}`, 'success');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const openDetail = async (orderId: number) => {
    setDetailLoading(true);
    setDetailOrder(null);
    try {
      setDetailOrder(await fetchOrderDetail(orderId));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load order', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDetailVerify = async () => {
    if (!detailOrder) return;
    try {
      await verifyPayment(detailOrder.id);
      showToast('Payment verified', 'success');
      setDetailOrder(null);
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Verify failed', 'error');
    }
  };

  const handleDetailReject = async () => {
    if (!detailOrder) return;
    try {
      await rejectPayment(detailOrder.id, 'Rejected by admin');
      showToast('Payment rejected', 'warning');
      setDetailOrder(null);
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Reject failed', 'error');
    }
  };

  const handleDetailRefund = async () => {
    if (!detailOrder) return;
    const reason = window.prompt('Refund reason (optional):') ?? undefined;
    if (reason === null) return;
    try {
      const updated = await refundOrder(detailOrder.id, reason || undefined);
      showToast(`Refunded ${formatPrice(updated.totalPrice)} to wallet`, 'success');
      setDetailOrder(updated);
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Refund failed', 'error');
    }
  };

  const handleDetailRetry = async () => {
    if (!detailOrder) return;
    if (!window.confirm(`Retry G2Bulk top-up for ${formatOrderId(detailOrder.id)}?`)) return;
    setRetrying(true);
    try {
      const result = await retryFulfillment(detailOrder.id);
      const status = result.order.status;
      showToast(
        status === 'COMPLETED' ? 'Top-up completed' : `Retry finished — status: ${status}`,
        status === 'COMPLETED' ? 'success' : 'warning',
      );
      setDetailOrder(result.order);
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Retry failed', 'error');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('orders')} ({orders.length})</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={filtered.length === 0}
            onClick={() => {
              downloadCsv(
                `orders-${new Date().toISOString().slice(0, 10)}.csv`,
                [t('orderId'), t('customer'), t('email'), t('product'), t('date'), t('total'), t('payment'), t('status')],
                filtered.map((o) => [
                  formatOrderId(o.id),
                  o.user.username,
                  o.user.email,
                  o.product.name,
                  o.createdAt.slice(0, 10),
                  String(Number(o.totalPrice)),
                  o.paymentMethod ?? '',
                  o.status,
                ]),
              );
            }}
          >
            {t('exportCsv')}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
        </div>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            className="form-input"
            placeholder={t('searchOrders')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 200px', maxWidth: 320 }}
          />
          <div className="filter-chips" style={{ margin: 0 }}>
            {(['ALL', 'PENDING', 'PAYMENT_PENDING', 'PROCESSING', 'COMPLETED'] as StatusFilter[]).map((f) => (
              <button key={f} type="button" className={`chip ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)}>
                {f === 'ALL' ? t('filterAll') : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p className="empty-text">{orders.length === 0 ? t('noOrdersInDb') : t('noOrdersMatch')}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('orderId')}</th>
                  <th>{t('customer')}</th>
                  <th>{t('product')}</th>
                  <th>{t('date')}</th>
                  <th>{t('total')}</th>
                  <th>{t('payment')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>{formatOrderId(order.id)}</td>
                    <td>
                      <div>{order.user.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>{order.user.email}</div>
                    </td>
                    <td>{order.product.name}</td>
                    <td>{order.createdAt.slice(0, 10)}</td>
                    <td>{formatPrice(Number(order.totalPrice))}</td>
                    <td>{order.paymentMethod ?? '-'}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => openDetail(order.id)}>
                          {t('view')}
                        </button>
                        {(order.status === 'PENDING' || order.status === 'PAYMENT_PENDING') && (
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVerifyOrder(order)}>
                            {t('verify')}
                          </button>
                        )}
                        <button type="button" className="btn btn-blue btn-sm" onClick={() => setStatusOrder(order)}>
                          {t('status')}
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

      <PaymentVerifyModal
        order={verifyOrder ? {
          id: formatOrderId(verifyOrder.id),
          numericId: verifyOrder.id,
          customer: verifyOrder.user.username,
          total: Number(verifyOrder.totalPrice),
          status: verifyOrder.status,
          paymentMethod: verifyOrder.paymentMethod,
          paymentProof: verifyOrder.paymentProof ?? null,
        } : null}
        onClose={() => setVerifyOrder(null)}
        onVerified={handleVerified}
      />

      <AdminOrderDetailModal
        order={detailOrder}
        loading={detailLoading}
        onClose={() => setDetailOrder(null)}
        onVerify={detailOrder ? handleDetailVerify : undefined}
        onReject={detailOrder ? handleDetailReject : undefined}
        onRefund={detailOrder ? handleDetailRefund : undefined}
        onRetry={detailOrder?.status === 'PROCESSING' ? handleDetailRetry : undefined}
        retrying={retrying}
      />

      <OrderStatusModal
        open={statusOrder != null}
        orderId={statusOrder?.id ?? null}
        currentStatus={statusOrder?.status ?? 'PENDING'}
        onClose={() => setStatusOrder(null)}
        onSave={handleStatusSave}
      />
    </AdminLayout>
  );
}
