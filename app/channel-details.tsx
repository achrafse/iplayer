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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { iptvService } from '../src/services/iptv.service';
import { EPGService } from '../src/services/epg.service';
import { EPGListing, LiveStream } from '../src/types/iptv.types';
import { colors, typography, spacing, borderRadius, rgba } from '../src/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function ChannelDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    streamId: string;
    name: string;
    logo: string;
    categoryId: string;
  }>();
  const { credentials, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [channel, setChannel] = useState<LiveStream | null>(null);
  const [epgListings, setEpgListings] = useState<EPGListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [epgService, setEpgService] = useState<EPGService | null>(null);

  const streamId = Number.parseInt(params.streamId);
  const isFav = isFavorite(streamId);

  useEffect(() => {
    // Wait for auth to be ready before loading
    if (isAuthenticated && !authLoading) {
      loadChannelDetails();
    }
  }, [params.streamId, isAuthenticated, authLoading]);

  const loadChannelDetails = async () => {
    try {
      setLoading(true);
      
      const streams = await iptvService.getLiveStreams(params.categoryId);
      const channelData = streams.find(s => s.stream_id === streamId);
      if (channelData) {
        setChannel(channelData);
      }

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

  const getCurrentProgram = () => {
    return epgListings.find(isNowPlaying);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.accent} />
        <Text style={styles.loadingText}>Loading channel details...</Text>
      </View>
    );
  }

  const currentProgram = getCurrentProgram();
  const logoUrl = params.logo || channel?.stream_icon;

  return (
    <View style={styles.container}>
      {/* Backdrop Gradient */}
      <LinearGradient
        colors={[colors.primary.darkGray, colors.primary.background]}
        style={styles.backdrop}
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Channel Section - Centered Layout */}
        <View style={styles.channelSection}>
          {/* Channel Logo */}
          <View style={styles.logoContainer}>
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>📺</Text>
              </View>
            )}
          </View>

          {/* Channel Name */}
          <Text style={styles.channelName}>{params.name}</Text>

          {/* Live Badge */}
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>

          {/* Current Program Info */}
          {Boolean(currentProgram) && (
            <View style={styles.currentProgram}>
              <Text style={styles.nowPlayingLabel}>Now Playing</Text>
              <Text style={styles.currentProgramTitle}>{currentProgram?.title}</Text>
              <Text style={styles.currentProgramTime}>
                {formatTime(currentProgram!.start_timestamp)} - {formatTime(currentProgram!.stop_timestamp)}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
              <Text style={styles.playButtonIcon}>▶</Text>
              <Text style={styles.playButtonText}>Watch Live</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, isFav && styles.iconButtonActive]}
              onPress={() => toggleFavorite(streamId)}
            >
              <Text style={styles.iconButtonText}>{isFav ? '❤️' : '♡'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TV Guide Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TV Guide</Text>
          
          {epgListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateText}>No schedule available</Text>
            </View>
          ) : (
            <View style={styles.programList}>
              {epgListings.map((program) => {
                const isNow = isNowPlaying(program);
                const progress = epgService ? epgService.getProgramProgress(program) : 0;

                return (
                  <View
                    key={program.id}
                    style={[styles.programCard, isNow && styles.programCardNow]}
                  >
                    <View style={styles.programTimeColumn}>
                      <Text style={[styles.programTime, isNow && styles.programTimeNow]}>
                        {formatTime(program.start_timestamp)}
                      </Text>
                      <Text style={styles.programEndTime}>
                        {formatTime(program.stop_timestamp)}
                      </Text>
                    </View>

                    <View style={styles.programContent}>
                      {isNow && (
                        <View style={styles.nowBadge}>
                          <Text style={styles.nowBadgeText}>NOW</Text>
                        </View>
                      )}
                      <Text style={[styles.programTitle, isNow && styles.programTitleNow]}>
                        {program.title}
                      </Text>
                      {Boolean(program.description) && (
                        <Text style={styles.programDescription} numberOfLines={2}>
                          {program.description}
                        </Text>
                      )}
                      {isNow && (
                        <View style={styles.progressBarContainer}>
                          <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.background,
  },
  loadingText: {
    color: colors.neutral.gray200,
    marginTop: spacing.lg,
    fontSize: typography.size.base,
    fontWeight: '500' as const,
  },

  // Backdrop
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenWidth * 0.5,
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: spacing.huge,
    left: spacing.giant,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: rgba(colors.primary.black, 0.6),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.2),
  },
  backButtonText: {
    fontSize: typography.size.xl,
    color: colors.neutral.white,
    fontWeight: '600' as const,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.huge + spacing.xxl,
  },

  // Channel Section - Centered
  channelSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.giant,
    marginBottom: spacing.xxl,
  },

  // Logo
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: rgba(colors.neutral.white, 0.05),
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: '70%',
    height: '70%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.mediumGray,
  },
  logoPlaceholderText: {
    fontSize: 48,
    opacity: 0.3,
  },

  // Channel Name
  channelName: {
    fontSize: typography.size.xxl,
    fontWeight: '700' as const,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },

  // Live Badge
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.live,
  },
  liveText: {
    fontSize: typography.size.xs,
    fontWeight: '700' as const,
    color: colors.semantic.live,
    letterSpacing: 1,
  },

  // Current Program
  currentProgram: {
    alignItems: 'center',
    backgroundColor: rgba(colors.neutral.white, 0.05),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.08),
  },
  nowPlayingLabel: {
    fontSize: typography.size.xs,
    fontWeight: '600' as const,
    color: colors.primary.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  currentProgramTitle: {
    fontSize: typography.size.base,
    fontWeight: '600' as const,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  currentProgramTime: {
    fontSize: typography.size.xs,
    color: colors.neutral.gray400,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  playButtonIcon: {
    fontSize: typography.size.base,
    color: colors.neutral.white,
  },
  playButtonText: {
    fontSize: typography.size.base,
    color: colors.neutral.white,
    fontWeight: '600' as const,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: rgba(colors.neutral.white, 0.08),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.15),
  },
  iconButtonActive: {
    backgroundColor: rgba(colors.primary.accent, 0.15),
    borderColor: rgba(colors.primary.accent, 0.3),
  },
  iconButtonText: {
    fontSize: typography.size.xl,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.giant,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: '600' as const,
    color: colors.neutral.white,
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.3,
  },
  emptyStateText: {
    fontSize: typography.size.base,
    color: colors.neutral.gray400,
  },

  // Program List
  programList: {
    gap: spacing.sm,
  },
  programCard: {
    flexDirection: 'row',
    backgroundColor: rgba(colors.neutral.white, 0.04),
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.06),
  },
  programCardNow: {
    backgroundColor: rgba(colors.primary.accent, 0.08),
    borderColor: rgba(colors.primary.accent, 0.2),
  },
  programTimeColumn: {
    width: 70,
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: rgba(colors.neutral.white, 0.06),
    justifyContent: 'center',
  },
  programTime: {
    fontSize: typography.size.sm,
    fontWeight: '600' as const,
    color: colors.neutral.gray200,
  },
  programTimeNow: {
    color: colors.primary.accent,
  },
  programEndTime: {
    fontSize: typography.size.xs,
    color: colors.neutral.gray500,
    marginTop: spacing.xs,
  },
  programContent: {
    flex: 1,
    padding: spacing.md,
  },
  nowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  nowBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: '700' as const,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  programTitle: {
    fontSize: typography.size.sm,
    fontWeight: '600' as const,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  programTitleNow: {
    color: colors.neutral.white,
  },
  programDescription: {
    fontSize: typography.size.xs,
    color: colors.neutral.gray400,
    lineHeight: typography.size.xs * 1.5,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: rgba(colors.primary.accent, 0.2),
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.accent,
    borderRadius: 2,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: spacing.giant,
  },
});
