'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchVoucherCategories, VoucherCategory } from '@/lib/api/vouchers';
import VoucherCategoryCard from '@/components/VoucherCategoryCard';

interface VouchersGridProps {
  compact?: boolean;
  home?: boolean;
  limit?: number;
  search?: string;
  categoryFilter?: string;
  categories?: VoucherCategory[];
  loadingExternal?: boolean;
}

export default function VouchersGrid({
  compact,
  home,
  limit,
  search = '',
  categoryFilter = 'all',
  categories: categoriesProp,
  loadingExternal,
}: VouchersGridProps) {
  const [categoriesLocal, setCategoriesLocal] = useState<VoucherCategory[]>([]);
  const [loadingLocal, setLoadingLocal] = useState(!categoriesProp);
  const [error, setError] = useState<string | null>(null);

  const categories = categoriesProp ?? categoriesLocal;
  const loading = loadingExternal ?? loadingLocal;

  useEffect(() => {
    if (categoriesProp) return;

    let cancelled = false;
    setLoadingLocal(true);
    fetchVoucherCategories()
      .then((data) => {
        if (!cancelled) {
          setCategoriesLocal(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load vouchers');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLocal(false);
      });
    return () => { cancelled = true; };
  }, [categoriesProp]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = categories;

    if (categoryFilter !== 'all') {
      const id = Number(categoryFilter);
      list = list.filter((c) => c.id === id);
    }

    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    if (limit) list = list.slice(0, limit);
    return list;
  }, [categories, search, categoryFilter, limit]);

  if (loading) {
    return (
      <div className={compact ? 'scroll-row scroll-row--home cards-scroll-mobile cards-grid-mobile' : 'grid-3 cards-scroll-mobile cards-grid-mobile'}>
        {Array.from({ length: compact ? 6 : 6 }).map((_, i) => (
          <div key={i} className={`game-card game-card-skeleton${home ? ' game-card--home' : ''}`} aria-hidden />
        ))}
      </div>
    );
  }

  if (error) {
    return <p style={{ color: 'var(--red, #ef4444)', padding: '24px 0' }}>{error}</p>;
  }

  return (
    <>
      <div className={compact ? 'scroll-row scroll-row--home cards-scroll-mobile cards-grid-mobile' : 'grid-3 cards-scroll-mobile cards-grid-mobile'}>
        {visible.map((category) => (
          <VoucherCategoryCard key={category.id} category={category} compact={compact} home={home} />
        ))}
      </div>
      {!compact && visible.length === 0 && (
        <p style={{ color: 'var(--dark-gray)', padding: '24px 0' }}>No gift cards match your search.</p>
      )}
    </>
  );
}
