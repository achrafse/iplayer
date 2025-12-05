import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPTVCredentials } from '../types/iptv.types';

const STORAGE_KEYS = {
  CREDENTIALS: '@alphastudio:credentials',
  FAVORITES: '@alphastudio:favorites',
  RECENT: '@alphastudio:recent',
  WATCH_HISTORY: '@alphastudio:watch_history',
};

export interface WatchHistoryItem {
  id: string;
  title: string;
  type: 'live' | 'movie' | 'series';
  poster?: string;
  logo?: string;
  position: number; // in seconds
  duration: number; // in seconds
  timestamp: number; // when it was last watched
  streamUrl: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

/**
 * Storage utility for persisting data
 */
export const storage = {
  /**
   * Save IPTV credentials
   */
  async saveCredentials(credentials: IPTVCredentials): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CREDENTIALS,
        JSON.stringify(credentials)
      );
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  },

  /**
   * Get saved credentials
   */
  async getCredentials(): Promise<IPTVCredentials | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting credentials:', error);
      return null;
    }
  },

  /**
   * Clear credentials (logout)
   */
  async clearCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    } catch (error) {
      console.error('Error clearing credentials:', error);
      throw error;
    }
  },

  /**
   * Save favorites
   */
  async saveFavorites(favorites: number[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw error;
    }
  },

  /**
   * Get favorites
   */
  async getFavorites(): Promise<number[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  /**
   * Add to recent
   */
  async addToRecent(streamId: number): Promise<void> {
    try {
      const recent = await this.getRecent();
      const updated = [streamId, ...recent.filter(id => id !== streamId)].slice(0, 20);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding to recent:', error);
    }
  },

  /**
   * Get recent streams
   */
  async getRecent(): Promise<number[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting recent:', error);
      return [];
    }
  },

  /**
   * Get watch history
   */
  async getWatchHistory(): Promise<WatchHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting watch history:', error);
      return [];
    }
  },

  /**
   * Add to watch history
   */
  async addToWatchHistory(item: WatchHistoryItem): Promise<void> {
    try {
      let history = await this.getWatchHistory();
      
      // Remove existing entry for this item
      history = history.filter(h => h.id !== item.id);
      
      // Add to beginning
      history.unshift({
        ...item,
        timestamp: Date.now(),
      });
      
      // Keep only last 50 items
      history = history.slice(0, 50);
      
      await AsyncStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding to watch history:', error);
    }
  },

  /**
   * Remove from watch history
   */
  async removeFromWatchHistory(id: string): Promise<void> {
    try {
      const history = await this.getWatchHistory();
      const filtered = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from watch history:', error);
    }
  },

  /**
   * Clear watch history
   */
  async clearWatchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
    } catch (error) {
      console.error('Error clearing watch history:', error);
    }
  },

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};
