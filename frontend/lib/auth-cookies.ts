const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days — matches JWT expiry

export const AUTH_COOKIE = 'access_token';
export const ROLE_COOKIE = 'user_role';

export function setAuthCookies(accessToken: string, role: string) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(accessToken)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role.toLowerCase())}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
}

export function setRoleCookie(role: string) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role.toLowerCase())}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}
