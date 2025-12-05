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
  ImageBackground,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { iptvService } from '../src/services/iptv.service';
import { VODInfo } from '../src/types/iptv.types';
import { Button } from '../src/components/ui/Button';
import { colors, typography, spacing, borderRadius, shadows, rgba } from '../src/constants/theme';
import { 
  scaledFont, 
  scaleSpacing, 
  getScaledRadius, 
  isTV,
  getPosterDimensions,
  getHeroBannerHeight,
  getContainerPadding 
} from '../src/utils/responsive';

const { width } = Dimensions.get('window');

export default function MovieDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    streamId: string;
    name: string;
    poster: string;
  }>();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [movieInfo, setMovieInfo] = useState<VODInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const streamId = parseInt(params.streamId);
  const isFav = isFavorite(streamId);

  useEffect(() => {
    loadMovieDetails();
  }, [params.streamId]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      const info = await iptvService.getVODInfo(streamId);
      setMovieInfo(info);
    } catch (error) {
      console.error('Error loading movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (!movieInfo) return;
    
    const streamUrl = iptvService.getStreamUrl(
      streamId,
      movieInfo.movie_data.container_extension,
      'movie'
    );
    
    router.push({
      pathname: '/player',
      params: {
        url: streamUrl,
        title: params.name,
        type: 'movie',
        streamId: params.streamId,
        poster: params.poster,
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

  const openTrailer = () => {
    if (movieInfo?.info.youtube_trailer) {
      // Open trailer URL
      console.log('Open trailer:', movieInfo.info.youtube_trailer);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading movie details...</Text>
      </View>
    );
  }

  if (!movieInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load movie details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const info = movieInfo.info;
  const posterUrl = info.cover_big || info.movie_image || params.poster;

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
                      <Text style={styles.posterPlaceholderText}>🎬</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.movieTitle}>{info.name || params.name}</Text>
                {info.o_name && info.o_name !== info.name && (
                  <Text style={styles.originalTitle}>{info.o_name}</Text>
                )}

                {/* Stats Row with Action Buttons */}
                <View style={styles.statsAndActionsContainer}>
                  <View style={styles.statsRow}>
                    {info.releasedate && (
                      <View style={styles.statCard}>
                        <Text style={styles.statIcon}>📅</Text>
                        <View>
                          <Text style={styles.statLabel}>Year</Text>
                          <Text style={styles.statValue}>{info.releasedate.split('-')[0]}</Text>
                        </View>
                      </View>
                    )}
                    {info.duration && (
                      <View style={styles.statCard}>
                        <Text style={styles.statIcon}>⏱️</Text>
                        <View>
                          <Text style={styles.statLabel}>Duration</Text>
                          <Text style={styles.statValue}>{info.duration}</Text>
                        </View>
                      </View>
                    )}
                    {info.rating_count_kinopoisk && (
                      <View style={styles.statCard}>
                        <Text style={styles.statIcon}>⭐</Text>
                        <View>
                          <Text style={styles.statLabel}>Rating</Text>
                          <Text style={styles.statValue}>{info.rating_count_kinopoisk}</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.inlineButtonsRow}>
                    <View style={styles.inlineButton}>
                      <Button
                        title="▶ Play"
                        variant="primary"
                        size="sm"
                        onPress={handlePlay}
                        fullWidth
                      />
                    </View>
                    <View style={styles.inlineButton}>
                      <Button
                        title={isFav ? '❤️' : '🤍'}
                        variant={isFav ? 'danger' : 'secondary'}
                        size="sm"
                        onPress={() => toggleFavorite(streamId)}
                        fullWidth
                      />
                    </View>
                    {info.youtube_trailer && (
                      <View style={styles.inlineButton}>
                        <Button
                          title="🎥"
                          variant="secondary"
                          size="sm"
                          onPress={openTrailer}
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
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Description */}
        {(info.description || info.plot) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>
              {info.description || info.plot}
            </Text>
          </View>
        )}

        {/* Cast & Crew */}
        {(info.director || info.actors || info.cast) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast & Crew</Text>
            <View style={styles.creditsCard}>
              {info.director && (
                <View style={styles.creditRow}>
                  <View style={styles.creditLabelContainer}>
                    <Text style={styles.creditIcon}>🎬</Text>
                    <Text style={styles.creditLabel}>Director</Text>
                  </View>
                  <Text style={styles.creditValue}>{info.director}</Text>
                </View>
              )}

              {(info.actors || info.cast) && (
                <View style={styles.creditRow}>
                  <View style={styles.creditLabelContainer}>
                    <Text style={styles.creditIcon}>🎭</Text>
                    <Text style={styles.creditLabel}>Cast</Text>
                  </View>
                  <Text style={styles.creditValue}>
                    {info.actors || info.cast}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.black,
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
  heroInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: scaledFont(typography.size.xxxl + 4),
    fontWeight: '800' as any,
    color: colors.neutral.white,
    marginBottom: scaleSpacing(spacing.md),
    lineHeight: scaledFont(typography.size.xxxl * 1.4),
    letterSpacing: typography.letterSpacing.tight,
  },
  originalTitle: {
    fontSize: scaledFont(typography.size.lg),
    color: colors.neutral.gray200,
    fontStyle: 'italic',
    marginBottom: scaleSpacing(spacing.lg),
    fontWeight: '400' as any,
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
  },
  genreTag: {
    backgroundColor: rgba(colors.primary.accent, 0.18),
    paddingHorizontal: scaleSpacing(spacing.lg),
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

  // Modern minimal icon button style
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: scaleSpacing(spacing.md),
    borderRadius: borderRadius.button, // Minimal 4-6px corners
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSpacing(spacing.sm),
    borderWidth: 2,
    borderColor: rgba(colors.neutral.white, 0.5),
    // No heavy shadows
  },
  iconButtonActive: {
    backgroundColor: rgba(colors.primary.accent, 0.15),
    borderColor: colors.primary.accent,
  },
  iconButtonIcon: {
    fontSize: scaledFont(typography.size.lg),
  },
  iconButtonText: {
    fontSize: scaledFont(typography.size.sm),
    fontWeight: '600' as any,
    color: colors.neutral.white,
    letterSpacing: typography.letterSpacing.wide,
  },
  iconButtonTextActive: {
    color: colors.primary.accent,
  },
  section: {
    padding: getContainerPadding(),
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: scaledFont(typography.size.xxl + 2),
    fontWeight: '800' as any,
    color: colors.neutral.white,
    marginBottom: scaleSpacing(spacing.lg),
    letterSpacing: typography.letterSpacing.wide,
  },
  description: {
    fontSize: scaledFont(typography.size.lg),
    color: colors.neutral.gray100,
    lineHeight: scaledFont(typography.size.xxl + 4),
    fontWeight: '400' as any,
  },
  creditsCard: {
    backgroundColor: rgba(colors.primary.mediumGray, 0.4),
    borderRadius: getScaledRadius(borderRadius.xl),
    padding: scaleSpacing(spacing.xl),
    borderWidth: isTV ? 2 : 1,
    borderColor: rgba(colors.primary.lightGray, 0.2),
    gap: scaleSpacing(spacing.lg),
  },
  creditRow: {
    gap: scaleSpacing(spacing.md),
  },
  creditLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpacing(spacing.sm),
    marginBottom: scaleSpacing(spacing.xs),
  },
  creditIcon: {
    fontSize: scaledFont(typography.size.lg),
  },
  creditLabel: {
    fontSize: scaledFont(typography.size.sm),
    color: colors.primary.accent,
    fontWeight: '700' as any,
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase' as any,
  },
  creditValue: {
    fontSize: scaledFont(typography.size.md),
    color: colors.neutral.gray100,
    lineHeight: scaledFont(typography.size.xl),
    fontWeight: '400' as any,
  },
});
