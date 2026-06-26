/** Parse user-entered MMK amount as a whole integer (no decimals). */
export function parseMmkAmount(value: string | number | null | undefined): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value);
  }
  const digits = String(value).replace(/[^\d]/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}
