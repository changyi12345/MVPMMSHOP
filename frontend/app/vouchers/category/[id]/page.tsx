'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import VoucherCard from '@/components/VoucherCard';
import { fetchVoucherCategories, fetchVouchers, VoucherCategory } from '@/lib/api/vouchers';

export default function VoucherCategoryPage({ params }: { params: { id: string } }) {
  const categoryId = Number(params.id);
  const [category, setCategory] = useState<VoucherCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Awaited<ReturnType<typeof fetchVouchers>>>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchVoucherCategories(), fetchVouchers(categoryId)])
      .then(([categories, list]) => {
        if (cancelled) return;
        setCategory(categories.find((c) => c.id === categoryId) ?? null);
        setProducts(list);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [categoryId]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.categoryTitle.toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <PageLayout>
      <div className="container">
        <Link href="/vouchers" style={{ color: 'var(--dark-gray)', marginBottom: 16, display: 'inline-block' }}>
          ← Back to Gift Cards
        </Link>
        <h1 className="page-title">{category?.title ?? 'Gift Cards'}</h1>
        {category && (
          <p style={{ color: 'var(--dark-gray)', marginBottom: 24 }}>
            {category.productCount} products available
          </p>
        )}

        {loading && <p style={{ color: 'var(--dark-gray)' }}>Loading...</p>}
        {error && <p style={{ color: 'var(--red, #ef4444)' }}>{error}</p>}

        {!loading && !error && (
          <>
            <input
              type="search"
              className="search-bar"
              placeholder="🔍 Search in this category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid-3 cards-scroll-mobile">
              {visible.map((voucher) => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))}
            </div>
            {visible.length === 0 && (
              <p style={{ color: 'var(--dark-gray)', padding: '24px 0' }}>No products found.</p>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
