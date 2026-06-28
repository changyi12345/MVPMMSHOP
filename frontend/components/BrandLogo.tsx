'use client';

import Image from 'next/image';
import { BRAND, resolveShopLogoUrl } from '@/lib/branding';
import { resolveMediaUrl } from '@/lib/media-url';

type Props = {
  shopLogoUrl?: string | null;
  shopName?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  variant?: 'default' | 'mark';
};

export default function BrandLogo({
  shopLogoUrl,
  shopName,
  className,
  width,
  height,
  priority,
  variant = 'default',
}: Props) {
  const src = resolveMediaUrl(resolveShopLogoUrl(shopLogoUrl)) ?? BRAND.logo;
  const alt = shopName?.trim() || BRAND.name;
  const isMark = variant === 'mark';

  if (isMark) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="48px"
        unoptimized
        priority={priority}
        className={className ?? 'logo-image logo-image--mark'}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 160}
      height={height ?? 48}
      unoptimized
      priority={priority}
      className={className ?? 'logo-image'}
    />
  );
}
