'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminT, AdminLang, getLang } from '@/lib/admin-i18n';

export function useAdminLang() {
  const [lang, setLangState] = useState<AdminLang>('en');

  useEffect(() => {
    setLangState(getLang());
    const handler = () => setLangState(getLang());
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const t = useCallback((key: string) => adminT(key, lang), [lang]);
  return { lang, t };
}
