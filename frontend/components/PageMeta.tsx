'use client';

import { useEffect } from 'react';
import { useShop } from '@/components/ShopProvider';

interface PageMetaProps {
  title?: string;
  description?: string;
}

export default function PageMeta({ title, description }: PageMetaProps) {
  const shop = useShop();
  const shopName = shop?.shopName ?? 'MVPMMSHOP';
  const tagline = shop?.shopTagline ?? 'Game Top Up — Fast & Trusted';

  useEffect(() => {
    document.title = title ? `${title} — ${shopName}` : `${shopName} — ${tagline}`;

    let meta = document.querySelector<HTMLMetaElement>("meta[name='description']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description ?? tagline;
  }, [title, description, shopName, tagline]);

  return null;
}
