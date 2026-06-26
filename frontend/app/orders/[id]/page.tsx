'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useShop } from '@/components/ShopProvider';
import { DEFAULT_FEATURE_FLAGS } from '@/lib/feature-flags';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';
import { getToken } from '@/lib/api/client';
import { fetchOrder, formatOrderId, orderTimeline, cancelOrder, canCancelOrder, ApiOrder } from '@/lib/api/orders';
import { formatPrice } from '@/lib/format-price';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLang();
  const shop = useShop();
  const flags = shop?.featureFlags ?? DEFAULT_FEATURE_FLAGS;
  const orderId = parseInt(params.id.replace(/\D/g, ''), 10);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/auth/login?redirect=/orders/${params.id}`);
      return;
    }
    if (!Number.isFinite(orderId)) {
      setNotFoundState(true);
      setLoading(false);
      return;
    }
    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [orderId, params.id, router]);

  if (notFoundState) notFound();

  if (loading || !order) {
    return (
      <PageLayout>
        <div className="container" style={{ maxWidth: 700, padding: 48, textAlign: 'center' }}>
          <p>{t('loading')}</p>
        </div>
      </PageLayout>
    );
  }

  const timeline = orderTimeline(order.status, order.createdAt, order.completedAt);
  const voucherCodes = order.voucherCodes?.map((v) => v.voucherCode) ?? [];

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(t('copied'), 'success');
  };

  const handleCancel = async () => {
    if (!window.confirm(t('cancelOrderConfirm'))) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(orderId);
      setOrder(updated);
      showToast(t('orderCancelled'), 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('cancelOrderFailed'), 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageLayout>
      <div className="container" style={{ maxWidth: 700 }}>
        <Link href="/orders" style={{ color: 'var(--dark-gray)', marginBottom: 24, display: 'inline-block' }}>
          ← {t('backToOrders')}
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{t('orderLabel')} {formatOrderId(order.id)}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={order.status} />
            {canCancelOrder(order.status, order.paymentMethod, flags) && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? t('processing') : t('cancelOrder')}
              </button>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">{t('statusTimeline')}</h2>
          <div className="timeline">
            {timeline.map((step, i) => (
              <div key={i} className={`timeline-item ${step.done ? 'done' : ''}`}>
                <div className="timeline-dot">{step.done ? '✓' : ''}</div>
                <div>
                  <div className="timeline-label">{step.label}</div>
                  {step.time && <div className="timeline-time">{step.time}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">{t('orderItems')}</h2>
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              {order.product.name} x{order.quantity} — {formatPrice(Number(order.totalPrice))}
            </li>
          </ul>
          {order.topUpInput && (
            <div style={{ marginTop: 12, fontSize: 14, color: 'var(--dark-gray)' }}>
              <p style={{ margin: '4px 0' }}><strong>{t('player')}:</strong> {order.topUpInput.playerName ?? order.topUpInput.playerId}</p>
              <p style={{ margin: '4px 0' }}><strong>Player ID:</strong> {order.topUpInput.playerId}</p>
              {order.topUpInput.serverId && <p style={{ margin: '4px 0' }}><strong>Server:</strong> {order.topUpInput.serverId}</p>}
              <p style={{ margin: '4px 0' }}><strong>Package:</strong> {order.topUpInput.catalogueName}</p>
            </div>
          )}
        </div>

        {voucherCodes.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 className="section-title">{t('voucherCodes')}</h2>
            {voucherCodes.map((code) => (
              <div key={code} className="voucher-box">
                <span>{code}</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => copyCode(code)} aria-label={`Copy code ${code}`}>
                  📋 {t('copy')}
                </button>
              </div>
            ))}
            <p style={{ fontSize: 13, color: 'var(--dark-gray)' }}>⚠️ {t('saveCodesWarning')}</p>
          </div>
        )}

        <div className="card">
          <h2 className="section-title">{t('paymentInfo')}</h2>
          <p><strong>{t('method')}:</strong> {order.paymentMethod ?? '—'}</p>
          <p><strong>{t('amount')}:</strong> {formatPrice(Number(order.totalPrice))}</p>
          {order.paymentProof?.reference && (
            <p><strong>{t('transactionRef')}:</strong> {order.paymentProof.reference}</p>
          )}
          <p style={{ marginTop: 16 }}>
            <Link href="/help" style={{ color: 'var(--blue)' }}>{t('needHelp')}</Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
