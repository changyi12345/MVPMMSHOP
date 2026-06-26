import { fetchMmkPerUsd, formatMmk, usdToMmk } from '@/lib/format-price';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const G2BULK_BASE = 'https://api.g2bulk.com';

export { formatMmk };

export interface VoucherCategory {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  productCount: number;
  minPriceMmk: number | null;
  minPriceUsd: number | null;
}

export interface VoucherProduct {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryTitle: string;
  imageUrl: string | null;
  sourcePriceUsd: number;
  unitPrice: number;
  currency: 'MMK';
  faceValue: number | null;
  stock: number;
  inStock: boolean;
}

function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${G2BULK_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function fetchCategoriesFromG2Bulk(): Promise<VoucherCategory[]> {
  const mmkPerUsd = await fetchMmkPerUsd(API_BASE);
  const [catRes, prodRes] = await Promise.all([
    fetch(`${G2BULK_BASE}/v1/category`, { cache: 'no-store' }),
    fetch(`${G2BULK_BASE}/v1/products`, { cache: 'no-store' }),
  ]);
  if (!catRes.ok || !prodRes.ok) throw new Error('G2Bulk request failed');
  const catData = await catRes.json();
  const prodData = await prodRes.json();
  if (!catData.success || !prodData.success) throw new Error('Invalid G2Bulk response');

  const imageByCategory = new Map<number, string>();
  for (const c of catData.categories as { id: number; title: string; image_url: string | null }[]) {
    const url = resolveImageUrl(c.image_url);
    if (url) imageByCategory.set(c.id, url);
  }

  const minByCategory = new Map<number, number>();
  for (const p of prodData.products as { category_id: number; unit_price: number }[]) {
    const cur = minByCategory.get(p.category_id);
    if (cur == null || p.unit_price < cur) minByCategory.set(p.category_id, p.unit_price);
  }

  const countByCategory = new Map<number, number>();
  for (const p of prodData.products as { category_id: number }[]) {
    countByCategory.set(p.category_id, (countByCategory.get(p.category_id) ?? 0) + 1);
  }

  return (catData.categories as { id: number; title: string; description: string }[])
    .filter((c) => c.id !== 11 && (countByCategory.get(c.id) ?? 0) > 0)
    .map((c) => {
      const minUsd = minByCategory.get(c.id) ?? null;
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        imageUrl: imageByCategory.get(c.id) ?? null,
        productCount: countByCategory.get(c.id) ?? 0,
        minPriceUsd: minUsd,
        minPriceMmk: minUsd != null ? usdToMmk(minUsd, mmkPerUsd) : null,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function fetchVoucherCategories(): Promise<VoucherCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/vouchers/categories`, { cache: 'no-store' });
    if (res.ok) return res.json();
  } catch {
    // Backend unavailable
  }
  return fetchCategoriesFromG2Bulk();
}

export async function fetchVouchers(categoryId?: number): Promise<VoucherProduct[]> {
  try {
    const url = categoryId
      ? `${API_BASE}/vouchers?categoryId=${categoryId}`
      : `${API_BASE}/vouchers`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) return res.json();
  } catch {
    // fall through
  }

  const mmkPerUsd = await fetchMmkPerUsd(API_BASE);
  const prodRes = await fetch(`${G2BULK_BASE}/v1/products`, { cache: 'no-store' });
  if (!prodRes.ok) throw new Error('G2Bulk products request failed');
  const prodData = await prodRes.json();
  const categories = await fetchCategoriesFromG2Bulk();
  const imageByCategory = new Map(categories.map((c) => [c.id, c.imageUrl]));

  return (prodData.products as {
    id: number;
    title: string;
    description: string;
    category_id: number;
    category_title: string;
    unit_price: number;
    face_value: number | null;
    stock: number;
  }[])
    .filter((p) => categoryId == null || p.category_id === categoryId)
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      categoryId: p.category_id,
      categoryTitle: p.category_title,
      imageUrl: imageByCategory.get(p.category_id) ?? null,
      sourcePriceUsd: p.unit_price,
      unitPrice: usdToMmk(p.unit_price, mmkPerUsd),
      currency: 'MMK' as const,
      faceValue: p.face_value,
      stock: p.stock,
      inStock: p.stock > 0,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function fetchVoucher(id: number): Promise<VoucherProduct> {
  try {
    const res = await fetch(`${API_BASE}/vouchers/${id}`, { cache: 'no-store' });
    if (res.ok) return res.json();
    if (res.status === 404) throw new Error('Voucher not found');
  } catch (err) {
    if (err instanceof Error && err.message === 'Voucher not found') throw err;
  }

  const products = await fetchVouchers();
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error('Voucher not found');
  return product;
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatFaceValue(faceValue: number | null, title: string): string {
  if (faceValue != null && faceValue > 0) return `$${faceValue}`;
  const match = title.match(/\$\s?(\d+(?:\.\d+)?)/);
  if (match) return `$${match[1]}`;
  return title;
}
