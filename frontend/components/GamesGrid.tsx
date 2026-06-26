'use client';

import { useEffect, useMemo, useState } from 'react';
import GameCard from '@/components/GameCard';
import { ApiGame, fetchGames } from '@/lib/api/games';
import { groupGamesForDisplay } from '@/lib/groupGames';
import { matchesGamePlatformFilter, type GamePlatformFilter } from '@/lib/game-platform';

interface GamesGridProps {
  compact?: boolean;
  search?: string;
  platformFilter?: GamePlatformFilter;
}

export default function GamesGrid({
  compact,
  search = '',
  platformFilter = 'all',
}: GamesGridProps) {
  const [games, setGames] = useState<ApiGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames()
      .then((data) => setGames(groupGamesForDisplay(data)))
      .catch(() => setError('Games load မအောင်မြင်ပါ'))
      .finally(() => setLoading(false));
  }, []);

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
      <div className={compact ? 'scroll-row' : 'grid-4'}>
        {Array.from({ length: compact ? 4 : 8 }).map((_, i) => (
          <div key={i} className="game-card game-card-skeleton" aria-hidden />
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
      <div className="scroll-row">
        {filtered.map((game) => (
          <GameCard key={game.code} game={game} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="grid-4">
      {filtered.map((game) => (
        <GameCard key={game.code} game={game} />
      ))}
    </div>
  );
}
