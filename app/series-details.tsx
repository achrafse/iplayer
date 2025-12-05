import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { iptvService } from '../src/services/iptv.service';
import { SeriesInfo, Season, Episode } from '../src/types/iptv.types';
import { Button } from '../src/components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows, rgba } from '../src/constants/theme';
import { 
  scaledFont, 
  scaleSpacing, 
  getScaledRadius, 
  isTV,
  getPosterDimensions,
  getEpisodeCardWidth,
  getHeroBannerHeight,
  getContainerPadding 
} from '../src/utils/responsive';

export default function SeriesDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    seriesId: string;
    name: string;
    poster: string;
  }>();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [seriesInfo, setSeriesInfo] = useState<SeriesInfo | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const episodesScrollRef = useRef<ScrollView>(null);

  const seriesId = parseInt(params.seriesId);
  const isFav = isFavorite(seriesId);

  useEffect(() => {
    loadSeriesDetails();
  }, [params.seriesId]);

  const loadSeriesDetails = async () => {
    try {
      setLoading(true);
      const info = await iptvService.getSeriesInfo(seriesId);
      setSeriesInfo(info);
      if (info.seasons.length > 0) {
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
      parseInt(episode.id),
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

  const handleScrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition - 340); // Card width + gap
    episodesScrollRef.current?.scrollTo({
      x: newPosition,
      animated: true,
    });
  };

  const handleScrollRight = () => {
    const newPosition = scrollPosition + 340; // Card width + gap
    episodesScrollRef.current?.scrollTo({
      x: newPosition,
      animated: true,
    });
  };

  const handleEpisodesScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;
    
    setScrollPosition(scrollX);
    setCanScrollLeft(scrollX > 10);
    setCanScrollRight(scrollX < contentWidth - layoutWidth - 10);
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
        <ActivityIndicator size="large" color="#E50914" />
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
  const posterUrl = info.cover || params.poster;
  const currentSeasonEpisodes = seriesInfo.episodes[selectedSeason.toString()] || [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Backdrop Hero Section */}
        <ImageBackground
          source={{ uri: posterUrl }}
          style={styles.backdropSection}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'transparent',
              rgba(colors.primary.black, 0.7),
              colors.primary.black,
            ]}
            locations={[0, 0.5, 1]}
            style={styles.backdropGradient}
          >
            {/* Floating Back Button */}
            <View style={styles.floatingButtonContainer}>
              <TouchableOpacity style={styles.floatingBackButton} onPress={handleBack}>
                <Text style={styles.floatingButtonIcon}>←</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroContent}>
              <View style={styles.posterWrapper}>
                <View style={styles.posterContainer}>
                  {posterUrl ? (
                    <Image
                      source={{ uri: posterUrl }}
                      style={styles.poster}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.poster, styles.posterPlaceholder]}>
                      <Text style={styles.posterPlaceholderText}>📺</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.seriesInfo}>
                <Text style={styles.seriesTitle}>{info.name || params.name}</Text>
                
                {/* Stats Row with Action Buttons */}
                <View style={styles.statsAndActionsContainer}>
                  <View style={styles.statsRow}>
                    {info.releaseDate && (
                      <View style={styles.statCard}>
                        <Text style={styles.statIcon}>📅</Text>
                        <View>
                          <Text style={styles.statLabel}>Year</Text>
                          <Text style={styles.statValue}>{info.releaseDate}</Text>
                        </View>
                      </View>
                    )}
                    {info.rating && (
                      <View style={styles.statCard}>
                        <Text style={styles.statIcon}>⭐</Text>
                        <View>
                          <Text style={styles.statLabel}>Rating</Text>
                          <Text style={styles.statValue}>{info.rating}</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.statCard}>
                      <Text style={styles.statIcon}>🎬</Text>
                      <View>
                        <Text style={styles.statLabel}>Seasons</Text>
                        <Text style={styles.statValue}>{seriesInfo.seasons.length}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inlineButtonsRow}>
                    <View style={styles.inlineButton}>
                      <Button
                        title="▶ Play"
                        variant="primary"
                        size="sm"
                        onPress={() => {
                          if (currentSeasonEpisodes.length > 0) {
                            handleEpisodePlay(currentSeasonEpisodes[0]);
                          }
                        }}
                        fullWidth
                      />
                    </View>
                    <View style={styles.inlineButton}>
                      <Button
                        title={isFav ? '❤️' : '🤍'}
                        variant={isFav ? 'danger' : 'secondary'}
                        size="sm"
                        onPress={() => toggleFavorite(seriesId)}
                        fullWidth
                      />
                    </View>
                    {info.youtube_trailer && (
                      <View style={styles.inlineButton}>
                        <Button
                          title="🎥"
                          variant="secondary"
                          size="sm"
                          onPress={() => {
                            console.log('Open trailer:', info.youtube_trailer);
                          }}
                          fullWidth
                        />
                      </View>
                    )}
                  </View>
                </View>

                {info.genre && (
                  <View style={styles.genreContainer}>
                    {info.genre.split(',').slice(0, 4).map((genre, index) => (
                      <View key={index} style={styles.genreTag}>
                        <Text style={styles.genreText}>{genre.trim()}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {info.plot && (
                  <Text style={styles.description} numberOfLines={3}>
                    {info.plot}
                  </Text>
                )}

                {(info.director || info.cast) && (
                  <View style={styles.credits}>
                    {info.director && (
                      <Text style={styles.creditText} numberOfLines={1}>
                        <Text style={styles.creditLabel}>Director: </Text>
                        {info.director}
                      </Text>
                    )}
                    {info.cast && (
                      <Text style={styles.creditText} numberOfLines={2}>
                        <Text style={styles.creditLabel}>Cast: </Text>
                        {info.cast}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Season Selector */}
        <View style={styles.seasonSection}>
          <Text style={styles.sectionTitle}>Seasons</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {seriesInfo.seasons.map((season) => (
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

        {/* Episodes List */}
        <View style={styles.episodesSection}>
          <View style={styles.episodesSectionHeader}>
            <Text style={styles.sectionTitle}>
              Episodes ({currentSeasonEpisodes.length})
            </Text>
            {currentSeasonEpisodes.length > 1 && (
              <View style={styles.sliderControls}>
                <TouchableOpacity 
                  style={[styles.sliderButton, !canScrollLeft && styles.sliderButtonDisabled]}
                  onPress={handleScrollLeft}
                  disabled={!canScrollLeft}
                >
                  <Text style={[styles.sliderButtonText, !canScrollLeft && styles.sliderButtonTextDisabled]}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sliderButton, !canScrollRight && styles.sliderButtonDisabled]}
                  onPress={handleScrollRight}
                  disabled={!canScrollRight}
                >
                  <Text style={[styles.sliderButtonText, !canScrollRight && styles.sliderButtonTextDisabled]}>›</Text>
                </TouchableOpacity>
              </View>
            )}
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
              onScroll={handleEpisodesScroll}
              scrollEventThrottle={16}
              onContentSizeChange={(width) => {
                // Check if content is wider than container to enable right scroll
                if (width > 0) {
                  setCanScrollRight(true);
                }
              }}
            >
              {currentSeasonEpisodes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.episodeCard}
                  onPress={() => handleEpisodePlay(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.episodeThumbnail}>
                    {item.info.movie_image || posterUrl ? (
                      <Image
                        source={{ uri: item.info.movie_image || posterUrl }}
                        style={styles.episodeImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.episodeImage, styles.episodePlaceholder]}>
                        <Text style={styles.episodePlaceholderText}>▶️</Text>
                      </View>
                    )}
                    <View style={styles.playOverlay}>
                      <View style={styles.playButton}>
                        <Text style={styles.playButtonIcon}>▶</Text>
                      </View>
                    </View>
                    <View style={styles.episodeNumber}>
                      <Text style={styles.episodeNumberText}>EP {item.episode_num}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.episodeInfo}>
                    <Text style={styles.episodeTitle} numberOfLines={2}>
                      {item.title || `Episode ${item.episode_num}`}
                    </Text>
                    {item.info.duration && (
                      <Text style={styles.episodeDuration}>⏱️ {item.info.duration}</Text>
                    )}
                    {item.info.plot && (
                      <Text style={styles.episodePlot} numberOfLines={3}>
                        {item.info.plot}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ height: 40 }} />
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
    marginTop: scaleSpacing(spacing.lg),
    fontSize: scaledFont(typography.size.lg),
    fontWeight: '500' as any,
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: scaledFont(typography.size.lg),
    marginBottom: scaleSpacing(spacing.lg),
    fontWeight: '600' as any,
  },
  retryButton: {
    backgroundColor: colors.primary.accent,
    paddingVertical: scaleSpacing(spacing.md),
    paddingHorizontal: scaleSpacing(spacing.xl),
    borderRadius: borderRadius.button, // Minimal corners
    // No heavy shadows
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontSize: scaledFont(typography.size.md),
    fontWeight: '600' as any,
  },
  floatingButtonContainer: {
    position: 'absolute',
    top: scaleSpacing(spacing.xl + spacing.lg),
    right: scaleSpacing(spacing.xl),
    zIndex: 10,
  },
  floatingBackButton: {
    width: isTV ? 56 : 44,
    height: isTV ? 56 : 44,
    borderRadius: isTV ? 28 : 22,
    backgroundColor: rgba(colors.primary.background, 0.9),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: rgba(colors.neutral.white, 0.3),
    // No heavy shadows
  },
  floatingButtonIcon: {
    fontSize: scaledFont(typography.size.xl),
    color: colors.neutral.white,
    fontWeight: '600' as any,
  },
  content: {
    flex: 1,
  },

  backdropSection: {
    width: '100%',
    minHeight: getHeroBannerHeight(),
  },
  backdropGradient: {
    width: '100%',
    minHeight: getHeroBannerHeight(),
    paddingTop: scaleSpacing(spacing.huge + spacing.xxl),
  },
  heroContent: {
    flexDirection: 'row',
    padding: getContainerPadding(),
    paddingTop: scaleSpacing(spacing.xxl),
    gap: scaleSpacing(spacing.xxl),
  },
  posterWrapper: {
    ...shadows.hero,
  },
  posterContainer: {
    width: getPosterDimensions().width,
    aspectRatio: 2 / 3,
    borderRadius: getScaledRadius(borderRadius.xl),
    overflow: 'hidden',
    borderWidth: isTV ? 5 : 3,
    borderColor: rgba(colors.primary.accent, 0.3),
    backgroundColor: colors.primary.darkGray,
  },
  poster: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.darkGray,
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.mediumGray, 0.5),
  },
  posterPlaceholderText: {
    fontSize: scaledFont(typography.size.hero),
    opacity: 0.3,
  },
  seriesInfo: {
    flex: 1,
  },
  seriesTitle: {
    fontSize: scaledFont(typography.size.xxxl + 2),
    fontWeight: '800' as any,
    color: colors.neutral.white,
    marginBottom: scaleSpacing(spacing.lg),
    lineHeight: scaledFont(typography.size.xxxl * 1.4),
    letterSpacing: typography.letterSpacing.tight,
  },
  statsAndActionsContainer: {
    marginBottom: scaleSpacing(spacing.xl),
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleSpacing(spacing.md),
    marginBottom: scaleSpacing(spacing.lg),
  },
  inlineButtonsRow: {
    flexDirection: 'row',
    gap: scaleSpacing(spacing.sm),
    flexWrap: 'wrap',
  },
  inlineButton: {
    minWidth: isTV ? 140 : 90,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.mediumGray, 0.6),
    paddingHorizontal: scaleSpacing(spacing.lg),
    paddingVertical: scaleSpacing(spacing.md),
    borderRadius: getScaledRadius(borderRadius.lg),
    gap: scaleSpacing(spacing.md),
    borderWidth: isTV ? 2 : 1,
    borderColor: rgba(colors.primary.accent, 0.2),
    ...shadows.md,
  },
  statIcon: {
    fontSize: scaledFont(typography.size.xl),
  },
  statLabel: {
    fontSize: scaledFont(typography.size.xs),
    color: colors.neutral.gray200,
    fontWeight: '600' as any,
    textTransform: 'uppercase' as any,
    letterSpacing: typography.letterSpacing.wide,
  },
  statValue: {
    fontSize: scaledFont(typography.size.md),
    color: colors.neutral.white,
    fontWeight: '700' as any,
    letterSpacing: typography.letterSpacing.normal,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleSpacing(spacing.md),
    marginBottom: scaleSpacing(spacing.lg),
  },
  genreTag: {
    backgroundColor: rgba(colors.primary.accent, 0.18),
    paddingHorizontal: scaleSpacing(spacing.md),
    paddingVertical: scaleSpacing(spacing.sm),
    borderRadius: getScaledRadius(borderRadius.md),
    borderWidth: isTV ? 2.5 : 1.5,
    borderColor: rgba(colors.primary.accent, 0.4),
  },
  genreText: {
    color: colors.primary.accent,
    fontSize: scaledFont(typography.size.sm),
    fontWeight: '700' as any,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase' as any,
  },
  description: {
    fontSize: scaledFont(typography.size.md),
    color: colors.neutral.gray100,
    lineHeight: scaledFont(typography.size.xl),
    marginBottom: scaleSpacing(spacing.lg),
    fontWeight: '400' as any,
  },
  credits: {
    gap: scaleSpacing(spacing.sm),
  },
  creditText: {
    fontSize: scaledFont(typography.size.md),
    color: colors.neutral.gray100,
    lineHeight: scaledFont(typography.size.xl),
    fontWeight: '400' as any,
  },
  creditLabel: {
    color: colors.primary.accent,
    fontWeight: '700' as any,
  },
  seasonSection: {
    paddingHorizontal: getContainerPadding(),
    paddingTop: scaleSpacing(spacing.xl),
    paddingBottom: scaleSpacing(spacing.xl),
    backgroundColor: colors.primary.black,
  },
  sectionTitle: {
    fontSize: scaledFont(typography.size.xxl + 2),
    fontWeight: '800' as any,
    color: colors.neutral.white,
    marginBottom: scaleSpacing(spacing.lg),
    letterSpacing: typography.letterSpacing.wide,
  },
  seasonButton: {
    backgroundColor: rgba(colors.primary.mediumGray, 0.5),
    paddingHorizontal: scaleSpacing(spacing.xl),
    paddingVertical: scaleSpacing(spacing.lg),
    borderRadius: getScaledRadius(borderRadius.lg),
    marginRight: scaleSpacing(spacing.md),
    borderWidth: isTV ? 3 : 2,
    borderColor: rgba(colors.primary.lightGray, 0.4),
    minWidth: isTV ? 240 : 160,
    ...shadows.sm,
  },
  seasonButtonActive: {
    backgroundColor: rgba(colors.primary.accent, 0.18),
    borderColor: colors.primary.accent,
    ...shadows.accent,
  },
  seasonButtonText: {
    fontSize: scaledFont(typography.size.lg),
    fontWeight: '700' as any,
    color: colors.neutral.gray200,
    marginBottom: scaleSpacing(spacing.xs),
    letterSpacing: typography.letterSpacing.normal,
  },
  seasonButtonTextActive: {
    color: colors.primary.accent,
    fontWeight: '800' as any,
  },
  seasonEpisodeCount: {
    fontSize: scaledFont(typography.size.sm),
    color: colors.neutral.gray200,
    fontWeight: '500' as any,
  },
  seasonEpisodeCountActive: {
    color: colors.primary.accent,
    fontWeight: '600' as any,
  },
  episodesSection: {
    marginBottom: scaleSpacing(spacing.xl),
  },
  episodesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getContainerPadding(),
    marginBottom: scaleSpacing(spacing.lg),
  },
  sliderControls: {
    flexDirection: 'row',
    gap: scaleSpacing(spacing.sm),
  },
  sliderButton: {
    width: isTV ? 72 : 48,
    height: isTV ? 72 : 48,
    borderRadius: isTV ? 36 : 24,
    backgroundColor: rgba(colors.primary.accent, 0.95),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: rgba(colors.primary.accent, 0.5),
    ...shadows.accent,
  },
  sliderButtonDisabled: {
    backgroundColor: rgba(colors.primary.mediumGray, 0.5),
    borderColor: rgba(colors.primary.lightGray, 0.3),
  },
  sliderButtonText: {
    fontSize: scaledFont(typography.size.xxxl),
    color: colors.primary.black,
    fontWeight: '800' as any,
    marginTop: isTV ? -6 : -4,
  },
  sliderButtonTextDisabled: {
    color: colors.neutral.gray200,
    opacity: 0.5,
  },
  episodesRow: {
    gap: scaleSpacing(spacing.lg),
    paddingHorizontal: getContainerPadding(),
  },
  episodeCard: {
    width: getEpisodeCardWidth(),
    flexDirection: 'column',
    backgroundColor: rgba(colors.primary.mediumGray, 0.5),
    borderRadius: getScaledRadius(borderRadius.xl),
    overflow: 'hidden',
    borderWidth: isTV ? 3 : 2,
    borderColor: rgba(colors.primary.lightGray, 0.3),
    ...shadows.lg,
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
    backgroundColor: colors.primary.darkGray,
  },
  episodePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.mediumGray, 0.5),
  },
  episodePlaceholderText: {
    fontSize: scaledFont(typography.size.xxxl),
    opacity: 0.3,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.black, 0.4),
  },
  playButton: {
    width: isTV ? 84 : 56,
    height: isTV ? 84 : 56,
    borderRadius: isTV ? 42 : 28,
    backgroundColor: rgba(colors.primary.accent, 0.95),
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.accent,
  },
  playButtonIcon: {
    fontSize: scaledFont(typography.size.xl),
    color: colors.primary.black,
    fontWeight: '700' as any,
    marginLeft: isTV ? 6 : 4,
  },
  episodeNumber: {
    position: 'absolute',
    top: scaleSpacing(spacing.md),
    left: scaleSpacing(spacing.md),
    backgroundColor: colors.primary.accent,
    paddingHorizontal: scaleSpacing(spacing.lg),
    paddingVertical: scaleSpacing(spacing.sm),
    borderRadius: getScaledRadius(borderRadius.md),
    ...shadows.accent,
  },
  episodeNumberText: {
    color: colors.primary.black,
    fontSize: scaledFont(typography.size.sm),
    fontWeight: '800' as any,
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase' as any,
  },
  episodeInfo: {
    padding: scaleSpacing(spacing.lg),
    gap: scaleSpacing(spacing.xs),
  },
  episodeTitle: {
    fontSize: scaledFont(typography.size.md),
    fontWeight: '700' as any,
    color: colors.neutral.white,
    marginBottom: scaleSpacing(spacing.xs),
    lineHeight: scaledFont(typography.size.lg),
    letterSpacing: typography.letterSpacing.normal,
  },
  episodeDuration: {
    fontSize: scaledFont(typography.size.sm),
    color: colors.neutral.gray200,
    marginBottom: scaleSpacing(spacing.sm),
    fontWeight: '500' as any,
  },
  episodePlot: {
    fontSize: scaledFont(typography.size.sm),
    color: colors.neutral.gray100,
    lineHeight: scaledFont(typography.size.lg),
    fontWeight: '400' as any,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: scaleSpacing(spacing.huge),
  },
  emptyStateIcon: {
    fontSize: scaledFont(typography.size.hero),
    marginBottom: scaleSpacing(spacing.lg),
    opacity: 0.3,
  },
  emptyStateText: {
    fontSize: scaledFont(typography.size.lg),
    color: colors.neutral.gray200,
    fontWeight: '500' as any,
  },
});
