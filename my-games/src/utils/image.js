import { buildApiUrl } from '@/config/api';

export const FALLBACK_GAME_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop';

/**
 * Formats an image path or URL.
 * Prefixes relative backend paths with the API base URL.
 * Returns fallback image if empty/null.
 */
export function formatImageUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_GAME_IMAGE;
  }
  const cleanUrl = url.trim();
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('blob:')
  ) {
    return cleanUrl;
  }
  const apiBase = buildApiUrl('');
  const formattedPath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${apiBase}${formattedPath}`;
}

/**
 * Image @error handler to gracefully switch to fallback image on load error.
 */
export function handleImageError(event, fallback = FALLBACK_GAME_IMAGE) {
  if (event && event.target) {
    if (event.target.src !== fallback) {
      event.target.src = fallback;
    }
  }
}
