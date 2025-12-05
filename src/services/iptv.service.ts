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
 */
class IPTVService {
  private axiosInstance: AxiosInstance;
  private credentials: IPTVCredentials | null = null;
  private baseUrl: string = '';
  
  // Cache for faster subsequent loads
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000, // 30 seconds for proxy requests
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Get cached data or fetch new
   */
  private async getCachedOrFetch<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    
    const data = await fetchFn();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }
  
  /**
   * Clear cache (useful for refresh)
   */
  clearCache() {
    this.cache.clear();
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
