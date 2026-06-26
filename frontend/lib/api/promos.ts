import { apiFetch } from './client';

export interface PromoCode {
  id: number;
  code: string;
  discountPercent: number;
  maxUsage: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export function fetchPromos() {
  return apiFetch<PromoCode[]>('/admin/promos');
}

export function createPromo(data: {
  code: string;
  discountPercent: number;
  maxUsage: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}) {
  return apiFetch('/admin/promos', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePromo(id: number, data: {
  code?: string;
  discountPercent?: number;
  maxUsage?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}) {
  return apiFetch(`/admin/promos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deletePromo(id: number) {
  return apiFetch(`/admin/promos/${id}`, { method: 'DELETE' });
}

export function validatePromo(code: string, subtotal: number) {
  return apiFetch<{ valid: boolean; discountPercent: number; discountAmount: number; code?: string }>(
    '/promos/validate',
    { method: 'POST', body: JSON.stringify({ code, subtotal }) },
  );
}
