import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { useAuth } from '../src/contexts/AuthContext';
import { iptvService } from '../src/services/iptv.service';
import { VODInfo } from '../src/types/iptv.types';
import { colors, typography, spacing, borderRadius, rgba } from '../src/constants/theme';
import { getBackdropUrl, sanitizeImageUrl } from '../src/utils/imageUrls';
import { OptimizedImage } from '../src/components/OptimizedImage';
import { isMobile } from '../src/utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

export default function MovieDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    streamId: string;
    name: string;
    poster: string;
  }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [movieInfo, setMovieInfo] = useState<VODInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const streamId = Number.parseInt(params.streamId);
  const isFav = isFavorite(streamId);

  useEffect(() => {
    // Wait for auth to be ready before loading
    if (isAuthenticated && !authLoading) {
      loadMovieDetails();
    }
  }, [params.streamId, isAuthenticated, authLoading]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.accent} />
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
  const posterUrl = sanitizeImageUrl(info.cover_big) || sanitizeImageUrl(info.movie_image) || sanitizeImageUrl(params.poster);
  // Get backdrop URL (parses newline-separated URLs from API)
  const backdropUrl = sanitizeImageUrl(getBackdropUrl(info)) || posterUrl;

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

          {/* Movie Info */}
          <View style={styles.infoContainer}>
            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {info.name || params.name}
            </Text>
            
            {Boolean(info.o_name && info.o_name !== info.name) && (
              <Text style={styles.originalTitle}>{info.o_name}</Text>
            )}

            {/* Meta Row */}
            <View style={styles.metaRow}>
              {Boolean(info.releasedate) && (
                <Text style={styles.metaText}>
                  {info.releasedate.split('-')[0]}
                </Text>
              )}
              {Boolean(info.duration) && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{info.duration}</Text>
                </>
              )}
              {info.rating && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {info.rating}</Text>
                  </View>
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
              <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
                <Text style={styles.playButtonIcon}>▶</Text>
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.iconButton, isFav && styles.iconButtonActive]}
                onPress={() => toggleFavorite(streamId)}
              >
                <Text style={styles.iconButtonText}>{isFav ? '❤️' : '♡'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Description Section */}
        {Boolean(info.description || info.plot) && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.sectionTitleUnderline} />
            </View>
            <Text style={styles.description}>
              {info.description || info.plot}
            </Text>
          </View>
        )}

        {/* Cast & Crew Section */}
        {Boolean(info.director || info.actors || info.cast) && (
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

            {Boolean(info.actors || info.cast) && (
              <View style={styles.creditItem}>
                <Text style={styles.creditLabel}>Cast</Text>
                <Text style={styles.creditValue}>{info.actors || info.cast}</Text>
              </View>
            )}
          </View>
        )}

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
  originalTitle: {
    fontSize: isMobile ? typography.size.sm : typography.size.base,
    color: colors.neutral.gray300,
    fontStyle: 'italic',
    marginBottom: spacing.md,
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

  // Bottom Spacer
  bottomSpacer: {
    height: isMobile ? spacing.xl : spacing.giant,
  },
});
