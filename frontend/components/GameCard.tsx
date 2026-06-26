'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ApiGame } from '@/lib/api/games';
import { useLang } from '@/lib/useLang';

interface GameCardProps {
  game: ApiGame;
  compact?: boolean;
}

export default function GameCard({ game, compact }: GameCardProps) {
  const { t } = useLang();

  return (
    <Link href={`/games/${game.slug}`} className="game-card">
      <div className={`game-card-image-wrap ${compact ? 'compact' : ''}`}>
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.name}
            width={compact ? 80 : 120}
            height={compact ? 80 : 120}
            className="game-card-image"
            unoptimized
          />
        ) : (
          <div className="game-card-icon">🎮</div>
        )}
      </div>
      <div className="game-card-name">{game.name}</div>
      {!compact && (
        <div className="game-card-type">
          {game.isMlbbUnified ? t('allRegions') : t('directTopUp')}
        </div>
      )}
      {!compact && <span className="btn btn-primary btn-sm">{t('topUpNow')}</span>}
    </Link>
  );
}
