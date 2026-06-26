'use client';

import DynamicLegalPage from '@/components/DynamicLegalPage';

export default function HelpPage() {
  return (
    <DynamicLegalPage
      slug="help"
      titleKey="helpTitle"
      descKey="helpDesc"
      fallbackKeys={[
        { title: 'helpIntro', body: 'helpContactDesc' },
        { title: 'helpFaq', body: 'faqA1' },
      ]}
    />
  );
}
