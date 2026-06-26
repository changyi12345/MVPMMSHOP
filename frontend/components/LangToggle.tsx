'use client';

import { getLang, setLang, Lang } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export default function LangToggle() {
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
      className="lang-toggle"
      onClick={toggle}
      aria-label="Toggle language"
      title={lang === 'en' ? 'Switch to Myanmar' : 'Switch to English'}
    >
      {lang === 'en' ? '🇲🇲 MM' : '🇬🇧 EN'}
    </button>
  );
}
