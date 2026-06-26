import { apiFetch } from './client';

export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalPage {
  slug: string;
  sections: LegalSection[];
  sectionsEn?: LegalSection[];
  sectionsMm?: LegalSection[];
  updatedAt: string | null;
  lang?: 'en' | 'mm';
}

export async function fetchLegalPage(slug: string, lang: 'en' | 'mm' = 'en'): Promise<LegalPage> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const res = await fetch(`${API_BASE}/content/legal/${slug}?lang=${lang}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load page');
  return res.json();
}

export function fetchAdminLegalPage(slug: string) {
  return apiFetch<LegalPage>(`/admin/legal/${slug}`);
}

export function updateAdminLegalPage(
  slug: string,
  data: {
    sections?: LegalSection[];
    sectionsEn?: LegalSection[];
    sectionsMm?: LegalSection[];
    locale?: 'en' | 'mm';
  },
) {
  return apiFetch<LegalPage>(`/admin/legal/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
