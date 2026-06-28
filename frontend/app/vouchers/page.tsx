'use client';

import { useEffect, useMemo, useState } from 'react';
import ShopPageShell from '@/components/ShopPageShell';
import VouchersGrid from '@/components/VouchersGrid';
import CatalogFilterBar from '@/components/CatalogFilterBar';
import { fetchVoucherCategories, VoucherCategory } from '@/lib/api/vouchers';
import { useLang } from '@/lib/useLang';

export default function VouchersPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<VoucherCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetchVoucherCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const chips = useMemo(
    () => [
      { id: 'all', label: t('filterAll') },
      ...categories.map((c) => ({ id: String(c.id), label: c.title })),
    ],
    [categories, t],
  );

  return (
    <ShopPageShell
      title={t('vouchersGiftCards')}
      emoji="🎁"
      badge="Vouchers"
      subtitle={t('vouchersPageDesc')}
    >
      <CatalogFilterBar
        search={search}
        onSearchChange={setSearch}
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        chips={chips}
        searchPlaceholder={t('searchVouchers')}
        scrollChips
      />
      <div className="shop-panel cards-scroll-host">
        <VouchersGrid
          search={search}
          categoryFilter={categoryFilter}
          categories={categories}
          loadingExternal={loading}
        />
      </div>
    </ShopPageShell>
  );
}
