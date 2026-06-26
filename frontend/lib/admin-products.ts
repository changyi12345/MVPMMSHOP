export function stockLabel(stock: number): { text: string; className: string } {
  if (stock <= 0) return { text: 'Out of Stock', className: 'badge-gray' };
  if (stock <= 10) return { text: 'Low Stock', className: 'badge-red' };
  return { text: 'In Stock', className: 'badge-blue' };
}

export function productKey(p: {
  id: number | null;
  g2bulkGameCode?: string | null;
  g2bulkProductId?: number | null;
}): string {
  if (p.g2bulkGameCode) return `game-${p.g2bulkGameCode}`;
  if (p.g2bulkProductId != null) return `voucher-${p.g2bulkProductId}`;
  return `local-${p.id}`;
}

export function formatMmk(amount: number): string {
  if (amount <= 0) return '—';
  return `Ks ${amount.toLocaleString()}`;
}

export function formatProductPrice(product: {
  unitPrice: number;
  sourcePrice?: number | null;
  sourceCurrency?: 'USD' | null;
}): { primary: string; secondary: string | null } {
  if (product.unitPrice <= 0 && product.sourcePrice == null) {
    return { primary: '—', secondary: null };
  }
  const primary = formatMmk(product.unitPrice);
  if (product.sourcePrice != null && product.sourceCurrency === 'USD') {
    return { primary, secondary: `$${product.sourcePrice.toFixed(2)} USD` };
  }
  return { primary, secondary: null };
}
