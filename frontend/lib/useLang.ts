'use client';

import { useCallback, useEffect, useState } from 'react';
import { getLang, Lang, t as translate, tf as translateF, tStatus } from './i18n';

export function useLang() {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    setLangState(getLang());
    const handler = () => setLangState(getLang());
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);
  const tf = useCallback(
    (key: string, vars: Record<string, string | number>) => translateF(key, vars, lang),
    [lang],
  );
  const ts = useCallback((status: string) => tStatus(status, lang), [lang]);

  return { lang, t, tf, ts };
}
