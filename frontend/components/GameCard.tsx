'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ApiGame, formatMmk } from '@/lib/api/games';
import { useLang } from '@/lib/useLang';

interface GameCardProps {
  game: ApiGame;
  compact?: boolean;
  home?: boolean;
}

export default function GameCard({ game, compact, home }: GameCardProps) {
  const { t } = useLang();

  return (
    <Link
      href={`/games/${game.slug}`}
      className={`game-card${compact ? ' game-card--compact' : ''}${home ? ' game-card--home' : ''}`}
    >
      <div className={`game-card-image-wrap ${compact ? 'compact' : ''}`}>
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.name}
            width={compact ? 72 : 120}
            height={compact ? 72 : 120}
            className="game-card-image"
            unoptimized
          />
        ) : (
          <div className="game-card-icon">🎮</div>
        )}
      </div>
      <div className="game-card-name">{game.name}</div>
      {home && compact && game.minPriceMmk != null && (
        <div className="game-card-price game-card-price--home">{formatMmk(game.minPriceMmk)}+</div>
      )}
      {home && compact && (
        <span className="game-card-home-action">{t('topUpNow')}</span>
      )}
      {!compact && (
        <div className="game-card-type">
          {game.isMlbbUnified ? t('allRegions') : t('directTopUp')}
        </div>
      )}
      {!compact && <span className="btn btn-primary btn-sm">{t('topUpNow')}</span>}
    </Link>
  );
}
