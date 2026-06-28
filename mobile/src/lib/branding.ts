import type { ShopBanner } from '../api/content';
import { resolveMediaUrl } from '../api/client';

export const BRAND = {
  name: 'MVPMM SHOP',
  shortName: 'MVPMMSHOP',
  tagline: 'Your Game, Our Priority',
} as const;

export const BRAND_ASSETS = {
  logo: require('../../assets/branding/logo.jpg'),
  bannerAnyGame: require('../../assets/branding/banner-any-game.jpg'),
  bannerGames: require('../../assets/branding/banner-games.jpg'),
  bannerVouchers: require('../../assets/branding/banner-vouchers.jpg'),
} as const;

/** Home hero carousel when CMS has no banners */
export const DEFAULT_HERO_BANNERS: ShopBanner[] = [
  {
    id: -1,
    title: 'Top Up Any Game',
    imageUrl: 'brand:anyGame',
    linkUrl: '/games',
    position: 'hero',
  },
  {
    id: -2,
    title: 'Game Top Up',
    imageUrl: 'brand:games',
    linkUrl: '/games',
    position: 'hero',
  },
  {
    id: -3,
    title: 'Gift Card Top Up',
    imageUrl: 'brand:vouchers',
    linkUrl: '/vouchers',
    position: 'hero',
  },
];

export function resolveShopLogoSource(apiLogoUrl: string | null | undefined) {
  const resolved = resolveMediaUrl(apiLogoUrl ?? undefined);
  if (resolved) return { uri: resolved };
  return BRAND_ASSETS.logo;
}

export function resolveBannerSource(banner: ShopBanner) {
  if (banner.imageUrl === 'brand:anyGame') return BRAND_ASSETS.bannerAnyGame;
  if (banner.imageUrl === 'brand:games') return BRAND_ASSETS.bannerGames;
  if (banner.imageUrl === 'brand:vouchers') return BRAND_ASSETS.bannerVouchers;
  if (banner.imageUrl?.startsWith('http')) return { uri: banner.imageUrl };
  if (banner.imageUrl) return { uri: banner.imageUrl };
  return null;
}

export function isDefaultBanner(banner: ShopBanner): boolean {
  return banner.id < 0;
}
