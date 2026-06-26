'use client';

import { useEffect, useState } from 'react';
import LegalPage from '@/components/LegalPage';
import PageMeta from '@/components/PageMeta';
import { useLang } from '@/lib/useLang';
import { fetchLegalPage, LegalSection } from '@/lib/api/legal';

type Props = {
  slug: 'faq' | 'help' | 'terms' | 'privacy';
  titleKey: 'faqTitle' | 'helpTitle' | 'termsTitle' | 'privacyTitle';
  descKey: 'faqDesc' | 'helpDesc' | 'termsDesc' | 'privacyDesc';
  fallbackKeys: { title: string; body: string }[];
};

export default function DynamicLegalPage({ slug, titleKey, descKey, fallbackKeys }: Props) {
  const { t, lang } = useLang();
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    fetchLegalPage(slug, lang)
      .then((page) => {
        if (page.sections.length > 0) {
          setSections(page.sections);
        } else {
          setSections(
            fallbackKeys.map((k) => ({ title: t(k.title as never), body: t(k.body as never) })),
          );
        }
      })
      .catch(() => {
        setSections(
          fallbackKeys.map((k) => ({ title: t(k.title as never), body: t(k.body as never) })),
        );
      })
      .finally(() => setReady(true));
  }, [slug, lang, t, fallbackKeys]);

  if (!ready) {
    return (
      <LegalPage titleKey={titleKey} descKey={descKey} badge="📋 Info">
        <p>{t('loading')}</p>
      </LegalPage>
    );
  }

  return (
    <>
      <PageMeta title={t(titleKey)} description={t(descKey)} />
      <LegalPage titleKey={titleKey} descKey={descKey} badge="📋 Info">
        {sections.map((section, i) => (
          <section key={i} className="legal-section">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </LegalPage>
    </>
  );
}
