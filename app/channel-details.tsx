import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { iptvService } from '../src/services/iptv.service';
import { EPGService } from '../src/services/epg.service';
import { EPGListing, LiveStream } from '../src/types/iptv.types';

const { width } = Dimensions.get('window');

export default function ChannelDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    streamId: string;
    name: string;
    logo: string;
    categoryId: string;
  }>();
  const { credentials } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [channel, setChannel] = useState<LiveStream | null>(null);
  const [epgListings, setEpgListings] = useState<EPGListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [epgService, setEpgService] = useState<EPGService | null>(null);

  const streamId = parseInt(params.streamId);
  const isFav = isFavorite(streamId);

  useEffect(() => {
    loadChannelDetails();
  }, [params.streamId]);

  const loadChannelDetails = async () => {
    try {
      setLoading(true);
      
      // Load channel info
      const streams = await iptvService.getLiveStreams(params.categoryId);
      const channelData = streams.find(s => s.stream_id === streamId);
      if (channelData) {
        setChannel(channelData);
      }

      // Load EPG
      if (credentials) {
        const service = new EPGService(credentials);
        setEpgService(service);
        const listings = await service.getChannelEPG(streamId, 20);
        setEpgListings(listings);
      }
    } catch (error) {
      console.error('Error loading channel details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    const streamUrl = iptvService.getStreamUrl(streamId, 'm3u8', 'live');
    router.push({
      pathname: '/player',
      params: {
        url: streamUrl,
        title: params.name,
        type: 'live',
        streamId: params.streamId,
        logo: params.logo,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const isNowPlaying = (program: EPGListing) => {
    const now = Date.now() / 1000;
    return program.start_timestamp <= now && program.stop_timestamp >= now;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#64ffda" />
        <Text style={styles.loadingText}>Loading channel details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Channel Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Channel Info Section */}
        <View style={styles.channelSection}>
          <View style={styles.logoContainer}>
            {params.logo ? (
              <Image
                source={{ uri: params.logo }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.logo, styles.logoPlaceholder]}>
                <Text style={styles.logoPlaceholderText}>📺</Text>
              </View>
            )}
          </View>

          <View style={styles.channelInfo}>
            <Text style={styles.channelName}>{params.name}</Text>
            {channel && (
              <Text style={styles.channelMeta}>
                Stream ID: {channel.stream_id}
              </Text>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlay}
            >
              <Text style={styles.playButtonIcon}>▶</Text>
              <Text style={styles.playButtonText}>Watch Live</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.favoriteButtonLarge, isFav && styles.favoriteButtonActive]}
              onPress={() => toggleFavorite(streamId)}
            >
              <Text style={styles.favoriteButtonIcon}>{isFav ? '❤️' : '🤍'}</Text>
              <Text style={[styles.favoriteButtonText, isFav && styles.favoriteButtonTextActive]}>
                {isFav ? 'Favorited' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* EPG Schedule Section */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>TV Guide</Text>
          {epgListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateText}>No schedule available</Text>
            </View>
          ) : (
            epgListings.map((program, index) => {
              const now = isNowPlaying(program);
              const progress = epgService ? epgService.getProgramProgress(program) : 0;

              return (
                <View
                  key={program.id}
                  style={[styles.programCard, now && styles.programCardNow]}
                >
                  {now && (
                    <View style={styles.nowPlayingBadge}>
                      <Text style={styles.nowPlayingText}>● NOW</Text>
                    </View>
                  )}

                  <View style={styles.programHeader}>
                    <Text style={styles.programTime}>
                      {formatTime(program.start_timestamp)} - {formatTime(program.stop_timestamp)}
                    </Text>
                    <Text style={styles.programDate}>
                      {formatDate(program.start_timestamp)}
                    </Text>
                  </View>

                  <Text style={styles.programTitle}>{program.title}</Text>

                  {program.description && (
                    <Text style={styles.programDescription} numberOfLines={3}>
                      {program.description}
                    </Text>
                  )}

                  {now && (
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
  },
  loadingText: {
    color: '#8892b0',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(100, 255, 218, 0.1)',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(23, 42, 69, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#64ffda',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e6f1ff',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  channelSection: {
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 200,
    height: 120,
    backgroundColor: 'rgba(23, 42, 69, 0.4)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  logoPlaceholder: {
    backgroundColor: 'rgba(23, 42, 69, 0.5)',
  },
  logoPlaceholderText: {
    fontSize: 48,
    opacity: 0.3,
  },
  channelInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  channelName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e6f1ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  channelMeta: {
    fontSize: 14,
    color: '#8892b0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    maxWidth: 600,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#64ffda',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  playButtonIcon: {
    fontSize: 20,
    color: '#0a192f',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a192f',
    letterSpacing: 0.5,
  },
  favoriteButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(23, 42, 69, 0.6)',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.6)',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: '#ff6b6b',
  },
  favoriteButtonIcon: {
    fontSize: 20,
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8892b0',
    letterSpacing: 0.5,
  },
  favoriteButtonTextActive: {
    color: '#ff6b6b',
  },
  scheduleSection: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e6f1ff',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8892b0',
  },
  programCard: {
    backgroundColor: 'rgba(23, 42, 69, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.5)',
  },
  programCardNow: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderColor: '#64ffda',
  },
  nowPlayingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#64ffda',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  nowPlayingText: {
    color: '#0a192f',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  programTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64ffda',
  },
  programDate: {
    fontSize: 12,
    color: '#8892b0',
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e6f1ff',
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 14,
    color: '#ccd6f6',
    lineHeight: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(100, 255, 218, 0.2)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#64ffda',
  },
});
