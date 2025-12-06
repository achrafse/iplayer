/**
 * Image Preloading Utility
 * Preloads images in the background for faster rendering
 */

import { Image, Platform } from 'react-native';

interface PreloadOptions {
  priority?: 'high' | 'low';
  maxConcurrent?: number;
}

class ImagePreloader {
  private preloadedUrls: Set<string> = new Set();
  private pendingUrls: Set<string> = new Set();
  private queue: string[] = [];
  private isProcessing = false;
  private maxConcurrent = 3;

  /**
   * Preload a single image
   */
  async preload(uri: string): Promise<void> {
    if (!uri || this.preloadedUrls.has(uri) || this.pendingUrls.has(uri)) {
      return;
    }

    this.pendingUrls.add(uri);

    try {
      if (Platform.OS === 'web') {
        // Web: Use HTML Image for preloading
        await new Promise<void>((resolve, reject) => {
          const img = new (window as any).Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = uri;
        });
      } else {
        // Native: Use React Native Image.prefetch
        await Image.prefetch(uri);
      }
      
      this.preloadedUrls.add(uri);
    } catch (error) {
      // Silent fail - image will be loaded on demand
      console.debug('Image preload failed:', uri);
    } finally {
      this.pendingUrls.delete(uri);
    }
  }

  /**
   * Preload multiple images with queue management
   */
  async preloadBatch(uris: string[], options: PreloadOptions = {}): Promise<void> {
    const { maxConcurrent = this.maxConcurrent } = options;
    
    // Filter out already preloaded/pending URLs
    const toPreload = uris.filter(
      uri => uri && !this.preloadedUrls.has(uri) && !this.pendingUrls.has(uri)
    );

    if (toPreload.length === 0) return;

    // Process in chunks
    const chunks: string[][] = [];
    for (let i = 0; i < toPreload.length; i += maxConcurrent) {
      chunks.push(toPreload.slice(i, i + maxConcurrent));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(chunk.map(uri => this.preload(uri)));
    }
  }

  /**
   * Add to background preload queue
   * Images will be preloaded when idle
   */
  queuePreload(uris: string[]): void {
    const toQueue = uris.filter(
      uri => uri && !this.preloadedUrls.has(uri) && !this.queue.includes(uri)
    );
    
    this.queue.push(...toQueue);
    this.processQueue();
  }

  /**
   * Process queued images in background
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Take next batch from queue
      const batch = this.queue.splice(0, this.maxConcurrent);
      
      // Wait a bit before processing to avoid blocking UI
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await Promise.allSettled(batch.map(uri => this.preload(uri)));
    }

    this.isProcessing = false;
  }

  /**
   * Check if an image is already preloaded
   */
  isPreloaded(uri: string): boolean {
    return this.preloadedUrls.has(uri);
  }

  /**
   * Clear preload cache
   */
  clear(): void {
    this.preloadedUrls.clear();
    this.queue = [];
  }

  /**
   * Get preload stats
   */
  getStats(): { preloaded: number; pending: number; queued: number } {
    return {
      preloaded: this.preloadedUrls.size,
      pending: this.pendingUrls.size,
      queued: this.queue.length,
    };
  }
}

// Export singleton
export const imagePreloader = new ImagePreloader();

/**
 * Preload images for content items
 * Call this when loading new content
 */
export function preloadContentImages(items: Array<{ imageUrl?: string; stream_icon?: string; cover?: string; cover_big?: string }>): void {
  const urls = items
    .flatMap(item => [
      item.imageUrl,
      item.stream_icon,
      item.cover,
      item.cover_big,
    ])
    .filter((url): url is string => Boolean(url));

  // Queue for background preloading
  imagePreloader.queuePreload(urls);
}

/**
 * Preload images for visible content (higher priority)
 */
export async function preloadVisibleImages(urls: string[]): Promise<void> {
  await imagePreloader.preloadBatch(urls.filter(Boolean), { priority: 'high' });
}

export default imagePreloader;
