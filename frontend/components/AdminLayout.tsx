'use client';

import Link from 'next/link';
import { ReactNode, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNotificationBell from './AdminNotificationBell';
import AdminLangToggle from './AdminLangToggle';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="admin-main">
        <header className="admin-mobile-header">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            ☰ Menu
          </button>
          <Link href="/admin/dashboard" className="admin-mobile-title">Admin</Link>
          <div className="admin-mobile-notif">
            <AdminNotificationBell />
          </div>
        </header>
        <div className="admin-topbar">
          <AdminLangToggle />
          <AdminNotificationBell />
        </div>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
