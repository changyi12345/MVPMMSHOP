'use client';

import { useEffect, useState } from 'react';
import { setLang, getLang } from '@/lib/admin-i18n';

export default function AdminLangToggle() {
  const [lang, setLangState] = useState(getLang());

  useEffect(() => {
    const handler = () => setLangState(getLang());
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const switchLang = (next: 'en' | 'mm') => {
    setLang(next);
    setLangState(next);
  };

  return (
    <div className="admin-lang-toggle" style={{ display: 'flex', gap: 4 }}>
      <button type="button" className={`btn btn-outline btn-sm ${lang === 'en' ? 'active' : ''}`} onClick={() => switchLang('en')}>EN</button>
      <button type="button" className={`btn btn-outline btn-sm ${lang === 'mm' ? 'active' : ''}`} onClick={() => switchLang('mm')}>MM</button>
    </div>
  );
}
