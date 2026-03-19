/**
 * Adds cache-busting parameter to storage URLs to avoid stale cached responses.
 */
export function withCacheBust(url: string | null | undefined): string | null {
  if (!url) return null;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

/**
 * Returns the best available image for a funeraria card/page.
 * Priority: cover_image_url → logo_url → placeholder
 */
export function getFunerariaImage(
  coverImageUrl: string | null | undefined,
  logoUrl: string | null | undefined
): string {
  if (coverImageUrl) return withCacheBust(coverImageUrl)!;
  if (logoUrl) return withCacheBust(logoUrl)!;
  return "/placeholder.svg";
}
