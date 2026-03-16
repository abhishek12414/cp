import { API_URL } from "@/apis/apiRoutes";

export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return null;
  if (path.startsWith("http")) {
    return path;
  }
  return `${API_URL}${path}`;
};

/**
 * Extract image URL from Strapi media data (handles both Strapi 4 and Strapi 5 formats)
 * Strapi 4: { data: { id: number, attributes: { url: string } } }
 * Strapi 5: { id: number, url: string } or { data: { id: number, url: string } }
 */
export const extractMediaUrl = (
  media: any,
  fallbackUrl?: string | null
): string | null => {
  if (!media) {
    return fallbackUrl ? getImageUrl(fallbackUrl) : null;
  }

  // Direct URL on media object (Strapi 5 flattened)
  if (media.url) {
    return getImageUrl(media.url);
  }

  // Nested in data.attributes (Strapi 4 style)
  if (media.data) {
    // Strapi 5: data.url directly
    if (media.data.url) {
      return getImageUrl(media.data.url);
    }
    // Strapi 4: data.attributes.url
    if (media.data.attributes?.url) {
      return getImageUrl(media.data.attributes.url);
    }
  }

  // Fallback
  return fallbackUrl ? getImageUrl(fallbackUrl) : null;
};

/**
 * Extract media ID from Strapi media data (handles both Strapi 4 and Strapi 5 formats)
 */
export const extractMediaId = (media: any): number | null => {
  if (!media) return null;

  // Direct ID (Strapi 5 flattened)
  if (typeof media.id === "number") {
    return media.id;
  }

  // Nested in data
  if (media.data?.id) {
    return media.data.id;
  }

  return null;
};
