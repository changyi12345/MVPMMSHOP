'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchShopInfo, PublicShopInfo } from '@/lib/api/settings';
import { resolveMediaUrl } from '@/lib/media-url';

const ShopContext = createContext<PublicShopInfo | null>(null);

export function useShop() {
  return useContext(ShopContext);
}

export default function ShopProvider({ children }: { children: React.ReactNode }) {
  const [shop, setShop] = useState<PublicShopInfo | null>(null);

  useEffect(() => {
    fetchShopInfo()
      .then(setShop)
      .catch(() => setShop(null));
  }, []);

  useEffect(() => {
    const favicon = resolveMediaUrl(shop?.faviconUrl);
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [shop?.faviconUrl]);

  useEffect(() => {
    if (shop?.shopName) {
      const title = shop.shopName;
      const desc = shop.shopTagline ?? 'Game Top Up — Fast & Trusted';
      document.title = `${title} — ${desc}`;
      let meta = document.querySelector<HTMLMetaElement>("meta[name='description']");
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = desc;
    }
  }, [shop?.shopName, shop?.shopTagline]);

  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}
