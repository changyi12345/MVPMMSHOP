'use client';

import Link from 'next/link';
import Image from 'next/image';
import { VoucherCategory } from '@/lib/api/vouchers';
import { useLang } from '@/lib/useLang';

interface VoucherCategoryCardProps {
  category: VoucherCategory;
  compact?: boolean;
}

export default function VoucherCategoryCard({ category, compact }: VoucherCategoryCardProps) {
  const { t } = useLang();

  return (
    <Link href={`/vouchers/category/${category.id}`} className="game-card">
      <div className={`game-card-image-wrap ${compact ? 'compact' : ''}`}>
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.title}
            width={compact ? 80 : 120}
            height={compact ? 80 : 120}
            className="game-card-image"
            unoptimized
          />
        ) : (
          <div className="game-card-icon">🎁</div>
        )}
      </div>
      <div className="game-card-name">{category.title}</div>
      {!compact && (
        <div className="game-card-type">{category.productCount} products</div>
      )}
      {!compact && <span className="btn btn-primary btn-sm">{t('browseCards')}</span>}
    </Link>
  );
}
