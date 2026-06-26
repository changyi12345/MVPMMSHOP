import { ApiGame } from '@/lib/api/games';
import { isMlbbVariant, MLBB_UNIFIED_CODE } from '@/lib/mlbb-regions';

export function groupGamesForDisplay(games: ApiGame[]): ApiGame[] {
  const mlbbVariants = games.filter((g) => isMlbbVariant(g.code));
  const others = games.filter((g) => !isMlbbVariant(g.code));

  if (mlbbVariants.length === 0) return games;

  const primary = mlbbVariants.find((g) => g.code === 'mlbb') ?? mlbbVariants[0];
  const minPriceMmk = mlbbVariants.reduce<number | null>((min, g) => {
    if (g.minPriceMmk == null) return min;
    return min == null ? g.minPriceMmk : Math.min(min, g.minPriceMmk);
  }, null);

  const unified: ApiGame = {
    ...primary,
    code: MLBB_UNIFIED_CODE,
    slug: MLBB_UNIFIED_CODE,
    name: 'Mobile Legends: Bang Bang',
    minPriceMmk,
    currency: 'MMK',
    isMlbbUnified: true,
  };

  return [unified, ...others];
}
