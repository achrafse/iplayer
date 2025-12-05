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
import { Button } from '../src/components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows, rgba } from '../src/constants/theme';

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
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
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
        <ActivityIndicator size="large" color="#E50914" />
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
            <Button
              title="▶ Watch Live"
              variant="primary"
              size="xl"
              onPress={handlePlay}
              fullWidth
            />

            <Button
              title={isFav ? '❤️ Favorited' : '🤍 Add to Favorites'}
              variant={isFav ? 'danger' : 'secondary'}
              size="xl"
              onPress={() => toggleFavorite(streamId)}
              fullWidth
            />
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
    backgroundColor: colors.primary.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.background,
  },
  loadingText: {
    color: colors.neutral.gray200,
    marginTop: spacing.lg,
    fontSize: typography.size.lg,
    fontWeight: '500' as any,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xxxl + spacing.md,
    backgroundColor: rgba(colors.primary.background, 0.98),
    borderBottomWidth: 1,
    borderBottomColor: rgba(colors.neutral.white, 0.1),
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: rgba(colors.neutral.white, 0.4),
    // No heavy shadows
  },
  backIcon: {
    fontSize: typography.size.xl,
    color: colors.neutral.white,
  },
  headerTitle: {
    fontSize: typography.size.xxl,
    fontWeight: '800' as any,
    color: colors.neutral.white,
    letterSpacing: typography.letterSpacing.wide,
  },
  content: {
    flex: 1,
  },
  channelSection: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 240,
    height: 140,
    backgroundColor: rgba(colors.primary.mediumGray, 0.4),
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: rgba(colors.primary.lightGray, 0.3),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.lg,
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  logoPlaceholder: {
    backgroundColor: rgba(colors.primary.mediumGray, 0.5),
  },
  logoPlaceholderText: {
    fontSize: typography.size.hero,
    opacity: 0.3,
  },
  channelInfo: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  channelName: {
    fontSize: typography.size.xxxl + 4,
    fontWeight: '800' as any,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.tight,
  },
  channelMeta: {
    fontSize: typography.size.md,
    color: colors.neutral.gray200,
    fontWeight: '500' as any,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    maxWidth: 600,
  },
  // Primary Play button - Solid red, minimal corners
  playButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary.accent,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button, // Minimal 4-6px corners
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    // No heavy shadows
  },
  playButtonIcon: {
    fontSize: typography.size.xl,
    color: colors.neutral.white,
  },
  playButtonText: {
    fontSize: typography.size.md,
    fontWeight: '600' as any,
    color: colors.neutral.white,
    letterSpacing: typography.letterSpacing.wide,
  },
  // Favorite button - Transparent with border
  favoriteButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button, // Minimal corners
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: rgba(colors.neutral.white, 0.5),
    // No heavy shadows
  },
  favoriteButtonActive: {
    backgroundColor: rgba(colors.primary.accent, 0.15),
    borderColor: colors.primary.accent,
  },
  favoriteButtonIcon: {
    fontSize: typography.size.xl,
  },
  favoriteButtonText: {
    fontSize: typography.size.md,
    fontWeight: '600' as any,
    color: colors.neutral.white,
    letterSpacing: typography.letterSpacing.wide,
  },
  favoriteButtonTextActive: {
    color: colors.primary.accent,
  },
  scheduleSection: {
    padding: spacing.xxxl,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: typography.size.xxl + 4,
    fontWeight: '800' as any,
    color: colors.neutral.white,
    marginBottom: spacing.xl,
    letterSpacing: typography.letterSpacing.wide,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  emptyStateIcon: {
    fontSize: typography.size.hero,
    marginBottom: spacing.lg,
    opacity: 0.3,
  },
  emptyStateText: {
    fontSize: typography.size.lg,
    color: colors.neutral.gray200,
    fontWeight: '500' as any,
  },
  programCard: {
    backgroundColor: rgba(colors.primary.mediumGray, 0.4),
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: rgba(colors.primary.lightGray, 0.3),
    ...shadows.md,
  },
  programCardNow: {
    backgroundColor: rgba(colors.primary.accent, 0.12),
    borderColor: colors.primary.accent,
    ...shadows.accent,
  },
  nowPlayingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  nowPlayingText: {
    color: colors.primary.black,
    fontSize: typography.size.sm,
    fontWeight: '800' as any,
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase' as any,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  programTime: {
    fontSize: typography.size.md,
    fontWeight: '700' as any,
    color: colors.primary.accent,
    letterSpacing: typography.letterSpacing.wide,
  },
  programDate: {
    fontSize: typography.size.sm,
    color: colors.neutral.gray200,
    fontWeight: '500' as any,
  },
  programTitle: {
    fontSize: typography.size.lg + 2,
    fontWeight: '700' as any,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.normal,
  },
  programDescription: {
    fontSize: typography.size.md,
    color: colors.neutral.gray100,
    lineHeight: typography.size.xl,
    fontWeight: '400' as any,
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: rgba(colors.primary.accent, 0.2),
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.accent,
    boxShadow: '0 0 4px rgba(229, 9, 20, 0.8)',
  },
});
