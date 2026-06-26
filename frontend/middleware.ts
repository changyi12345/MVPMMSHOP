import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const ADMIN_LOGIN = '/admin/login';
const USER_AUTH_PREFIXES = ['/profile', '/wallet', '/orders', '/checkout', '/referral', '/cart', '/notifications'];
const MAINTENANCE_EXEMPT_PREFIXES = ['/maintenance', '/admin', '/auth', '/api', '/_next'];

type MaintenanceState = { enabled: boolean; message: string | null };

let maintenanceCache: { data: MaintenanceState; ts: number } | null = null;

async function getMaintenanceStatus(): Promise<MaintenanceState> {
  const now = Date.now();
  if (maintenanceCache && now - maintenanceCache.ts < 30_000) {
    return maintenanceCache.data;
  }

  try {
    const res = await fetch(`${API_BASE}/settings/shop`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      const state: MaintenanceState = {
        enabled: Boolean(data.maintenanceMode),
        message: data.maintenanceMessage ?? null,
      };
      maintenanceCache = { data: state, ts: now };
      return state;
    }
  } catch {
    // backend unavailable — allow shop
  }

  return { enabled: false, message: null };
}

function isMaintenanceExempt(pathname: string): boolean {
  return MAINTENANCE_EXEMPT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function needsUserAuth(pathname: string): boolean {
  return USER_AUTH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value?.toLowerCase();

  // ——— Admin routes ———
  if (pathname.startsWith('/admin')) {
    if (pathname === ADMIN_LOGIN || pathname.startsWith(`${ADMIN_LOGIN}/`)) {
      if (token && role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!token || role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      if (token && role !== 'admin') url.searchParams.set('error', 'not_admin');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ——— Maintenance mode (shop pages only) ———
  if (!isMaintenanceExempt(pathname) && role !== 'admin') {
    const maintenance = await getMaintenanceStatus();
    if (maintenance.enabled) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      if (maintenance.message) {
        url.searchParams.set('msg', maintenance.message.slice(0, 200));
      }
      return NextResponse.redirect(url);
    }
  }

  // ——— User protected routes ———
  if (needsUserAuth(pathname) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/profile/:path*',
    '/wallet/:path*',
    '/orders/:path*',
    '/checkout',
    '/referral',
    '/cart',
    '/notifications',
    '/games/:path*',
    '/vouchers/:path*',
    '/maintenance',
  ],
};
