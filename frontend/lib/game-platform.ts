import { isMlbbVariant, MLBB_UNIFIED_CODE } from '@/lib/mlbb-regions';

export type GamePlatform = 'mobile' | 'pc';
export type GamePlatformFilter = 'all' | GamePlatform;

const PC_CODE_HINTS = [
  'lol',
  'valorant',
  'dota',
  'csgo',
  'cs2',
  'counter_strike',
  'overwatch',
  'diablo',
  'wow',
  'warcraft',
  'starcraft',
  'hearthstone',
  'league',
  'riot',
  'path_of_exile',
  'ffxiv',
  'lost_ark',
  'guild_wars',
  'starfield',
  'battlenet',
];

const PC_NAME_HINTS = [
  'league of legends',
  'valorant',
  'dota 2',
  'counter-strike',
  'overwatch',
  'world of warcraft',
  'diablo',
  'hearthstone',
  'lost ark',
  'path of exile',
  'final fantasy xiv',
  '(pc)',
  'pc game',
];

const MOBILE_CODE_HINTS = [
  'mlbb',
  'pubgm',
  'pubg_mobile',
  'pubg-m',
  'freefire',
  'free_fire',
  'genshin',
  'honkai',
  'hsr',
  'codm',
  'cod_mobile',
  'wildrift',
  'wild_rift',
  'mobile',
  'aov',
  'arenaofvalor',
  'brawl',
  'clash',
  'bloodstrike',
  'farlight',
  'efootball',
  'fcmobile',
  'dragonheir',
  'wuthering',
  'zenless',
  'super_sus',
  'state_of',
  'whiteout',
  'love_and_deepspace',
];

const MOBILE_NAME_HINTS = [
  'mobile legends',
  'pubg mobile',
  'free fire',
  'call of duty mobile',
  'wild rift',
  'arena of valor',
  'mobile game',
  'mobile',
  'bang bang',
];

function matchesHint(value: string, hints: string[]): boolean {
  return hints.some((hint) => value.includes(hint));
}

/** Classify a G2Bulk top-up game as mobile or PC for catalogue filters. */
export function inferGamePlatform(game: { code: string; name: string }): GamePlatform {
  const code = game.code.toLowerCase();
  const name = game.name.toLowerCase();

  if (code === MLBB_UNIFIED_CODE || isMlbbVariant(code)) {
    return 'mobile';
  }

  const mobileMatch =
    matchesHint(code, MOBILE_CODE_HINTS) || matchesHint(name, MOBILE_NAME_HINTS);
  const pcMatch = matchesHint(code, PC_CODE_HINTS) || matchesHint(name, PC_NAME_HINTS);

  if (mobileMatch && !pcMatch) return 'mobile';
  if (pcMatch && !mobileMatch) return 'pc';
  if (mobileMatch && pcMatch) {
    if (name.includes('mobile') || code.includes('mobile') || code.includes('pubgm')) {
      return 'mobile';
    }
    return 'pc';
  }

  return 'mobile';
}

export function matchesGamePlatformFilter(
  game: { code: string; name: string },
  filter: GamePlatformFilter,
): boolean {
  if (filter === 'all') return true;
  return inferGamePlatform(game) === filter;
}
