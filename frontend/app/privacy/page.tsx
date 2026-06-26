'use client';

import DynamicLegalPage from '@/components/DynamicLegalPage';

export default function PrivacyPage() {
  return (
    <DynamicLegalPage
      slug="privacy"
      titleKey="privacyTitle"
      descKey="privacyDesc"
      fallbackKeys={[
        { title: 'privacyIntro', body: 'privacyIntro' },
        { title: 'privacySection1', body: 'privacySection1Body' },
        { title: 'privacySection2', body: 'privacySection2Body' },
        { title: 'privacySection3', body: 'privacySection3Body' },
      ]}
    />
  );
}
