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

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
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

    return `${this.baseUrl}/player_api.php?${queryParams.toString()}`;
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
    try {
      const url = this.buildUrl('', { action: 'get_live_categories' });
      const response = await this.axiosInstance.get<LiveCategory[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching live categories:', error);
      throw error;
    }
  }

  /**
   * Get live streams by category
   */
  async getLiveStreams(categoryId?: string): Promise<LiveStream[]> {
    try {
      const params: any = { action: 'get_live_streams' };
      if (categoryId) {
        params.category_id = categoryId;
      }
      const url = this.buildUrl('', params);
      const response = await this.axiosInstance.get<LiveStream[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching live streams:', error);
      throw error;
    }
  }

  /**
   * Get VOD categories
   */
  async getVODCategories(): Promise<VODCategory[]> {
    try {
      const url = this.buildUrl('', { action: 'get_vod_categories' });
      const response = await this.axiosInstance.get<VODCategory[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching VOD categories:', error);
      throw error;
    }
  }

  /**
   * Get VOD streams by category
   */
  async getVODStreams(categoryId?: string): Promise<VODStream[]> {
    try {
      const params: any = { action: 'get_vod_streams' };
      if (categoryId) {
        params.category_id = categoryId;
      }
      const url = this.buildUrl('', params);
      const response = await this.axiosInstance.get<VODStream[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching VOD streams:', error);
      throw error;
    }
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
    try {
      const url = this.buildUrl('', { action: 'get_series_categories' });
      const response = await this.axiosInstance.get<SeriesCategory[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching series categories:', error);
      throw error;
    }
  }

  /**
   * Get series list by category
   */
  async getSeries(categoryId?: string): Promise<any[]> {
    try {
      const params: any = { action: 'get_series' };
      if (categoryId) {
        params.category_id = categoryId;
      }
      const url = this.buildUrl('', params);
      const response = await this.axiosInstance.get<any[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching series:', error);
      throw error;
    }
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
