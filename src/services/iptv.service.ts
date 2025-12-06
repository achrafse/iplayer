import axios, { AxiosInstance } from 'axios';
import {
  IPTVCredentials,
  AuthResponse,
  LiveCategory,
  LiveStream,
  VODCategory,
  VODStream,
  VODInfo,
  SeriesCategory,
  Series,
  SeriesInfo,
  EPGListing,
} from '../types/iptv.types';

/**
 * Xtream Codes API Service
 * Handles all IPTV API communications using direct credentials
 * 
 * Performance optimizations:
 * - Smart caching with stale-while-revalidate pattern
 * - Background refresh for stale data
 * - Request deduplication
 * - Prefetching support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isRefreshing?: boolean;
}

class IPTVService {
  private axiosInstance: AxiosInstance;
  private credentials: IPTVCredentials | null = null;
  private baseUrl: string = '';
  
  // Enhanced cache with stale-while-revalidate
  private cache: Map<string, CacheEntry<any>> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes - fresh
  private CACHE_STALE_TTL = 30 * 60 * 1000; // 30 minutes - stale but usable
  
  // Request deduplication - prevent duplicate in-flight requests
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  // Prefetch queue
  private prefetchQueue: Set<string> = new Set();
  private isPrefetching = false;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 60000, // 60 seconds for large content lists
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Smart cache with stale-while-revalidate pattern
   * Returns stale data immediately while refreshing in background
   */
  private async getCachedOrFetch<T>(
    cacheKey: string, 
    fetchFn: () => Promise<T>,
    options: { forceRefresh?: boolean; backgroundRefresh?: boolean } = {}
  ): Promise<T> {
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    // Check if we have cached data
    if (cached) {
      const age = now - cached.timestamp;
      
      // Fresh cache - return immediately
      if (age < this.CACHE_TTL && !options.forceRefresh) {
        return cached.data as T;
      }
      
      // Stale but usable - return and refresh in background
      if (age < this.CACHE_STALE_TTL && !options.forceRefresh) {
        // Trigger background refresh if not already refreshing
        if (!cached.isRefreshing) {
          this.backgroundRefresh(cacheKey, fetchFn);
        }
        return cached.data as T;
      }
    }
    
    // No cache or expired - fetch fresh data with deduplication
    return this.deduplicatedFetch(cacheKey, fetchFn);
  }
  
  /**
   * Deduplicate concurrent requests for the same resource
   */
  private async deduplicatedFetch<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
    // Check if request is already in flight
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }
    
    // Create new request
    const request = fetchFn()
      .then((data) => {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      })
      .finally(() => {
        this.pendingRequests.delete(cacheKey);
      });
    
    this.pendingRequests.set(cacheKey, request);
    return request;
  }
  
  /**
   * Refresh cache in background without blocking
   */
  private backgroundRefresh<T>(cacheKey: string, fetchFn: () => Promise<T>) {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.isRefreshing = true;
    }
    
    fetchFn()
      .then((data) => {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      })
      .catch((error) => {
        console.warn(`Background refresh failed for ${cacheKey}:`, error);
      })
      .finally(() => {
        const entry = this.cache.get(cacheKey);
        if (entry) {
          entry.isRefreshing = false;
        }
      });
  }
  
  /**
   * Prefetch content for better UX
   * Call this to preload data for tabs user might navigate to
   */
  async prefetch(contentType: 'live' | 'movies' | 'series') {
    const prefetchTasks: Promise<any>[] = [];
    
    if (contentType === 'live' || contentType === 'movies' || contentType === 'series') {
      // Prefetch categories first (smaller payload)
      if (contentType === 'live') {
        prefetchTasks.push(this.getLiveCategories());
      } else if (contentType === 'movies') {
        prefetchTasks.push(this.getVODCategories());
      } else {
        prefetchTasks.push(this.getSeriesCategories());
      }
    }
    
    // Execute prefetch in background
    Promise.all(prefetchTasks).catch(() => {
      // Silent fail for prefetch
    });
  }
  
  /**
   * Prefetch all content types (call on app start)
   */
  async prefetchAll() {
    // Stagger prefetch requests to avoid overwhelming the server
    setTimeout(() => this.prefetch('live'), 0);
    setTimeout(() => this.prefetch('movies'), 1000);
    setTimeout(() => this.prefetch('series'), 2000);
  }
  
  /**
   * Clear cache (useful for refresh)
   */
  clearCache(cacheKey?: string) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }
  
  /**
   * Get cache stats for debugging
   */
  getCacheStats() {
    const stats: Record<string, { age: number; isStale: boolean }> = {};
    const now = Date.now();
    
    this.cache.forEach((entry, key) => {
      const age = now - entry.timestamp;
      stats[key] = {
        age: Math.round(age / 1000),
        isStale: age > this.CACHE_TTL,
      };
    });
    
    return stats;
  }
  
  /**
   * Check if running on web platform (including LG webOS, Samsung Tizen)
   */
  private isWeb(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
  
  /**
   * CORS proxy URL configuration
   * - Development: http://localhost:3001
   * - Production: Set EXPO_PUBLIC_PROXY_URL environment variable
   * 
   * For LG webOS / Samsung Tizen production builds, deploy a CORS proxy
   * and set the URL in your build environment.
   */
  private getProxyUrl(): string {
    // Check for environment variable (works with Expo)
    const envProxyUrl = process.env.EXPO_PUBLIC_PROXY_URL;
    if (envProxyUrl) {
      return envProxyUrl;
    }
    
    // Development fallback
    if (__DEV__) {
      return 'http://localhost:3001';
    }
    
    // Production: If no proxy URL is set, try direct connection
    // (may work if IPTV server has CORS enabled)
    return '';
  }

  /**
   * Initialize service with credentials
   */
  setCredentials(credentials: IPTVCredentials) {
    this.credentials = credentials;
    // Ensure URL has protocol
    const url = credentials.serverUrl.startsWith('http')
      ? credentials.serverUrl
      : `http://${credentials.serverUrl}`;
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  /**
   * Build API URL with credentials
   * Uses proxy on web platforms to bypass CORS restrictions
   */
  private buildUrl(action: string, params: Record<string, any> = {}): string {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }

    const queryParams = new URLSearchParams({
      username: this.credentials.username,
      password: this.credentials.password,
      ...params,
    });

    const directUrl = `${this.baseUrl}/player_api.php?${queryParams.toString()}`;
    
    // Use proxy on web platforms (browser, LG webOS, Samsung Tizen) to bypass CORS
    if (this.isWeb()) {
      const proxyUrl = this.getProxyUrl();
      if (proxyUrl) {
        return `${proxyUrl}?url=${encodeURIComponent(directUrl)}`;
      }
    }
    
    return directUrl;
  }

  /**
   * Authenticate and get server info
   */
  async authenticate(): Promise<AuthResponse> {
    try {
      const url = this.buildUrl('');
      const response = await this.axiosInstance.get<AuthResponse>(url);
      
      if (response.data.user_info.auth !== 1) {
        throw new Error('Authentication failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Get all live stream categories
   */
  async getLiveCategories(): Promise<LiveCategory[]> {
    return this.getCachedOrFetch('live_categories', async () => {
      const url = this.buildUrl('', { action: 'get_live_categories' });
      const response = await this.axiosInstance.get<LiveCategory[]>(url);
      return response.data;
    });
  }

  /**
   * Get live streams by category
   */
  async getLiveStreams(categoryId?: string): Promise<LiveStream[]> {
    const cacheKey = `live_streams_${categoryId || 'all'}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const params: any = { action: 'get_live_streams' };
      if (categoryId) {
        params.category_id = categoryId;
      }
      const url = this.buildUrl('', params);
      const response = await this.axiosInstance.get<LiveStream[]>(url);
      return response.data;
    });
  }

  /**
   * Get VOD categories
   */
  async getVODCategories(): Promise<VODCategory[]> {
    return this.getCachedOrFetch('vod_categories', async () => {
      const url = this.buildUrl('', { action: 'get_vod_categories' });
      const response = await this.axiosInstance.get<VODCategory[]>(url);
      return response.data;
    });
  }

  /**
   * Get VOD streams by category
   */
  async getVODStreams(categoryId?: string): Promise<VODStream[]> {
    const cacheKey = `vod_streams_${categoryId || 'all'}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const params: any = { action: 'get_vod_streams' };
      if (categoryId) {
        params.category_id = categoryId;
      }
      const url = this.buildUrl('', params);
      const response = await this.axiosInstance.get<VODStream[]>(url);
      return response.data;
    });
  }

  /**
   * Get VOD info by stream ID
   */
  async getVODInfo(vodId: number): Promise<VODInfo> {
    try {
      const url = this.buildUrl('', { action: 'get_vod_info', vod_id: vodId });
      const response = await this.axiosInstance.get<VODInfo>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching VOD info:', error);
      throw error;
    }
  }

  /**
   * Get series categories
   */
  async getSeriesCategories(): Promise<SeriesCategory[]> {
    return this.getCachedOrFetch('series_categories', async () => {
      const url = this.buildUrl('', { action: 'get_series_categories' });
      const response = await this.axiosInstance.get<SeriesCategory[]>(url);
      return response.data;
    });
  }

  /**
   * Get series list by category
   */
  async getSeries(categoryId?: string): Promise<any[]> {
    const cacheKey = `series_${categoryId || 'all'}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const params: any = { action: 'get_series' };
      if (categoryId) {
        params.category_id = categoryId;
      }
      const url = this.buildUrl('', params);
      const response = await this.axiosInstance.get<any[]>(url);
      return response.data;
    });
  }

  /**
   * Get series info by series ID
   */
  async getSeriesInfo(seriesId: number): Promise<SeriesInfo> {
    try {
      const url = this.buildUrl('', { action: 'get_series_info', series_id: seriesId });
      const response = await this.axiosInstance.get<SeriesInfo>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching series info:', error);
      throw error;
    }
  }

  /**
   * Get EPG for a channel
   */
  async getEPG(streamId: number, limit?: number): Promise<EPGListing[]> {
    try {
      const params: any = { action: 'get_simple_data_table', stream_id: streamId };
      if (limit) {
        params.limit = limit;
      }
      const url = this.buildUrl('', params);
      const response = await this.axiosInstance.get<{ epg_listings: EPGListing[] }>(url);
      return response.data.epg_listings || [];
    } catch (error) {
      console.error('Error fetching EPG:', error);
      throw error;
    }
  }

  /**
   * Build stream URL for playback
   */
  getStreamUrl(streamId: number, extension: string = 'm3u8', type: 'live' | 'movie' | 'series' = 'live'): string {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }

    return `${this.baseUrl}/${type}/${this.credentials.username}/${this.credentials.password}/${streamId}.${extension}`;
  }

  /**
   * Build episode stream URL
   */
  getEpisodeUrl(episodeId: string, extension: string = 'mp4'): string {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }

    return `${this.baseUrl}/series/${this.credentials.username}/${this.credentials.password}/${episodeId}.${extension}`;
  }

  /**
   * Get short EPG for multiple streams (if supported)
   */
  async getShortEPG(streamId: number, limit: number = 4): Promise<any> {
    try {
      const url = this.buildUrl('', { 
        action: 'get_short_epg', 
        stream_id: streamId,
        limit 
      });
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching short EPG:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const iptvService = new IPTVService();
export default iptvService;
