'use client';

import { getLang, setLang, Lang } from '@/lib/i18n';
import { useEffect, useState } from 'react';

type Props = {
  compact?: boolean;
};

export default function LangToggle({ compact = false }: Props) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    setLangState(getLang());
    const handler = () => setLangState(getLang());
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'mm' : 'en';
    setLang(next);
    setLangState(next);
  };

  return (
    <button
      type="button"
      className={`lang-toggle header-icon-btn${compact ? ' lang-toggle--compact' : ''}`}
      onClick={toggle}
      aria-label="Toggle language"
      title={lang === 'en' ? 'Switch to Myanmar' : 'Switch to English'}
    >
      {!compact && (
        <span className="lang-toggle-full">{lang === 'en' ? '🇲🇲 MM' : '🇬🇧 EN'}</span>
      )}
      {compact ? (
        <span className="lang-toggle-short">{lang === 'en' ? 'MM' : 'EN'}</span>
      ) : null}
    </button>
  );
}
