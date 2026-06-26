'use client';

import { useEffect, useState } from 'react';
import { fetchAdminLegalPage, updateAdminLegalPage, LegalSection } from '@/lib/api/legal';
import { useToast } from '@/components/Toast';
import { useAdminLang } from '@/lib/useAdminLang';

const PAGES = [
  { slug: 'faq', label: 'FAQ' },
  { slug: 'help', label: 'Help' },
  { slug: 'terms', label: 'Terms' },
  { slug: 'privacy', label: 'Privacy' },
] as const;

type Locale = 'en' | 'mm';

export default function AdminLegalTab() {
  const { showToast } = useToast();
  const { t } = useAdminLang();
  const [slug, setSlug] = useState<(typeof PAGES)[number]['slug']>('faq');
  const [locale, setLocale] = useState<Locale>('en');
  const [sectionsEn, setSectionsEn] = useState<LegalSection[]>([{ title: '', body: '' }]);
  const [sectionsMm, setSectionsMm] = useState<LegalSection[]>([{ title: '', body: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sections = locale === 'en' ? sectionsEn : sectionsMm;
  const setSections = locale === 'en' ? setSectionsEn : setSectionsMm;

  useEffect(() => {
    setLoading(true);
    fetchAdminLegalPage(slug)
      .then((page) => {
        const en = page.sectionsEn?.length ? page.sectionsEn : page.sections;
        const mm = page.sectionsMm ?? [];
        setSectionsEn(en.length ? en : [{ title: '', body: '' }]);
        setSectionsMm(mm.length ? mm : [{ title: '', body: '' }]);
      })
      .catch(() => {
        setSectionsEn([{ title: '', body: '' }]);
        setSectionsMm([{ title: '', body: '' }]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const updateSection = (index: number, field: keyof LegalSection, value: string) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const save = async () => {
    const cleanedEn = sectionsEn.filter((s) => s.title.trim() && s.body.trim());
    const cleanedMm = sectionsMm.filter((s) => s.title.trim() && s.body.trim());
    if (!cleanedEn.length && !cleanedMm.length) {
      showToast('Add at least one section with title and body', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateAdminLegalPage(slug, {
        sectionsEn: cleanedEn,
        sectionsMm: cleanedMm,
      });
      setSectionsEn(cleanedEn.length ? cleanedEn : [{ title: '', body: '' }]);
      setSectionsMm(cleanedMm.length ? cleanedMm : [{ title: '', body: '' }]);
      showToast('Page saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--dark-gray)' }}>{t('loading')}</p>;

  return (
    <div className="card" style={{ maxWidth: 720, padding: 24 }}>
      <h2 className="section-title">📄 {t('legalHelpPages')}</h2>
      <div className="filter-chips" style={{ marginBottom: 12 }}>
        {PAGES.map((p) => (
          <button key={p.slug} type="button" className={`chip ${slug === p.slug ? 'active' : ''}`} onClick={() => setSlug(p.slug)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="filter-chips" style={{ marginBottom: 16 }}>
        <button type="button" className={`chip ${locale === 'en' ? 'active' : ''}`} onClick={() => setLocale('en')}>
          English
        </button>
        <button type="button" className={`chip ${locale === 'mm' ? 'active' : ''}`} onClick={() => setLocale('mm')}>
          Myanmar (MM)
        </button>
      </div>
      {sections.map((section, index) => (
        <div key={index} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>Section {index + 1}</strong>
            {sections.length > 1 && (
              <button type="button" className="btn btn-outline" style={{ padding: '2px 10px', fontSize: 12 }} onClick={() => setSections((prev) => prev.filter((_, i) => i !== index))}>
                Remove
              </button>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={section.title} onChange={(e) => updateSection(index, 'title', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Body</label>
            <textarea className="form-input" rows={4} value={section.body} onChange={(e) => updateSection(index, 'body', e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => setSections((prev) => [...prev, { title: '', body: '' }])}>
        + {t('addSection')}
      </button>
      <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
        {saving ? t('saving') : t('savePage')}
      </button>
    </div>
  );
}
