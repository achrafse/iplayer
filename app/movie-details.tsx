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
import { useFavorites } from '../src/contexts/FavoritesContext';
import { iptvService } from '../src/services/iptv.service';
import { VODInfo } from '../src/types/iptv.types';

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
    router.back();
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
        <ActivityIndicator size="large" color="#64ffda" />
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Movie Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section with Poster */}
        <View style={styles.heroSection}>
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

          <View style={styles.heroInfo}>
            <Text style={styles.movieTitle}>{info.name || params.name}</Text>
            {info.o_name && info.o_name !== info.name && (
              <Text style={styles.originalTitle}>{info.o_name}</Text>
            )}

            <View style={styles.metaRow}>
              {info.releasedate && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>📅</Text>
                  <Text style={styles.metaValue}>{info.releasedate}</Text>
                </View>
              )}
              {info.duration && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>⏱️</Text>
                  <Text style={styles.metaValue}>{info.duration}</Text>
                </View>
              )}
              {info.rating_count_kinopoisk && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>⭐</Text>
                  <Text style={styles.metaValue}>{info.rating_count_kinopoisk}</Text>
                </View>
              )}
            </View>

            {info.genre && (
              <View style={styles.genreContainer}>
                {info.genre.split(',').slice(0, 3).map((genre, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.trim()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
            <Text style={styles.playButtonIcon}>▶</Text>
            <Text style={styles.playButtonText}>Play Movie</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={[styles.iconButton, isFav && styles.iconButtonActive]}
              onPress={() => toggleFavorite(streamId)}
            >
              <Text style={styles.iconButtonIcon}>{isFav ? '❤️' : '🤍'}</Text>
              <Text style={[styles.iconButtonText, isFav && styles.iconButtonTextActive]}>
                {isFav ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>

            {info.youtube_trailer && (
              <TouchableOpacity style={styles.iconButton} onPress={openTrailer}>
                <Text style={styles.iconButtonIcon}>🎥</Text>
                <Text style={styles.iconButtonText}>Trailer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

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
            
            {info.director && (
              <View style={styles.creditRow}>
                <Text style={styles.creditLabel}>Director:</Text>
                <Text style={styles.creditValue}>{info.director}</Text>
              </View>
            )}

            {(info.actors || info.cast) && (
              <View style={styles.creditRow}>
                <Text style={styles.creditLabel}>Cast:</Text>
                <Text style={styles.creditValue}>
                  {info.actors || info.cast}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          {info.country && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Country:</Text>
              <Text style={styles.infoValue}>{info.country}</Text>
            </View>
          )}

          {info.age && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rating:</Text>
              <Text style={styles.infoValue}>{info.age}</Text>
            </View>
          )}

          {info.bitrate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quality:</Text>
              <Text style={styles.infoValue}>{Math.round(info.bitrate / 1000)} Kbps</Text>
            </View>
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
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#64ffda',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#0a192f',
    fontSize: 16,
    fontWeight: '700',
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
  heroSection: {
    flexDirection: 'row',
    padding: 24,
    gap: 24,
  },
  posterContainer: {
    width: 200,
    aspectRatio: 2 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  poster: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a192f',
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 42, 69, 0.5)',
  },
  posterPlaceholderText: {
    fontSize: 64,
    opacity: 0.3,
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e6f1ff',
    marginBottom: 8,
    lineHeight: 36,
  },
  originalTitle: {
    fontSize: 16,
    color: '#8892b0',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 16,
  },
  metaValue: {
    fontSize: 14,
    color: '#ccd6f6',
    fontWeight: '600',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: 'rgba(100, 255, 218, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.3)',
  },
  genreText: {
    color: '#64ffda',
    fontSize: 12,
    fontWeight: '600',
  },
  actionSection: {
    padding: 24,
    paddingTop: 0,
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#64ffda',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  playButtonIcon: {
    fontSize: 24,
    color: '#0a192f',
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0a192f',
    letterSpacing: 0.5,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(23, 42, 69, 0.6)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.6)',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: '#ff6b6b',
  },
  iconButtonIcon: {
    fontSize: 18,
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8892b0',
  },
  iconButtonTextActive: {
    color: '#ff6b6b',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e6f1ff',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: '#ccd6f6',
    lineHeight: 24,
  },
  creditRow: {
    marginBottom: 12,
  },
  creditLabel: {
    fontSize: 14,
    color: '#64ffda',
    fontWeight: '600',
    marginBottom: 4,
  },
  creditValue: {
    fontSize: 14,
    color: '#ccd6f6',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8892b0',
    width: 100,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#ccd6f6',
  },
});
