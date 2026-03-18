/**
 * Returns the best available image for a funeraria card/page.
 * Priority: cover_image_url → logo_url → placeholder
 */
export function getFunerariaImage(
  coverImageUrl: string | null | undefined,
  logoUrl: string | null | undefined
): string {
  if (coverImageUrl) return coverImageUrl;
  if (logoUrl) return logoUrl;
  return "/placeholder.svg";
}
