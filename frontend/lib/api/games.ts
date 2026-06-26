import { GameFieldDefinition, buildFieldDefinitions } from '@/lib/game-fields';
import { fetchMmkPerUsd, formatMmk, usdToMmk } from '@/lib/format-price';

export interface ApiGame {
  id: number;
  code: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  type: 'direct_topup';
  minPriceMmk: number | null;
  currency: 'MMK';
  isMlbbUnified?: boolean;
}

export interface ApiGamePackage {
  id: number;
  name: string;
  amount: number;
  unitPrice: number;
  sourcePriceUsd: number;
  currency: 'MMK';
}

export interface ApiGameDetail extends ApiGame {
  packages: ApiGamePackage[];
  playerFields: GameFieldDefinition[];
  fieldNotes: string | null;
}

export interface ValidatePlayerResult {
  valid: boolean;
  playerName: string;
  openid?: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const G2BULK_BASE = 'https://api.g2bulk.com';

export { formatMmk };

function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${G2BULK_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function parseErrorMessage(data: { message?: string | string[] }): string {
  if (Array.isArray(data.message)) return data.message[0] ?? 'Request failed';
  return data.message ?? 'Request failed';
}

async function fetchG2BulkFields(code: string) {
  const res = await fetch(`${G2BULK_BASE}/v1/games/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game: code }),
    cache: 'no-store',
  });
  if (!res.ok) return { fields: ['userid'], notes: null };
  const data = await res.json();
  return {
    fields: (data.info?.fields as string[]) ?? ['userid'],
    notes: (data.info?.notes as string) ?? null,
  };
}

async function fetchG2BulkFieldsWithServers(code: string) {
  try {
    const res = await fetch(`/api/games/${encodeURIComponent(code)}/fields`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return {
        playerFields: data.playerFields as GameFieldDefinition[],
        fieldNotes: (data.fieldNotes as string | null) ?? null,
      };
    }
  } catch {
    // fall through
  }

  const { fields: apiFields, notes } = await fetchG2BulkFields(code);
  return {
    playerFields: buildFieldDefinitions(apiFields, null),
    fieldNotes: notes,
  };
}

async function fetchGamesFromG2Bulk(): Promise<ApiGame[]> {
  const res = await fetch(`${G2BULK_BASE}/v1/games`, { cache: 'no-store' });
  if (!res.ok) throw new Error('G2Bulk games request failed');
  const data = await res.json();
  if (!data.success || !Array.isArray(data.games)) {
    throw new Error('Invalid G2Bulk response');
  }
  return data.games.map((g: { id: number; code: string; name: string; image_url: string | null }) => ({
    id: g.id,
    code: g.code,
    slug: g.code,
    name: g.name,
    imageUrl: resolveImageUrl(g.image_url),
    type: 'direct_topup' as const,
    minPriceMmk: null,
    currency: 'MMK' as const,
  }));
}

function normalizeGame(raw: Record<string, unknown>): ApiGame {
  const minPriceMmk = raw.minPriceMmk != null ? Number(raw.minPriceMmk) : null;

  return {
    id: Number(raw.id),
    code: String(raw.code),
    slug: String(raw.slug ?? raw.code),
    name: String(raw.name),
    imageUrl: (raw.imageUrl as string | null) ?? null,
    type: 'direct_topup',
    minPriceMmk: Number.isFinite(minPriceMmk) ? minPriceMmk : null,
    currency: 'MMK',
    isMlbbUnified: raw.isMlbbUnified as boolean | undefined,
  };
}

function normalizePackage(raw: Record<string, unknown>, mmkPerUsd: number): ApiGamePackage {
  const sourceUsd = Number(raw.sourcePriceUsd ?? raw.priceUsd ?? raw.amount ?? 0);
  const unitPrice =
    raw.unitPrice != null
      ? Number(raw.unitPrice)
      : usdToMmk(sourceUsd, mmkPerUsd);

  return {
    id: Number(raw.id),
    name: String(raw.name),
    amount: Number(raw.amount ?? sourceUsd),
    sourcePriceUsd: sourceUsd,
    unitPrice,
    currency: 'MMK',
  };
}

export async function fetchGames(): Promise<ApiGame[]> {
  try {
    const res = await fetch(`${API_BASE}/games`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return (data as Record<string, unknown>[]).map(normalizeGame);
    }
  } catch {
    // Backend unavailable
  }
  return fetchGamesFromG2Bulk();
}

export async function fetchGame(code: string): Promise<ApiGameDetail> {
  try {
    const res = await fetch(`${API_BASE}/games/${encodeURIComponent(code)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const raw = await res.json();
      return {
        ...normalizeGame(raw),
        packages: ((raw.packages as Record<string, unknown>[]) ?? []).map((p) =>
          normalizePackage(p, 1),
        ),
        playerFields: raw.playerFields as GameFieldDefinition[],
        fieldNotes: (raw.fieldNotes as string | null) ?? null,
      };
    }
  } catch {
    // fall through
  }

  const mmkPerUsd = await fetchMmkPerUsd(API_BASE);
  const games = await fetchGamesFromG2Bulk();
  const game = games.find((g) => g.code === code);
  if (!game) throw new Error('Game not found');

  const [{ playerFields, fieldNotes }, catRes] = await Promise.all([
    fetchG2BulkFieldsWithServers(code),
    fetch(`${G2BULK_BASE}/v1/games/${encodeURIComponent(code)}/catalogue`, { cache: 'no-store' }),
  ]);

  let packages: ApiGamePackage[] = [];
  let imageUrl = game.imageUrl;

  if (catRes.ok) {
    const cat = await catRes.json();
    imageUrl = resolveImageUrl(cat.game?.image_url) ?? imageUrl;
    packages = (cat.catalogues ?? []).map((c: { id: number; name: string; amount: number }) => ({
      id: c.id,
      name: c.name,
      amount: c.amount,
      sourcePriceUsd: c.amount,
      unitPrice: usdToMmk(c.amount, mmkPerUsd),
      currency: 'MMK' as const,
    }));
  }

  const minPriceMmk = packages.length
    ? Math.min(...packages.map((p) => p.unitPrice))
    : null;

  return {
    ...game,
    imageUrl,
    packages,
    minPriceMmk,
    playerFields,
    fieldNotes,
  };
}

export async function validatePlayer(
  code: string,
  fields: Record<string, string>,
): Promise<ValidatePlayerResult> {
  try {
    const res = await fetch(`${API_BASE}/games/${encodeURIComponent(code)}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    const data = await res.json();
    if (res.ok) return data;
    if (res.status < 500) {
      throw new Error(parseErrorMessage(data));
    }
  } catch (err) {
    if (!(err instanceof TypeError)) throw err;
  }

  const res = await fetch(`/api/games/${encodeURIComponent(code)}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(parseErrorMessage(data));
  }
  return data;
}
