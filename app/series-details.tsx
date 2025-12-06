import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { useAuth } from '../src/contexts/AuthContext';
import { iptvService } from '../src/services/iptv.service';
import { SeriesInfo, Episode } from '../src/types/iptv.types';
import { colors, typography, spacing, borderRadius, rgba } from '../src/constants/theme';
import { getBackdropUrl, sanitizeImageUrl } from '../src/utils/imageUrls';
import { OptimizedImage } from '../src/components/OptimizedImage';
import { useHover } from '../src/hooks/useHover';
import { isMobile } from '../src/utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

// Episode Card Component with hover effect
interface EpisodeCardProps {
  episode: Episode;
  posterUrl: string | null;
  onPress: () => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, posterUrl, onPress }) => {
  const { isHovered, hoverProps } = useHover();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  const episodeImageUrl = sanitizeImageUrl(episode.info.movie_image) || posterUrl;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isHovered ? 1.03 : 1,
        useNativeDriver: true,
        friction: 20,
        tension: 200,
      }),
      Animated.timing(overlayOpacity, {
        toValue: isHovered ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isHovered]);

  return (
    <Pressable onPress={onPress} {...hoverProps}>
      <Animated.View style={[styles.episodeCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.episodeThumbnail}>
          <OptimizedImage
            uri={episodeImageUrl || undefined}
            style={styles.episodeImage}
            resizeMode="cover"
            showLoader={false}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.episodeGradient}
          />
          <View style={styles.episodeNumberBadge}>
            <Text style={styles.episodeNumberText}>E{episode.episode_num}</Text>
          </View>
          
          {/* Hover overlay with play button */}
          {isHovered && (
            <Animated.View style={[styles.episodeHoverOverlay, { opacity: overlayOpacity }]}>
              <View style={styles.episodePlayButton}>
                <Text style={styles.episodePlayIcon}>▶</Text>
              </View>
            </Animated.View>
          )}
        </View>
        
        <View style={styles.episodeInfo}>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {episode.title || `Episode ${episode.episode_num}`}
          </Text>
          {Boolean(episode.info.duration) && (
            <Text style={styles.episodeDuration}>{episode.info.duration}</Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default function SeriesDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    seriesId: string;
    name: string;
    poster: string;
  }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [seriesInfo, setSeriesInfo] = useState<SeriesInfo | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  
  const episodesScrollRef = useRef<ScrollView>(null);

  const seriesId = Number.parseInt(params.seriesId);
  const isFav = isFavorite(seriesId);

  useEffect(() => {
    // Wait for auth to be ready before loading
    if (isAuthenticated && !authLoading) {
      loadSeriesDetails();
    }
  }, [params.seriesId, isAuthenticated, authLoading]);

  const loadSeriesDetails = async () => {
    try {
      setLoading(true);
      const info = await iptvService.getSeriesInfo(seriesId);
      setSeriesInfo(info);
      if (info.seasons && info.seasons.length > 0) {
        setSelectedSeason(info.seasons[0].season_number);
      }
    } catch (error) {
      console.error('Error loading series details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodePlay = (episode: Episode) => {
    const streamUrl = iptvService.getStreamUrl(
      Number.parseInt(episode.id),
      episode.container_extension,
      'series'
    );
    
    router.push({
      pathname: '/player',
      params: {
        url: streamUrl,
        title: `${params.name} - S${episode.season}E${episode.episode_num}`,
        type: 'series',
        streamId: episode.id,
        poster: episode.info.movie_image || params.poster,
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.accent} />
        <Text style={styles.loadingText}>Loading series details...</Text>
      </View>
    );
  }

  if (!seriesInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load series details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const info = seriesInfo.info;
  const posterUrl = sanitizeImageUrl(info?.cover) || sanitizeImageUrl(params.poster);
  // Get backdrop URL from backdrop_path array
  const backdropUrl = sanitizeImageUrl(getBackdropUrl(info)) || posterUrl;
  const currentSeasonEpisodes = seriesInfo.episodes?.[selectedSeason.toString()] || [];
  const seasons = seriesInfo.seasons || [];

  return (
    <View style={styles.container}>
      {/* Full-width Backdrop */}
      <View style={styles.backdrop}>
        <OptimizedImage
          uri={backdropUrl || undefined}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          showLoader={false}
          showPlaceholder={false}
        />
        <LinearGradient
          colors={[
            'rgba(10, 10, 10, 0.3)',
            'rgba(18, 18, 18, 0.7)',
            colors.primary.background,
          ]}
          locations={[0, 0.5, 1]}
          style={styles.backdropGradient}
        />
      </View>

      {/* Back Button - Fixed Position */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Poster */}
          <View style={styles.posterContainer}>
            <OptimizedImage
              uri={posterUrl || undefined}
              style={styles.poster}
              resizeMode="cover"
            />
          </View>

          {/* Series Info */}
          <View style={styles.infoContainer}>
            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {info.name || params.name}
            </Text>

            {/* Meta Row */}
            <View style={styles.metaRow}>
              {Boolean(info.releaseDate) && (
                <Text style={styles.metaText}>{info.releaseDate}</Text>
              )}
              {Boolean(info.rating) && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {info.rating}</Text>
                  </View>
                </>
              )}
              {seasons.length > 0 && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{seasons.length} Seasons</Text>
                </>
              )}
            </View>

            {/* Genres */}
            {Boolean(info.genre) && (
              <View style={styles.genreRow}>
                {info.genre.split(',').slice(0, 3).map((genre) => (
                  <View key={genre.trim()} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.trim()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={() => {
                  if (currentSeasonEpisodes.length > 0) {
                    handleEpisodePlay(currentSeasonEpisodes[0]);
                  }
                }}
              >
                <Text style={styles.playButtonIcon}>▶</Text>
                <Text style={styles.playButtonText}>Play S1 E1</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.iconButton, isFav && styles.iconButtonActive]}
                onPress={() => toggleFavorite(seriesId)}
              >
                <Text style={styles.iconButtonText}>{isFav ? '❤️' : '♡'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Description Section */}
        {Boolean(info.plot) && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.sectionTitleUnderline} />
            </View>
            <Text style={styles.description}>{info.plot}</Text>
          </View>
        )}

        {/* Cast & Crew Section */}
        {Boolean(info.director || info.cast) && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Cast & Crew</Text>
              <View style={styles.sectionTitleUnderline} />
            </View>
            
            {Boolean(info.director) && (
              <View style={styles.creditItem}>
                <Text style={styles.creditLabel}>Director</Text>
                <Text style={styles.creditValue}>{info.director}</Text>
              </View>
            )}

            {Boolean(info.cast) && (
              <View style={styles.creditItem}>
                <Text style={styles.creditLabel}>Cast</Text>
                <Text style={styles.creditValue}>{info.cast}</Text>
              </View>
            )}
          </View>
        )}

        {/* Season Selector */}
        {seasons.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Seasons</Text>
            <View style={styles.sectionTitleUnderline} />
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.seasonRow}
          >
            {seasons.map((season) => (
              <TouchableOpacity
                key={season.season_number}
                style={[
                  styles.seasonButton,
                  selectedSeason === season.season_number && styles.seasonButtonActive,
                ]}
                onPress={() => setSelectedSeason(season.season_number)}
              >
                <Text
                  style={[
                    styles.seasonButtonText,
                    selectedSeason === season.season_number && styles.seasonButtonTextActive,
                  ]}
                >
                  Season {season.season_number}
                </Text>
                <Text
                  style={[
                    styles.seasonEpisodeCount,
                    selectedSeason === season.season_number && styles.seasonEpisodeCountActive,
                  ]}
                >
                  {season.episode_count} episodes
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        )}

        {/* Episodes List */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>
              Episodes ({currentSeasonEpisodes.length})
            </Text>
            <View style={styles.sectionTitleUnderline} />
          </View>
          
          {currentSeasonEpisodes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📺</Text>
              <Text style={styles.emptyStateText}>No episodes available</Text>
            </View>
          ) : (
            <ScrollView 
              ref={episodesScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.episodesRow}
            >
              {currentSeasonEpisodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  posterUrl={posterUrl}
                  onPress={() => handleEpisodePlay(episode)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom Spacer */}
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
  
  // Loading States
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
  errorText: {
    color: colors.semantic.error,
    fontSize: typography.size.lg,
    marginBottom: spacing.lg,
    fontWeight: '600' as const,
  },
  retryButton: {
    backgroundColor: colors.primary.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontSize: typography.size.base,
    fontWeight: '600' as const,
  },

  // Backdrop
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenWidth * 0.5,
  },
  backdropGradient: {
    flex: 1,
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

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: isMobile ? screenWidth * 0.4 : screenWidth * 0.25,
  },

  // Hero Section
  heroSection: {
    flexDirection: isMobile ? 'column' : 'row',
    paddingHorizontal: isMobile ? spacing.lg : spacing.giant,
    gap: isMobile ? spacing.lg : spacing.xxl,
    marginBottom: isMobile ? spacing.lg : spacing.xxl,
    alignItems: isMobile ? 'center' : 'flex-start',
  },
  
  // Poster
  posterContainer: {
    width: isMobile ? 140 : 180,
    aspectRatio: 2 / 3,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.primary.darkGray,
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.1),
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.mediumGray,
  },
  posterPlaceholderText: {
    fontSize: 48,
    opacity: 0.3,
  },

  // Info Container
  infoContainer: {
    flex: isMobile ? undefined : 1,
    justifyContent: 'center',
    paddingVertical: isMobile ? 0 : spacing.lg,
    alignItems: isMobile ? 'center' : 'flex-start',
    width: isMobile ? '100%' : undefined,
  },
  
  // Title
  title: {
    fontSize: isMobile ? typography.size.xl : typography.size.xxxl,
    fontWeight: '700' as const,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
    textAlign: isMobile ? 'center' : 'left',
  },

  // Meta Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: isMobile ? 'center' : 'flex-start',
  },
  metaText: {
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    color: colors.neutral.gray200,
    fontWeight: '500' as const,
  },
  metaDot: {
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    color: colors.neutral.gray400,
  },
  ratingBadge: {
    backgroundColor: rgba(colors.secondary.gold, 0.15),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    fontSize: typography.size.xs,
    color: colors.secondary.gold,
    fontWeight: '600' as const,
  },

  // Genres
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: isMobile ? spacing.md : spacing.lg,
    justifyContent: isMobile ? 'center' : 'flex-start',
  },
  genreTag: {
    backgroundColor: rgba(colors.neutral.white, 0.08),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  genreText: {
    fontSize: typography.size.xs,
    color: colors.neutral.gray100,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: isMobile ? 'center' : 'flex-start',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.accent,
    paddingVertical: isMobile ? spacing.sm : spacing.md,
    paddingHorizontal: isMobile ? spacing.lg : spacing.xl,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  playButtonIcon: {
    fontSize: isMobile ? typography.size.sm : typography.size.base,
    color: colors.neutral.white,
  },
  playButtonText: {
    fontSize: isMobile ? typography.size.sm : typography.size.base,
    color: colors.neutral.white,
    fontWeight: '600' as const,
  },
  iconButton: {
    width: isMobile ? 40 : 48,
    height: isMobile ? 40 : 48,
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
    paddingHorizontal: isMobile ? spacing.lg : spacing.giant,
    marginBottom: isMobile ? spacing.lg : spacing.xl,
  },
  sectionTitleContainer: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: '600' as const,
    color: colors.neutral.white,
    letterSpacing: typography.letterSpacing.caps,
    textTransform: 'uppercase',
    paddingBottom: spacing.xs,
  },
  sectionTitleUnderline: {
    height: 2,
    backgroundColor: colors.primary.accent,
    borderRadius: 1,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: isMobile ? typography.size.sm : typography.size.md,
    color: colors.neutral.gray100,
    lineHeight: isMobile ? typography.size.sm * 1.7 : typography.size.md * 1.7,
    fontWeight: '400' as const,
  },

  // Credits
  creditItem: {
    marginBottom: isMobile ? spacing.md : spacing.lg,
  },
  creditLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral.gray400,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  creditValue: {
    fontSize: isMobile ? typography.size.sm : typography.size.md,
    color: colors.neutral.gray100,
    lineHeight: isMobile ? typography.size.sm * 1.6 : typography.size.md * 1.6,
    fontWeight: '400' as const,
  },

  // Season Selector
  seasonRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  seasonButton: {
    backgroundColor: rgba(colors.neutral.white, 0.04),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.08),
    minWidth: 100,
  },
  seasonButtonActive: {
    backgroundColor: rgba(colors.primary.accent, 0.12),
    borderColor: colors.primary.accent,
  },
  seasonButtonText: {
    fontSize: typography.size.sm,
    fontWeight: '500' as const,
    color: colors.neutral.gray300,
    marginBottom: 2,
  },
  seasonButtonTextActive: {
    color: colors.neutral.white,
  },
  seasonEpisodeCount: {
    fontSize: typography.size.xs,
    color: colors.neutral.gray500,
    fontWeight: '400' as const,
  },
  seasonEpisodeCountActive: {
    color: colors.primary.accent,
  },

  // Episodes
  episodesRow: {
    gap: isMobile ? spacing.sm : spacing.md,
  },
  episodeCard: {
    width: isMobile ? 220 : 280,
    backgroundColor: rgba(colors.neutral.white, 0.04),
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.08),
  },
  episodeThumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: colors.primary.darkGray,
  },
  episodeImage: {
    width: '100%',
    height: '100%',
  },
  episodePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.mediumGray,
  },
  episodePlaceholderText: {
    fontSize: 32,
    opacity: 0.3,
    color: colors.neutral.white,
  },
  episodeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  episodeNumberBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  episodeNumberText: {
    fontSize: typography.size.xs,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  episodeHoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.background, 0.5),
  },
  episodePlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: rgba(colors.primary.accent, 0.9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodePlayIcon: {
    fontSize: 20,
    color: colors.neutral.white,
    marginLeft: 3,
  },
  episodeInfo: {
    padding: isMobile ? spacing.sm : spacing.md,
  },
  episodeTitle: {
    fontSize: isMobile ? typography.size.sm : typography.size.base,
    fontWeight: '500' as const,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  episodeDuration: {
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    color: colors.neutral.gray300,
    fontWeight: '400' as const,
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
    fontSize: typography.size.md,
    color: colors.neutral.gray400,
    fontWeight: '400' as const,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: isMobile ? spacing.xl : spacing.giant,
  },
});
