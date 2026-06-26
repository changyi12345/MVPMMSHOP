import { GameFieldDefinition, buildFieldDefinitions } from '../utils/game-fields';
import { API_BASE } from '../config/api';

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

export interface ApiGameDetail extends ApiGame {
  packages: {
    id: number;
    name: string;
    amount: number;
    unitPrice: number;
    sourcePriceUsd: number;
    currency: 'MMK';
  }[];
  playerFields: GameFieldDefinition[];
  fieldNotes: string | null;
}

const G2BULK_BASE = 'https://api.g2bulk.com';

function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${G2BULK_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function fetchG2BulkFields(code: string) {
  const res = await fetch(`${G2BULK_BASE}/v1/games/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game: code }),
  });
  if (!res.ok) return { fields: ['userid'], notes: null };
  const data = await res.json();
  return {
    fields: (data.info?.fields as string[]) ?? ['userid'],
    notes: (data.info?.notes as string) ?? null,
  };
}

async function fetchMmkPerUsd(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/settings/exchange`);
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data.usdToMmkRate);
      const markup = Number(data.priceMarkupPercent ?? 0);
      if (Number.isFinite(rate) && rate > 0) return rate * (1 + markup / 100);
    }
  } catch {
    // default
  }
  return 4500;
}

function usdToMmk(usd: number, mmkPerUsd: number) {
  return Math.round(usd * mmkPerUsd);
}

function normalizeGame(raw: Record<string, unknown>): ApiGame {
  return {
    id: Number(raw.id),
    code: String(raw.code),
    slug: String(raw.slug ?? raw.code),
    name: String(raw.name),
    imageUrl: (raw.imageUrl as string | null) ?? null,
    type: 'direct_topup',
    minPriceMmk: raw.minPriceMmk != null ? Number(raw.minPriceMmk) : null,
    currency: 'MMK',
    isMlbbUnified: raw.isMlbbUnified as boolean | undefined,
  };
}
async function fetchGamesFromG2Bulk(): Promise<ApiGame[]> {
  const res = await fetch(`${G2BULK_BASE}/v1/games`);
  if (!res.ok) throw new Error('G2Bulk games request failed');
  const data = await res.json();
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

export async function fetchGames(): Promise<ApiGame[]> {
  try {
    const res = await fetch(`${API_BASE}/games`);
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
    const res = await fetch(`${API_BASE}/games/${encodeURIComponent(code)}`);
    if (res.ok) {
      const raw = await res.json();
      return {
        ...normalizeGame(raw),
        packages: (raw.packages as ApiGameDetail['packages']) ?? [],
        playerFields: raw.playerFields as GameFieldDefinition[],
        fieldNotes: (raw.fieldNotes as string | null) ?? null,
      };
    }
  } catch {
    // fall through
  }

  const mmkPerUsd = await fetchMmkPerUsd();
  const games = await fetchGamesFromG2Bulk();
  const game = games.find((g) => g.code === code);
  if (!game) throw new Error('Game not found');

  const [{ fields: apiFields, notes }, catRes] = await Promise.all([
    fetchG2BulkFields(code),
    fetch(`${G2BULK_BASE}/v1/games/${encodeURIComponent(code)}/catalogue`),
  ]);

  let packages: ApiGameDetail['packages'] = [];
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

  return {
    ...game,
    imageUrl,
    packages,
    minPriceMmk: packages.length ? Math.min(...packages.map((p) => p.unitPrice)) : null,
    playerFields: buildFieldDefinitions(apiFields, null),
    fieldNotes: notes,
  };
}

export async function validatePlayer(
  code: string,
  fields: Record<string, string>,
): Promise<{ valid: boolean; playerName: string }> {
  const res = await fetch(`${API_BASE}/games/${encodeURIComponent(code)}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Validation failed');
  return data;
}

export function formatMmk(amount: number): string {
  return `Ks ${Math.round(amount).toLocaleString()}`;
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'rgba(16,185,129,0.2)';
    case 'PENDING':
    case 'PAYMENT_PENDING':
      return 'rgba(99,102,241,0.25)';
    case 'PROCESSING':
      return 'rgba(245,158,11,0.25)';
    case 'CANCELLED':
    case 'FAILED':
      return 'rgba(239,68,68,0.2)';
    case 'REFUNDED':
      return 'rgba(6,182,212,0.2)';
    default:
      return 'rgba(100,116,139,0.25)';
  }
}

export function getStatusTextColor(status: string) {
  switch (status) {
    case 'COMPLETED':
      return '#10b981';
    case 'PENDING':
    case 'PAYMENT_PENDING':
      return '#818cf8';
    case 'PROCESSING':
      return '#fbbf24';
    case 'CANCELLED':
    case 'FAILED':
      return '#ef4444';
    case 'REFUNDED':
      return '#06b6d4';
    default:
      return '#94a3b8';
  }
}

export const orders = [
  {
    id: 'ORD001',
    date: '2026-06-20',
    status: 'COMPLETED',
    total: 61000,
    items: ['MLBB 100 Diamonds'],
    timeline: [
      { label: 'Order Placed', time: 'Jun 20, 10:00 AM', done: true },
      { label: 'Payment Verified', time: 'Jun 20, 10:15 AM', done: true },
      { label: 'Processing', time: 'Jun 20, 10:16 AM', done: true },
      { label: 'Completed', time: 'Jun 20, 10:18 AM', done: true },
    ],
    voucherCodes: ['ABCD-EFGH-IJKL-MNOP'],
  },
  {
    id: 'ORD002',
    date: '2026-06-25',
    status: 'PENDING',
    total: 25000,
    items: ['MLBB 100 Diamonds'],
    timeline: [
      { label: 'Order Placed', time: 'Jun 25, 09:00 AM', done: true },
      { label: 'Payment Verified', time: '', done: false },
      { label: 'Processing', time: '', done: false },
      { label: 'Completed', time: '', done: false },
    ],
    voucherCodes: [] as string[],
  },
];

export const cartItems = [
  { id: 1, name: 'MLBB 100 Diamonds', price: 35000, quantity: 1 },
  { id: 2, name: 'PUBG 60 UC Voucher', price: 18000, quantity: 2 },
];

export function formatPrice(amount: number) {
  return formatMmk(amount);
}

export type WalletTxnType = 'topup' | 'spend' | 'refund';
export type WalletTxnStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

export interface WalletTransaction {
  id: number;
  type: WalletTxnType;
  amount: number;
  balanceAfter: number;
  status: WalletTxnStatus;
  description: string;
  createdAt: string;
}

export const walletBalance = 150000;

export const walletTransactions: WalletTransaction[] = [
  {
    id: 1,
    type: 'topup',
    amount: 100000,
    balanceAfter: 150000,
    status: 'COMPLETED',
    description: 'Top-up via KBZ Pay',
    createdAt: '2026-06-24T10:30:00',
  },
  {
    id: 2,
    type: 'spend',
    amount: 35000,
    balanceAfter: 50000,
    status: 'COMPLETED',
    description: 'Order ORD001 — MLBB 100 Diamonds',
    createdAt: '2026-06-20T10:18:00',
  },
  {
    id: 3,
    type: 'topup',
    amount: 85000,
    balanceAfter: 85000,
    status: 'COMPLETED',
    description: 'Top-up via Wave Pay',
    createdAt: '2026-06-18T14:00:00',
  },
  {
    id: 4,
    type: 'topup',
    amount: 50000,
    balanceAfter: 50000,
    status: 'PENDING',
    description: 'Top-up via Bank Transfer',
    createdAt: '2026-06-25T09:00:00',
  },
];

export const walletTopUpAmounts = [10000, 25000, 50000, 100000, 250000, 500000];
