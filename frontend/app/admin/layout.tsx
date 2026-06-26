'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import AdminAuthGate from '@/components/AdminAuthGate';
import AdminNotificationProvider from '@/components/AdminNotificationProvider';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/login') return children;
  return (
    <AdminAuthGate>
      <AdminNotificationProvider>{children}</AdminNotificationProvider>
    </AdminAuthGate>
  );
}
