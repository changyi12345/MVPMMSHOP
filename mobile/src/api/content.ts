import { apiFetch, resolveMediaUrl } from './client';
import { CACHE_TTL_MS, cacheGet, cacheSet } from '../lib/cache';
import { getLang } from '../i18n';

export interface ShopBanner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
}

export interface HomeContent {
  shopName: string;
  shopTagline: string | null;
  logoUrl: string | null;
  heroBanners: ShopBanner[];
  midBanners: ShopBanner[];
  events: { id: number; title: string; slug: string; excerpt: string | null; imageUrl: string | null }[];
}

export async function fetchHomeContent(): Promise<HomeContent> {
  const mapData = (data: HomeContent): HomeContent => ({
    ...data,
    logoUrl: resolveMediaUrl(data.logoUrl),
    heroBanners: data.heroBanners.map((b) => ({
      ...b,
      imageUrl: resolveMediaUrl(b.imageUrl) ?? b.imageUrl,
    })),
    midBanners: data.midBanners.map((b) => ({
      ...b,
      imageUrl: resolveMediaUrl(b.imageUrl) ?? b.imageUrl,
    })),
    events: data.events.map((e) => ({
      ...e,
      imageUrl: resolveMediaUrl(e.imageUrl),
    })),
  });

  try {
    const data = mapData(await apiFetch<HomeContent>('/content/home'));
    cacheSet('home_content', data, CACHE_TTL_MS);
    return data;
  } catch (err) {
    const cached = cacheGet<HomeContent>('home_content');
    if (cached) return cached;
    throw err;
  }
}

export { resolveMediaUrl };

export interface LegalPage {
  slug: string;
  sections: { title: string; body: string }[];
  updatedAt: string | null;
  lang: string;
}

export interface ShopEvent {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  content?: string;
  publishedAt?: string;
}

export async function fetchLegalPage(slug: string): Promise<LegalPage> {
  const lang = getLang();
  return apiFetch<LegalPage>(`/content/legal/${slug}?lang=${lang}`);
}

export async function fetchEvents(): Promise<ShopEvent[]> {
  const data = await apiFetch<ShopEvent[]>('/content/events');
  return data.map((e) => ({
    ...e,
    imageUrl: resolveMediaUrl(e.imageUrl),
  }));
}

export async function fetchEvent(slug: string): Promise<ShopEvent> {
  const data = await apiFetch<ShopEvent>(`/content/events/${slug}`);
  return {
    ...data,
    imageUrl: resolveMediaUrl(data.imageUrl),
  };
}
