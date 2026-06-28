'use client';

import Link from 'next/link';
import Image from 'next/image';
import { VoucherCategory } from '@/lib/api/vouchers';
import { useLang } from '@/lib/useLang';

interface VoucherCategoryCardProps {
  category: VoucherCategory;
  compact?: boolean;
  home?: boolean;
}

export default function VoucherCategoryCard({ category, compact, home }: VoucherCategoryCardProps) {
  const { t } = useLang();

  return (
    <Link
      href={`/vouchers/category/${category.id}`}
      className={`game-card${compact ? ' game-card--compact' : ''}${home ? ' game-card--home' : ''}`}
    >
      <div className={`game-card-image-wrap ${compact ? 'compact' : ''}`}>
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.title}
            width={compact ? 72 : 120}
            height={compact ? 72 : 120}
            className="game-card-image"
            unoptimized
          />
        ) : (
          <div className="game-card-icon">🎁</div>
        )}
      </div>
      <div className="game-card-name">{category.title}</div>
      {home && compact && (
        <span className="game-card-home-action">{t('browseCards')}</span>
      )}
      {!compact && (
        <div className="game-card-type">{category.productCount} products</div>
      )}
      {!compact && <span className="btn btn-primary btn-sm">{t('browseCards')}</span>}
    </Link>
  );
}
