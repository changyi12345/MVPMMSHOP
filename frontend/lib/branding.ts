import type { ShopBanner } from '@/lib/api/content';

/** Static brand assets in /public/branding */
export const BRAND = {
  name: 'MVPMM SHOP',
  shortName: 'MVPMMSHOP',
  tagline: 'Your Game, Our Priority',
  logo: '/branding/logo.jpg',
  banners: {
    anyGame: '/branding/banner-any-game.jpg',
    games: '/branding/banner-games.jpg',
    vouchers: '/branding/banner-vouchers.jpg',
  },
} as const;

const bannerBase = {
  position: 'hero',
  sortOrder: 0,
  isActive: true,
  startsAt: null,
  endsAt: null,
} satisfies Omit<ShopBanner, 'id' | 'title' | 'imageUrl' | 'linkUrl'>;

/** Home hero carousel when CMS has no banners */
export const DEFAULT_HERO_BANNERS: ShopBanner[] = [
  {
    id: -1,
    title: 'Top Up Any Game',
    imageUrl: BRAND.banners.anyGame,
    linkUrl: '/games',
    ...bannerBase,
    sortOrder: 1,
  },
  {
    id: -2,
    title: 'Game Top Up',
    imageUrl: BRAND.banners.games,
    linkUrl: '/games',
    ...bannerBase,
    sortOrder: 2,
  },
  {
    id: -3,
    title: 'Gift Card Top Up',
    imageUrl: BRAND.banners.vouchers,
    linkUrl: '/vouchers',
    ...bannerBase,
    sortOrder: 3,
  },
];

export function isBrandAssetUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('/branding/');
}

export function resolveShopLogoUrl(apiLogoUrl: string | null | undefined): string {
  if (apiLogoUrl?.trim()) return apiLogoUrl;
  return BRAND.logo;
}
