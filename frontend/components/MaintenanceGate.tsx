'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import MaintenanceOverlay from '@/components/MaintenanceOverlay';
import { useShop } from '@/components/ShopProvider';
import { useAuthUser } from '@/lib/use-auth';

function isMaintenanceExemptPath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  );
}

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const shop = useShop();
  const pathname = usePathname();
  const { user } = useAuthUser();

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const exempt = isMaintenanceExemptPath(pathname);
  const showOverlay = Boolean(shop?.maintenanceMode) && !exempt && !isAdmin;

  useEffect(() => {
    if (!showOverlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showOverlay]);

  return (
    <>
      <div className={showOverlay ? 'maintenance-site-dimmed' : undefined}>{children}</div>
      {showOverlay && <MaintenanceOverlay message={shop?.maintenanceMessage} />}
    </>
  );
}
