'use client';

import ShopPageShell from '@/components/ShopPageShell';
import { useLang } from '@/lib/useLang';

interface LegalPageProps {
  titleKey: string;
  descKey?: string;
  badge?: string;
  children: React.ReactNode;
}

export default function LegalPage({ titleKey, descKey, badge, children }: LegalPageProps) {
  const { t } = useLang();
  return (
    <ShopPageShell
      title={t(titleKey as never)}
      subtitle={descKey ? t(descKey as never) : undefined}
      badge={badge}
      maxWidth={720}
    >
      <div className="card legal-content">{children}</div>
    </ShopPageShell>
  );
}
