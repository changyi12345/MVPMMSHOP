import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-layout">
      <Header />
      <main className="page-content shop-surface">{children}</main>
      <Footer />
    </div>
  );
}
