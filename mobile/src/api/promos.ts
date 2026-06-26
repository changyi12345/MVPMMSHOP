import { apiFetch } from './client';

export interface PromoValidation {
  valid: boolean;
  discountPercent: number;
  discountAmount: number;
  code?: string;
}

export function validatePromo(code: string, subtotal: number) {
  return apiFetch<PromoValidation>('/promos/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
}
