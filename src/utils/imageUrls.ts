/**
 * Image URL Utilities
 * Handles parsing and extracting image URLs from various API response formats
 */

/**
 * Extract backdrop URL from various possible formats
 * The API returns backdrop in different formats:
 * - Newline-separated string: "http://...\r\nhttp://...\r\n"
 * - Array of URLs: ["http://..."]
 * - JSON string: "[\"http://...\"]"
 * - Single URL string: "http://..."
 * - Empty array or null
 */
export function getBackdropUrl(item: any): string | null {
  if (!item) return null;

  // Try backdrop first (newline-separated string from movie details API)
  if (item.backdrop && typeof item.backdrop === 'string') {
    const url = parseNewlineSeparatedUrls(item.backdrop);
    if (url) return url;
  }

  // Try backdrop_path (can be array or JSON string, used by series)
  if (item.backdrop_path) {
    const url = parseBackdropPath(item.backdrop_path);
    if (url) return url;
  }

  // Fallback to cover images
  if (item.cover_big && isValidUrl(item.cover_big)) {
    return item.cover_big;
  }

  if (item.movie_image && isValidUrl(item.movie_image)) {
    return item.movie_image;
  }

  if (item.cover && isValidUrl(item.cover)) {
    return item.cover;
  }

  // Last resort - stream icon
  if (item.stream_icon && isValidUrl(item.stream_icon)) {
    return item.stream_icon;
  }

  return null;
}

/**
 * Parse newline-separated URLs (common in movie details API)
 * Format: "http://...\r\nhttp://...\r\n"
 */
function parseNewlineSeparatedUrls(urlString: string): string | null {
  if (!urlString || typeof urlString !== 'string') return null;
  
  // Split by various newline formats
  const urls = urlString.split(/[\r\n]+/).filter(url => url.trim());
  
  // Return first valid URL
  for (const url of urls) {
    const trimmed = url.trim();
    if (isValidUrl(trimmed)) {
      return trimmed;
    }
  }
  
  return null;
}

/**
 * Parse backdrop_path which can be array or JSON string
 */
function parseBackdropPath(backdropPath: any): string | null {
  // Already an array
  if (Array.isArray(backdropPath)) {
    const validUrl = backdropPath.find(url => isValidUrl(url));
    return validUrl || null;
  }

  // String - might be JSON or direct URL
  if (typeof backdropPath === 'string') {
    // Try parsing as JSON array
    if (backdropPath.startsWith('[')) {
      try {
        const parsed = JSON.parse(backdropPath);
        if (Array.isArray(parsed)) {
          const validUrl = parsed.find(url => isValidUrl(url));
          return validUrl || null;
        }
      } catch {
        // Not valid JSON, continue
      }
    }

    // Direct URL
    if (isValidUrl(backdropPath)) {
      return backdropPath;
    }
  }

  return null;
}

/**
 * Check if string is a valid URL
 */
function isValidUrl(url: any): boolean {
  if (typeof url !== 'string' || !url) return false;
  
  // Basic URL validation
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Sanitize and fix image URLs
 * - Adds protocol if missing
 * - Handles relative URLs
 * - Returns null for invalid/unreachable domains
 */
export function sanitizeImageUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  // Already a valid URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Protocol-relative URL (//example.com/image.jpg)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  
  // Looks like a domain without protocol (example.com/image.jpg)
  if (trimmed.includes('.') && trimmed.includes('/') && !trimmed.startsWith('/')) {
    return `http://${trimmed}`;
  }
  
  // Relative path or invalid - can't use
  return null;
}

/**
 * Get the best available image URL for an item
 * Prioritizes backdrop for hero banners, cover for cards
 */
export function getHeroImageUrl(item: any): string | null {
  // For hero banners, prioritize backdrop (wide image)
  return getBackdropUrl(item);
}

/**
 * Get poster/cover image URL for cards
 */
export function getPosterUrl(item: any): string | null {
  if (!item) return null;

  // Prioritize cover images for cards
  if (item.cover_big && isValidUrl(item.cover_big)) {
    return item.cover_big;
  }

  if (item.cover && isValidUrl(item.cover)) {
    return item.cover;
  }

  if (item.stream_icon && isValidUrl(item.stream_icon)) {
    return item.stream_icon;
  }

  // Fallback to backdrop if no cover available
  return getBackdropUrl(item);
}

export default {
  getBackdropUrl,
  getHeroImageUrl,
  getPosterUrl,
};
