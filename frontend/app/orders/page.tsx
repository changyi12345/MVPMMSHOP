'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ShopPageShell from '@/components/ShopPageShell';
import StatusBadge from '@/components/StatusBadge';
import PaymentProofModal from '@/components/PaymentProofModal';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';
import { getToken } from '@/lib/api/client';
import {
  fetchMyOrders,
  formatOrderId,
  cancelOrder,
  canCancelOrder,
  ApiOrder,
} from '@/lib/api/orders';
import { formatPrice } from '@/lib/mock-data';
import { useShop } from '@/components/ShopProvider';
import { DEFAULT_FEATURE_FLAGS } from '@/lib/feature-flags';

type Filter = 'ALL' | 'PENDING' | 'COMPLETED';

function mapApiOrder(o: ApiOrder) {
  return {
    id: formatOrderId(o.id),
    numericId: o.id,
    date: o.createdAt.slice(0, 10),
    status: o.status,
    total: Number(o.totalPrice),
    items: [o.product.name],
    paymentMethod: o.paymentMethod,
  };
}

export default function OrdersPage() {
  const { t } = useLang();
  const { showToast } = useToast();
  const shop = useShop();
  const flags = shop?.featureFlags ?? DEFAULT_FEATURE_FLAGS;
  const [filter, setFilter] = useState<Filter>('ALL');
  const [uploadOrderId, setUploadOrderId] = useState<string | null>(null);
  const [uploadNumericId, setUploadNumericId] = useState<number | null>(null);
  const [uploadPaymentMethod, setUploadPaymentMethod] = useState<string | null>(null);
  const [orderList, setOrderList] = useState<ReturnType<typeof mapApiOrder>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  const load = useCallback(async () => {
    if (!getToken()) {
      setAuthed(false);
      setOrderList([]);
      setLoading(false);
      return;
    }
    setAuthed(true);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyOrders();
      setOrderList(data.map(mapApiOrder));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setOrderList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (numericId: number) => {
    if (!window.confirm(t('cancelOrderConfirm'))) return;
    try {
      await cancelOrder(numericId);
      showToast(t('orderCancelled'), 'success');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('cancelOrderFailed'), 'error');
    }
  };

  const filtered = orderList.filter((o) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return o.status === 'PENDING' || o.status === 'PAYMENT_PENDING';
    return o.status === filter;
  });

  const filterLabels: Record<Filter, string> = {
    ALL: t('all'),
    PENDING: t('pending'),
    COMPLETED: t('completed'),
  };

  if (!loading && !authed) {
    return (
      <ShopPageShell title={t('yourOrders')} emoji="📦" badge="Orders" maxWidth={480} centered>
        <div className="empty-state">
          <div className="empty-icon">🔐</div>
          <p className="empty-text">{t('loginToViewOrders') ?? 'Please log in to view your orders.'}</p>
          <Link href="/auth/login?redirect=/orders" className="btn btn-primary">{t('login')}</Link>
        </div>
      </ShopPageShell>
    );
  }

  return (
    <ShopPageShell title={t('yourOrders')} emoji="📦" badge="Orders" maxWidth={800}>

        <div className="filter-chips">
          {(['ALL', 'PENDING', 'COMPLETED'] as Filter[]).map((f) => (
            <button key={f} type="button" className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--dark-gray)' }}>{t('loading')}</p>
        ) : error ? (
          <div className="empty-state">
            <p className="empty-text">{error}</p>
            <button type="button" className="btn btn-outline" onClick={load}>{t('retry') ?? 'Retry'}</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p className="empty-text">{t('ordersEmpty')}</p>
            <Link href="/games" className="btn btn-secondary">{t('browseGames')}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((order) => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Order {order.id}</h3>
                    <p style={{ color: 'var(--dark-gray)', fontSize: 14 }}>{order.date}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <ul style={{ paddingLeft: 20, marginBottom: 16, color: 'var(--dark-gray)' }}>
                  {order.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <p style={{ fontWeight: 700 }}>Total: {formatPrice(order.total)}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(order.status === 'PENDING') && order.paymentMethod !== 'wallet' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setUploadOrderId(order.id);
                          setUploadNumericId(order.numericId);
                          setUploadPaymentMethod(order.paymentMethod);
                        }}
                      >
                        {t('uploadPaymentProof')}
                      </button>
                    )}
                    {canCancelOrder(order.status, order.paymentMethod, flags) && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleCancel(order.numericId)}
                      >
                        {t('cancelOrder')}
                      </button>
                    )}
                    <Link href={`/orders/${order.numericId || order.id}`} className="btn btn-blue btn-sm">
                      {t('viewDetails')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      <PaymentProofModal
        orderId={uploadOrderId}
        numericOrderId={uploadNumericId}
        paymentMethod={uploadPaymentMethod}
        usingMock={false}
        onClose={() => { setUploadOrderId(null); setUploadNumericId(null); setUploadPaymentMethod(null); }}
        onSubmitted={load}
      />
    </ShopPageShell>
  );
}
