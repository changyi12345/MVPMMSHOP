const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}

export { API_BASE as MEDIA_API_BASE };
