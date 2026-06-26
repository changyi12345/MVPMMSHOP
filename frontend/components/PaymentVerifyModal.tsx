'use client';

import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';
import { rejectPayment } from '@/lib/api/admin';
import { formatPrice } from '@/lib/format-price';
import { resolveMediaUrl } from '@/lib/media-url';

interface PaymentVerifyModalProps {
  order: {
    id: string;
    numericId: number;
    customer: string;
    total: number;
    status: string;
    paymentMethod?: string | null;
    paymentProof?: {
      method?: string;
      reference?: string | null;
      note?: string | null;
      imageUrl?: string | null;
    } | null;
  } | null;
  onClose: () => void;
  onVerified: (orderId: string) => void;
}

export default function PaymentVerifyModal({ order, onClose, onVerified }: PaymentVerifyModalProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const { showToast } = useToast();

  if (!order) return null;

  const proof = order.paymentProof;
  const proofImageSrc = resolveMediaUrl(proof?.imageUrl ?? null);

  const handleVerify = () => {
    onVerified(order.id);
    onClose();
  };

  const handleReject = async () => {
    setRejectOpen(false);
    try {
      await rejectPayment(order.numericId, 'Payment proof rejected by admin');
      showToast(`Payment rejected for ${order.id}`, 'warning');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Reject failed', 'error');
    }
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} role="presentation">
        <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <h2 className="modal-title">Payment Verification — {order.id}</h2>
          <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--dark-gray)' }}>
            <p><strong>Customer:</strong> {order.customer}</p>
            <p><strong>Amount Expected:</strong> {formatPrice(order.total)}</p>
            <p><strong>Payment Method:</strong> {proof?.method ?? order.paymentMethod ?? '—'}</p>
          </div>
          {proofImageSrc ? (
            <a href={proofImageSrc} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={proofImageSrc} alt="Payment proof" style={{ width: '100%', borderRadius: 8, maxHeight: 240, objectFit: 'contain' }} />
            </a>
          ) : (
            <div className="upload-zone" style={{ marginBottom: 16, padding: 24 }}>
              <div className="upload-icon">🖼️</div>
              <p>No payment screenshot uploaded</p>
            </div>
          )}
          <p style={{ fontSize: 14, marginBottom: 8 }}><strong>Reference:</strong> {proof?.reference ?? '—'}</p>
          {proof?.note && <p style={{ fontSize: 13, color: 'var(--dark-gray)', marginBottom: 20 }}>{proof.note}</p>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={handleVerify}>
              ✅ Verify Payment
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setRejectOpen(true)}>
              ❌ Reject
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={rejectOpen}
        title="Reject Payment?"
        message="Customer will be notified to re-upload payment proof."
        confirmLabel="Reject"
        cancelLabel="Cancel"
        danger
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />
    </>
  );
}
