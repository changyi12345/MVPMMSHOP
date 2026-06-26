'use client';

import Link from 'next/link';
import Image from 'next/image';
import { VoucherProduct, formatFaceValue, formatMmk } from '@/lib/api/vouchers';
import { useLang } from '@/lib/useLang';

interface VoucherCardProps {
  voucher: VoucherProduct;
  compact?: boolean;
}

export default function VoucherCard({ voucher, compact }: VoucherCardProps) {
  const { t } = useLang();
  const faceValue = formatFaceValue(voucher.faceValue, voucher.title);

  return (
    <Link href={`/vouchers/${voucher.id}`} className="game-card">
      <div className={`game-card-image-wrap ${compact ? 'compact' : ''}`}>
        {voucher.imageUrl ? (
          <Image
            src={voucher.imageUrl}
            alt={voucher.title}
            width={compact ? 80 : 120}
            height={compact ? 80 : 120}
            className="game-card-image"
            unoptimized
          />
        ) : (
          <div className="game-card-icon">🎫</div>
        )}
      </div>
      <div className="game-card-name">{voucher.title}</div>
      {!compact && (
        <div className="game-card-type">{voucher.categoryTitle}</div>
      )}
      <div className="game-card-price">{formatMmk(voucher.unitPrice)}</div>
      {!compact && (
        <span className={`badge ${voucher.inStock ? 'badge-blue' : 'badge-gray'}`} style={{ marginBottom: 8 }}>
          {voucher.inStock ? `${t('inStock')} (${voucher.stock})` : t('outOfStock')}
        </span>
      )}
      {!compact && (
        <span className="btn btn-primary btn-sm">{voucher.inStock ? t('buyNow') : t('view')}</span>
      )}
      {compact && (
        <div style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 4 }}>{faceValue}</div>
      )}
    </Link>
  );
}
