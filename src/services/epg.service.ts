import { IPTVCredentials, EPGListing } from '../types/iptv.types';

/**
 * EPG Service for fetching and managing Electronic Program Guide data
 */
export class EPGService {
  private credentials: IPTVCredentials;
  private baseUrl: string;

  constructor(credentials: IPTVCredentials) {
    this.credentials = credentials;
    this.baseUrl = `http://${credentials.serverUrl}/player_api.php`;
  }

  /**
   * Get EPG for a specific channel
   */
  async getChannelEPG(streamId: number, limit: number = 10): Promise<EPGListing[]> {
    try {
      const params = new URLSearchParams({
        username: this.credentials.username,
        password: this.credentials.password,
        action: 'get_short_epg',
        stream_id: streamId.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();

      if (data.epg_listings) {
        return Object.values(data.epg_listings).map((item: any) => ({
          id: item.id,
          epg_id: item.epg_id,
          title: item.title,
          lang: item.lang,
          start: item.start,
          end: item.end,
          description: item.description,
          channel_id: item.channel_id,
          start_timestamp: parseInt(item.start_timestamp),
          stop_timestamp: parseInt(item.stop_timestamp),
          now_playing: item.now_playing,
          has_archive: item.has_archive,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching EPG:', error);
      return [];
    }
  }

  /**
   * Get current and next program for a channel
   */
  async getCurrentAndNext(streamId: number): Promise<{ current: EPGListing | null; next: EPGListing | null }> {
    try {
      const listings = await this.getChannelEPG(streamId, 5);
      const now = Date.now() / 1000; // Convert to Unix timestamp

      let current: EPGListing | null = null;
      let next: EPGListing | null = null;

      for (let i = 0; i < listings.length; i++) {
        const program = listings[i];
        
        if (program.start_timestamp <= now && program.stop_timestamp >= now) {
          current = program;
          next = listings[i + 1] || null;
          break;
        }
      }

      // If no current program found, assume first one is next
      if (!current && listings.length > 0) {
        next = listings[0];
      }

      return { current, next };
    } catch (error) {
      console.error('Error fetching current/next program:', error);
      return { current: null, next: null };
    }
  }

  /**
   * Format time for display
   */
  formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * Get program progress percentage
   */
  getProgramProgress(program: EPGListing): number {
    const now = Date.now() / 1000;
    const duration = program.stop_timestamp - program.start_timestamp;
    const elapsed = now - program.start_timestamp;
    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  }
}
