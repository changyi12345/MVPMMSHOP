'use client';

import BrandLogo from '@/components/BrandLogo';
import { useShop } from '@/components/ShopProvider';

export default function AuthBrandLogo() {
  const shop = useShop();
  return (
    <div className="auth-logo auth-logo-image-wrap">
      <BrandLogo
        shopLogoUrl={shop?.logoUrl}
        shopName={shop?.shopName}
        className="auth-logo-image"
        width={200}
        height={72}
      />
    </div>
  );
}
