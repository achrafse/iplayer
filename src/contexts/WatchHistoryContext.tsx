import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, WatchHistoryItem } from '../utils/storage';

interface WatchHistoryContextType {
  history: WatchHistoryItem[];
  addToHistory: (item: WatchHistoryItem) => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
  getItemProgress: (id: string) => { position: number; duration: number; percentage: number } | null;
}

const WatchHistoryContext = createContext<WatchHistoryContextType | undefined>(undefined);

export const WatchHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  const loadHistory = async () => {
    const hist = await storage.getWatchHistory();
    setHistory(hist);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const addToHistory = async (item: WatchHistoryItem) => {
    await storage.addToWatchHistory(item);
    await loadHistory();
  };

  const removeFromHistory = async (id: string) => {
    await storage.removeFromWatchHistory(id);
    await loadHistory();
  };

  const clearHistory = async () => {
    await storage.clearWatchHistory();
    setHistory([]);
  };

  const getItemProgress = (id: string) => {
    const item = history.find(h => h.id === id);
    if (!item) return null;
    
    return {
      position: item.position,
      duration: item.duration,
      percentage: item.duration > 0 ? (item.position / item.duration) * 100 : 0,
    };
  };

  return (
    <WatchHistoryContext.Provider
      value={{
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        loadHistory,
        getItemProgress,
      }}
    >
      {children}
    </WatchHistoryContext.Provider>
  );
};

export const useWatchHistory = () => {
  const context = useContext(WatchHistoryContext);
  if (!context) {
    throw new Error('useWatchHistory must be used within WatchHistoryProvider');
  }
  return context;
};
