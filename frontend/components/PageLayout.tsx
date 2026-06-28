'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import MobileTabBar from './MobileTabBar';

function shouldShowMobileTabBar(pathname: string): boolean {
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) return false;
  if (pathname === '/checkout') return false;
  return true;
}

export default function PageLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const mobileTabs = shouldShowMobileTabBar(pathname);

  return (
    <div className={`page-layout${mobileTabs ? ' page-layout--mobile-tabs' : ''}`}>
      <Header />
      <main className="page-content shop-surface">{children}</main>
      <Footer />
      {mobileTabs && <MobileTabBar />}
    </div>
  );
}
