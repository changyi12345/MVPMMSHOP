'use client';

import { useEffect, useMemo, useState } from 'react';
import GameCard from '@/components/GameCard';
import { ApiGame, fetchGames, fetchPopularGames } from '@/lib/api/games';
import { groupGamesForDisplay } from '@/lib/groupGames';
import { matchesGamePlatformFilter, type GamePlatformFilter } from '@/lib/game-platform';

interface GamesGridProps {
  compact?: boolean;
  home?: boolean;
  popular?: boolean;
  limit?: number;
  search?: string;
  platformFilter?: GamePlatformFilter;
}

export default function GamesGrid({
  compact,
  home,
  popular,
  limit = 12,
  search = '',
  platformFilter = 'all',
}: GamesGridProps) {
  const [games, setGames] = useState<ApiGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loader = popular ? fetchPopularGames(limit) : fetchGames();
    loader
      .then((data) => setGames(groupGamesForDisplay(data)))
      .catch(() => setError('Games load မအောင်မြင်ပါ'))
      .finally(() => setLoading(false));
  }, [popular, limit]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return games.filter((g) => {
      if (!matchesGamePlatformFilter(g, platformFilter)) return false;
      if (!q) return true;
      return g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q);
    });
  }, [games, search, platformFilter]);

  if (loading) {
    return (
      <div className={compact ? 'scroll-row scroll-row--home cards-scroll-mobile cards-grid-mobile' : 'grid-4 cards-scroll-mobile cards-grid-mobile'}>
        {Array.from({ length: compact ? 6 : 8 }).map((_, i) => (
          <div key={i} className={`game-card game-card-skeleton${home ? ' game-card--home' : ''}`} aria-hidden />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="empty-text">{error}</p>;
  }

  if (filtered.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎮</div>
        <p className="empty-text">No games found</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="scroll-row scroll-row--home cards-scroll-mobile cards-grid-mobile">
        {filtered.map((game) => (
          <GameCard key={game.code} game={game} compact home={home} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid-4 cards-scroll-mobile cards-grid-mobile">
      {filtered.map((game) => (
        <GameCard key={game.code} game={game} />
      ))}
    </div>
  );
}
