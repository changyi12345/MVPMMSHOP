/** User-facing MMK price formatter */
export function formatMmk(amount: number): string {
  return `Ks ${Math.round(amount).toLocaleString()}`;
}

/** Alias used across cart, wallet, orders */
export function formatPrice(amount: number): string {
  return formatMmk(amount);
}

export async function fetchMmkPerUsd(apiBase: string): Promise<number> {
  try {
    const res = await fetch(`${apiBase}/settings/exchange`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data.usdToMmkRate);
      const markup = Number(data.priceMarkupPercent ?? 0);
      if (Number.isFinite(rate) && rate > 0) {
        return rate * (1 + markup / 100);
      }
    }
  } catch {
    // use default
  }
  return 4500;
}

export function usdToMmk(usd: number, mmkPerUsd: number): number {
  return Math.round(usd * mmkPerUsd);
}
