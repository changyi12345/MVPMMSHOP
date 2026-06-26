export const MLBB_UNIFIED_CODE = 'mlbb_unified';

export interface MlbbRegion {
  id: string;
  label: string;
  labelMm: string;
  flag: string;
  gameCode: string;
  note?: string;
}

export const MLBB_REGIONS: MlbbRegion[] = [
  { id: 'mm', label: 'Myanmar', labelMm: 'မြန်မာ', flag: '🇲🇲', gameCode: 'mlbb' },
  { id: 'id', label: 'Indonesia', labelMm: 'Indonesia', flag: '🇮🇩', gameCode: 'mlbb_global', note: 'Indonesia players' },
  { id: 'global', label: 'Global', labelMm: 'Global', flag: '🌍', gameCode: 'mlbb_global' },
  { id: 'ru', label: 'Russia', labelMm: 'Russia', flag: '🇷🇺', gameCode: 'mlbb_ru' },
  { id: 'tr', label: 'Turkey', labelMm: 'Turkey', flag: '🇹🇷', gameCode: 'mlbb_tr' },
  { id: 'br', label: 'Brazil', labelMm: 'Brazil', flag: '🇧🇷', gameCode: 'mlbb_br' },
  { id: 'special', label: 'Special', labelMm: 'Special', flag: '⭐', gameCode: 'mlbb_special' },
  { id: 'exclusive', label: 'Exclusive', labelMm: 'Exclusive', flag: '💎', gameCode: 'mlbb_exclusive' },
];

export function isMlbbVariant(code: string): boolean {
  return code === 'mlbb' || code.startsWith('mlbb_');
}

export function isMlbbUnified(code: string): boolean {
  return code === MLBB_UNIFIED_CODE || isMlbbVariant(code);
}
