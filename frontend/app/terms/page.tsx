'use client';

import DynamicLegalPage from '@/components/DynamicLegalPage';

export default function TermsPage() {
  return (
    <DynamicLegalPage
      slug="terms"
      titleKey="termsTitle"
      descKey="termsDesc"
      fallbackKeys={[
        { title: 'termsIntro', body: 'termsIntro' },
        { title: 'termsSection1', body: 'termsSection1Body' },
        { title: 'termsSection2', body: 'termsSection2Body' },
        { title: 'termsSection3', body: 'termsSection3Body' },
      ]}
    />
  );
}
