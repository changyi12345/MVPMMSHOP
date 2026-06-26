'use client';

import DynamicLegalPage from '@/components/DynamicLegalPage';

export default function FaqPage() {
  return (
    <DynamicLegalPage
      slug="faq"
      titleKey="faqTitle"
      descKey="faqDesc"
      fallbackKeys={[
        { title: 'faqQ1', body: 'faqA1' },
        { title: 'faqQ2', body: 'faqA2' },
        { title: 'faqQ3', body: 'faqA3' },
        { title: 'faqQ4', body: 'faqA4' },
      ]}
    />
  );
}
