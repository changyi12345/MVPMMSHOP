'use client';

import Image from 'next/image';
import StatusBadge from '@/components/StatusBadge';
import { AdminOrderDetail } from '@/lib/api/admin';
import { formatOrderId } from '@/lib/api/orders';
import { formatPrice } from '@/lib/format-price';
import { resolveMediaUrl } from '@/lib/media-url';

interface AdminOrderDetailModalProps {
  order: AdminOrderDetail | null;
  loading?: boolean;
  onClose: () => void;
  onVerify?: () => void;
  onReject?: () => void;
  onRefund?: () => void;
}

export default function AdminOrderDetailModal({
  order,
  loading,
  onClose,
  onVerify,
  onReject,
  onRefund,
}: AdminOrderDetailModalProps) {
  if (!order && !loading) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {loading || !order ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--dark-gray)' }}>Loading...</p>
        ) : (
          <>
            <h2 className="modal-title">Order {formatOrderId(order.id)}</h2>
            <div style={{ marginBottom: 16 }}>
              <StatusBadge status={order.status} />
              <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--dark-gray)' }}>
                {order.createdAt.slice(0, 16).replace('T', ' ')}
              </span>
            </div>

            <div style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.7 }}>
              <p><strong>Customer:</strong> {order.user.username} ({order.user.email})</p>
              <p><strong>Product:</strong> {order.product.name} × {order.quantity}</p>
              <p><strong>Total:</strong> {formatPrice(order.totalPrice)}</p>
              <p><strong>Payment:</strong> {order.paymentMethod ?? '—'}</p>
              {order.remark && <p><strong>Remark:</strong> {order.remark}</p>}
            </div>

            {order.topUpInput && (
              <div className="card" style={{ padding: 12, marginBottom: 16, background: 'var(--gray)' }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Top-Up Details</p>
                <p style={{ fontSize: 13 }}>Game: {order.topUpInput.gameCode}</p>
                <p style={{ fontSize: 13 }}>Player ID: {order.topUpInput.playerId}</p>
                {order.topUpInput.serverId && <p style={{ fontSize: 13 }}>Server: {order.topUpInput.serverId}</p>}
                {order.topUpInput.playerName && <p style={{ fontSize: 13 }}>Name: {order.topUpInput.playerName}</p>}
                <p style={{ fontSize: 13 }}>Package: {order.topUpInput.catalogueName}</p>
              </div>
            )}

            {order.voucherCodes.length > 0 && (
              <div className="card" style={{ padding: 12, marginBottom: 16, background: 'var(--gray)' }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Voucher Codes</p>
                {order.voucherCodes.map((code) => (
                  <code key={code} style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>{code}</code>
                ))}
              </div>
            )}

            {order.paymentProof && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Payment Proof</p>
                <p style={{ fontSize: 13, marginBottom: 8 }}>
                  {order.paymentProof.method} · Ref: {order.paymentProof.reference ?? '—'} · {order.paymentProof.status}
                </p>
                {order.paymentProof.note && (
                  <p style={{ fontSize: 13, color: 'var(--dark-gray)', marginBottom: 8 }}>{order.paymentProof.note}</p>
                )}
                {order.paymentProof.imageUrl ? (
                  <a href={resolveMediaUrl(order.paymentProof.imageUrl)!} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={resolveMediaUrl(order.paymentProof.imageUrl)!}
                      alt="Payment proof"
                      width={400}
                      height={240}
                      unoptimized
                      style={{ width: '100%', height: 'auto', borderRadius: 8, maxHeight: 280, objectFit: 'contain' }}
                    />
                  </a>
                ) : (
                  <div className="upload-zone" style={{ padding: 20 }}>
                    <p>No screenshot uploaded</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(order.status === 'PENDING' || order.status === 'PAYMENT_PENDING') && onVerify && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={onVerify}>
                  Verify Payment
                </button>
              )}
              {(order.status === 'PENDING' || order.status === 'PAYMENT_PENDING') && onReject && (
                <button type="button" className="btn btn-outline btn-sm" onClick={onReject}>
                  Reject Payment
                </button>
              )}
              {(['COMPLETED', 'PROCESSING', 'PAYMENT_PENDING'] as string[]).includes(order.status) && onRefund && (
                <button type="button" className="btn btn-outline btn-sm" onClick={onRefund}>
                  Refund to Wallet
                </button>
              )}
              <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
