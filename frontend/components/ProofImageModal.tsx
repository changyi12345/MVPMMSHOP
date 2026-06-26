'use client';

import { formatPrice } from '@/lib/format-price';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLang } from '@/lib/useLang';

export interface ProofPreviewData {
  title: string;
  amount?: number;
  reference?: string | null;
  proofImageUrl: string | null;
}

interface ProofImageModalProps {
  data: ProofPreviewData | null;
  onClose: () => void;
}

export default function ProofImageModal({ data, onClose }: ProofImageModalProps) {
  const { t } = useLang();
  if (!data) return null;

  const src = resolveMediaUrl(data.proofImageUrl);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="proof-modal-title"
      >
        <h2 id="proof-modal-title" className="modal-title">{data.title}</h2>
        {(data.amount != null || data.reference) && (
          <p style={{ marginBottom: 12, color: 'var(--dark-gray)' }}>
            {data.amount != null && <span>{formatPrice(data.amount)}</span>}
            {data.amount != null && data.reference ? ' · ' : ''}
            {data.reference ? `${t('transactionRef')}: ${data.reference}` : ''}
          </p>
        )}
        {src ? (
          <a href={src} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={t('uploadPaymentProof')}
              style={{ width: '100%', borderRadius: 8, maxHeight: 360, objectFit: 'contain' }}
            />
          </a>
        ) : (
          <p className="empty-text">{t('noProofImage')}</p>
        )}
        <button type="button" className="btn btn-outline btn-full" style={{ marginTop: 16 }} onClick={onClose}>
          {t('back')}
        </button>
      </div>
    </div>
  );
}
