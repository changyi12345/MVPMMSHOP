'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';
import { submitPaymentProof } from '@/lib/api/orders';
import { uploadPaymentProofImage } from '@/lib/api/upload';
import PaymentProofFilePicker from '@/components/PaymentProofFilePicker';

interface PaymentProofModalProps {
  orderId: string | null;
  numericOrderId?: number | null;
  paymentMethod?: string | null;
  usingMock?: boolean;
  onClose: () => void;
  onSubmitted?: (orderId: string) => void;
}

export default function PaymentProofModal({
  orderId,
  numericOrderId,
  paymentMethod,
  usingMock,
  onClose,
  onSubmitted,
}: PaymentProofModalProps) {
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { t } = useLang();

  if (!orderId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast(t('uploadRequired'), 'error');
      return;
    }
    if (!reference.trim()) {
      showToast(t('referenceRequired'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (!usingMock && numericOrderId) {
        const imageUrl = await uploadPaymentProofImage(file);
        await submitPaymentProof(numericOrderId, {
          method: paymentMethod ?? 'kbz',
          reference: reference.trim(),
          imageUrl,
        });
      }
      onSubmitted?.(orderId);
      showToast(t('paymentProofSubmitted'), 'success');
      setReference('');
      setFile(null);
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('networkError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-proof-title"
      >
        <h2 id="payment-proof-title" className="modal-title">
          {t('uploadPaymentProof')} — {orderId}
        </h2>
        <p className="modal-message">{t('uploadPaymentDesc')}</p>

        <form onSubmit={handleSubmit}>
          <PaymentProofFilePicker file={file} onFileChange={setFile} inputId="modal-payment-proof" />

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label" htmlFor="payment-ref">{t('transactionRef')}</label>
            <input
              id="payment-ref"
              type="text"
              className="form-input"
              placeholder={t('txnRefPlaceholder')}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? t('submitting') : t('submitProof')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
