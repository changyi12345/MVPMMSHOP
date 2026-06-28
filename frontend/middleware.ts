import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const ADMIN_LOGIN = '/admin/login';
const USER_AUTH_PREFIXES = ['/profile', '/wallet', '/orders', '/checkout', '/referral', '/cart', '/notifications'];
const MAINTENANCE_EXEMPT_PREFIXES = ['/maintenance', '/admin', '/auth', '/api', '/_next'];

type MaintenanceState = { enabled: boolean; message: string | null };

/** Edge middleware must finish quickly — slow/dead API causes 504 MIDDLEWARE_INVOCATION_TIMEOUT */
const MAINTENANCE_FETCH_TIMEOUT_MS = 2_500;
const MAINTENANCE_CACHE_TTL_MS = 30_000;
const MAINTENANCE_FAIL_CACHE_TTL_MS = 60_000;

let maintenanceCache: { data: MaintenanceState; ts: number; failed?: boolean } | null = null;

async function getMaintenanceStatus(): Promise<MaintenanceState> {
  const now = Date.now();
  if (maintenanceCache) {
    const ttl = maintenanceCache.failed
      ? MAINTENANCE_FAIL_CACHE_TTL_MS
      : MAINTENANCE_CACHE_TTL_MS;
    if (now - maintenanceCache.ts < ttl) {
      return maintenanceCache.data;
    }
  }

  const fallback: MaintenanceState = { enabled: false, message: null };

  try {
    const res = await fetch(`${API_BASE}/settings/shop`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(MAINTENANCE_FETCH_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const state: MaintenanceState = {
        enabled: Boolean(data.maintenanceMode),
        message: data.maintenanceMessage ?? null,
      };
      maintenanceCache = { data: state, ts: now, failed: false };
      return state;
    }
  } catch {
    // API down/slow from Vercel edge — fail open so the shop still loads
  }

  maintenanceCache = { data: fallback, ts: now, failed: true };
  return fallback;
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

  // ——— Maintenance mode — show home, block shop via overlay ———
  if (pathname === '/maintenance') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (!isMaintenanceExempt(pathname) && role !== 'admin') {
    const maintenance = await getMaintenanceStatus();
    if (maintenance.enabled && pathname !== '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
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
    '/auth/:path*',
    '/profile/:path*',
    '/wallet/:path*',
    '/orders/:path*',
    '/checkout',
    '/referral',
    '/cart',
    '/notifications',
    '/games/:path*',
    '/vouchers/:path*',
    '/events/:path*',
    '/faq',
    '/help',
    '/terms',
    '/privacy',
    '/maintenance',
  ],
};
