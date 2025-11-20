import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { iptvService } from '../src/services/iptv.service';
import { SeriesInfo, Season, Episode } from '../src/types/iptv.types';

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

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#64ffda" />
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

  const renderEpisode = ({ item }: { item: Episode }) => {
    const episodeImage = item.info.movie_image || posterUrl;
    
    return (
      <TouchableOpacity
        style={styles.episodeCard}
        onPress={() => handleEpisodePlay(item)}
        activeOpacity={0.8}
      >
        <View style={styles.episodeThumbnail}>
          {episodeImage ? (
            <Image
              source={{ uri: episodeImage }}
              style={styles.episodeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.episodeImage, styles.episodePlaceholder]}>
              <Text style={styles.episodePlaceholderText}>▶️</Text>
            </View>
          )}
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
            <Text style={styles.episodePlot} numberOfLines={2}>
              {item.info.plot}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Series Details</Text>
        <TouchableOpacity
          style={[styles.favoriteHeaderButton, isFav && styles.favoriteHeaderButtonActive]}
          onPress={() => toggleFavorite(seriesId)}
        >
          <Text style={styles.favoriteHeaderIcon}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Series Info Section */}
        <View style={styles.seriesSection}>
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

          <View style={styles.seriesInfo}>
            <Text style={styles.seriesTitle}>{info.name || params.name}</Text>
            
            <View style={styles.metaRow}>
              {info.releaseDate && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>📅</Text>
                  <Text style={styles.metaValue}>{info.releaseDate}</Text>
                </View>
              )}
              {info.rating && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>⭐</Text>
                  <Text style={styles.metaValue}>{info.rating}</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>🎬</Text>
                <Text style={styles.metaValue}>{seriesInfo.seasons.length} Seasons</Text>
              </View>
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

            {info.plot && (
              <Text style={styles.description} numberOfLines={4}>
                {info.plot}
              </Text>
            )}

            {(info.director || info.cast) && (
              <View style={styles.credits}>
                {info.director && (
                  <Text style={styles.creditText}>
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
          <Text style={styles.sectionTitle}>
            Episodes ({currentSeasonEpisodes.length})
          </Text>
          {currentSeasonEpisodes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📺</Text>
              <Text style={styles.emptyStateText}>No episodes available</Text>
            </View>
          ) : (
            <FlatList
              data={currentSeasonEpisodes}
              renderItem={renderEpisode}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.episodesList}
            />
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
  favoriteHeaderButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(23, 42, 69, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.6)',
  },
  favoriteHeaderButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: '#ff6b6b',
  },
  favoriteHeaderIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  seriesSection: {
    flexDirection: 'row',
    padding: 24,
    gap: 24,
  },
  posterContainer: {
    width: 180,
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
  seriesInfo: {
    flex: 1,
  },
  seriesTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e6f1ff',
    marginBottom: 12,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 13,
    color: '#ccd6f6',
    fontWeight: '600',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  genreTag: {
    backgroundColor: 'rgba(100, 255, 218, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.3)',
  },
  genreText: {
    color: '#64ffda',
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#ccd6f6',
    lineHeight: 22,
    marginBottom: 12,
  },
  credits: {
    gap: 6,
  },
  creditText: {
    fontSize: 13,
    color: '#ccd6f6',
    lineHeight: 20,
  },
  creditLabel: {
    color: '#64ffda',
    fontWeight: '600',
  },
  seasonSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e6f1ff',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  seasonButton: {
    backgroundColor: 'rgba(23, 42, 69, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.6)',
    minWidth: 140,
  },
  seasonButtonActive: {
    backgroundColor: 'rgba(100, 255, 218, 0.15)',
    borderColor: '#64ffda',
  },
  seasonButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8892b0',
    marginBottom: 4,
  },
  seasonButtonTextActive: {
    color: '#64ffda',
  },
  seasonEpisodeCount: {
    fontSize: 12,
    color: '#8892b0',
  },
  seasonEpisodeCountActive: {
    color: '#64ffda',
  },
  episodesSection: {
    paddingHorizontal: 24,
  },
  episodesList: {
    gap: 16,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(23, 42, 69, 0.4)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.5)',
  },
  episodeThumbnail: {
    width: 160,
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  episodeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a192f',
  },
  episodePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 42, 69, 0.5)',
  },
  episodePlaceholderText: {
    fontSize: 32,
    opacity: 0.3,
  },
  episodeNumber: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(10, 14, 39, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  episodeNumberText: {
    color: '#64ffda',
    fontSize: 11,
    fontWeight: '700',
  },
  episodeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e6f1ff',
    marginBottom: 6,
    lineHeight: 20,
  },
  episodeDuration: {
    fontSize: 12,
    color: '#8892b0',
    marginBottom: 6,
  },
  episodePlot: {
    fontSize: 12,
    color: '#ccd6f6',
    lineHeight: 18,
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
});
