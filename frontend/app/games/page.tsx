'use client';

import { useMemo, useState } from 'react';
import ShopPageShell from '@/components/ShopPageShell';
import GamesGrid from '@/components/GamesGrid';
import CatalogFilterBar from '@/components/CatalogFilterBar';
import { useLang } from '@/lib/useLang';
import type { GamePlatformFilter } from '@/lib/game-platform';

export default function GamesPage() {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<GamePlatformFilter>('all');
  const { t } = useLang();

  const chips = useMemo(
    () => [
      { id: 'all', label: t('filterAll') },
      { id: 'mobile', label: t('filterMobileGames') },
      { id: 'pc', label: t('filterPcGames') },
    ],
    [t],
  );

  return (
    <ShopPageShell title={t('gamesTopUp')} emoji="🎮" badge="Games" subtitle={t('searchGames')}>
      <CatalogFilterBar
        search={search}
        onSearchChange={setSearch}
        activeFilter={platformFilter}
        onFilterChange={(id) => setPlatformFilter(id as GamePlatformFilter)}
        chips={chips}
        searchPlaceholder={t('searchGames')}
      />
      <div className="shop-panel cards-scroll-host">
        <GamesGrid search={search} platformFilter={platformFilter} />
      </div>
    </ShopPageShell>
  );
}
