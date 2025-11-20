import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VideoPlayer } from '../src/components/VideoPlayer';
import { storage } from '../src/utils/storage';
import { useWatchHistory } from '../src/contexts/WatchHistoryContext';

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    url: string; 
    title: string; 
    streamId: string;
    type?: string;
    poster?: string;
    logo?: string;
  }>();
  const { addToHistory } = useWatchHistory();
  const lastPositionRef = useRef(0);
  const durationRef = useRef(0);

  useEffect(() => {
    // Add to recent when player loads
    if (params.streamId) {
      storage.addToRecent(Number(params.streamId));
    }
  }, [params.streamId]);

  const handleBack = () => {
    // Save watch history when leaving player
    if (params.streamId && params.title && lastPositionRef.current > 5) {
      addToHistory({
        id: params.streamId,
        title: params.title,
        type: (params.type as 'live' | 'movie' | 'series') || 'live',
        poster: params.poster,
        logo: params.logo,
        position: lastPositionRef.current,
        duration: durationRef.current,
        timestamp: Date.now(),
        streamUrl: params.url,
      });
    }
    router.back();
  };

  const handleError = (error: string) => {
    console.error('Player error:', error);
  };

  const handleProgress = (position: number, duration: number) => {
    lastPositionRef.current = position;
    durationRef.current = duration;
  };

  if (!params.url) {
    return null;
  }

  return (
    <View style={styles.container}>
      <VideoPlayer
        uri={params.url}
        title={params.title}
        onBack={handleBack}
        onError={handleError}
        onProgress={handleProgress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
