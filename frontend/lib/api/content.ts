const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ShopBanner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface ShopEvent {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  isPublished: boolean;
  isPinned: boolean;
  publishedAt: string;
}

export interface HomeContent {
  shopName: string;
  shopTagline: string | null;
  logoUrl: string | null;
  heroBanners: ShopBanner[];
  midBanners: ShopBanner[];
  events: ShopEvent[];
}

export async function fetchHomeContent(): Promise<HomeContent> {
  const res = await fetch(`${API_BASE}/content/home`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load content');
  return res.json();
}

export async function fetchPublishedEvents(): Promise<ShopEvent[]> {
  const res = await fetch(`${API_BASE}/content/events`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load events');
  return res.json();
}

export async function fetchEventBySlug(slug: string): Promise<ShopEvent> {
  const res = await fetch(`${API_BASE}/content/events/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Event not found');
  return res.json();
}
