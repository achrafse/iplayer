import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { useWatchHistory } from '../src/contexts/WatchHistoryContext';
import { iptvService } from '../src/services/iptv.service';
import { LiveCategory, LiveStream, VODCategory, VODStream, SeriesCategory, EPGListing } from '../src/types/iptv.types';
import { EPGService } from '../src/services/epg.service';
import { EPGDisplay } from '../src/components/EPGDisplay';

type ContentType = 'live' | 'movies' | 'series';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, authData, isAuthenticated } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { history } = useWatchHistory();
  
  // Content type state
  const [contentType, setContentType] = useState<ContentType>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Live TV
  const [liveCategories, setLiveCategories] = useState<LiveCategory[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [selectedLiveCategory, setSelectedLiveCategory] = useState<string | null>(null);
  
  // Movies (VOD)
  const [vodCategories, setVodCategories] = useState<VODCategory[]>([]);
  const [vodStreams, setVodStreams] = useState<VODStream[]>([]);
  const [selectedVodCategory, setSelectedVodCategory] = useState<string | null>(null);
  
  // Series
  const [seriesCategories, setSeriesCategories] = useState<SeriesCategory[]>([]);
  const [seriesStreams, setSeriesStreams] = useState<any[]>([]);
  const [selectedSeriesCategory, setSelectedSeriesCategory] = useState<string | null>(null);
  
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingStreams, setIsLoadingStreams] = useState(false);

  useEffect(() => {
    // Only load data if authenticated
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [contentType, isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoadingCategories(true);
    try {
      if (contentType === 'live') {
        await loadLiveCategories();
      } else if (contentType === 'movies') {
        await loadVodCategories();
      } else if (contentType === 'series') {
        await loadSeriesCategories();
      }
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadLiveCategories = async () => {
    try {
      const data = await iptvService.getLiveCategories();
      setLiveCategories(data);
      if (data.length > 0) {
        loadLiveStreams();
      }
    } catch (error) {
      console.error('Error loading live categories:', error);
      Alert.alert('Error', 'Failed to load live TV categories');
    }
  };

  const loadLiveStreams = async (categoryId?: string) => {
    try {
      setIsLoadingStreams(true);
      const data = await iptvService.getLiveStreams(categoryId);
      setLiveStreams(data);
      setSelectedLiveCategory(categoryId || null);
    } catch (error) {
      console.error('Error loading live streams:', error);
      Alert.alert('Error', 'Failed to load channels');
    } finally {
      setIsLoadingStreams(false);
    }
  };

  const loadVodCategories = async () => {
    try {
      const data = await iptvService.getVODCategories();
      setVodCategories(data);
      if (data.length > 0) {
        loadVodStreams();
      }
    } catch (error) {
      console.error('Error loading VOD categories:', error);
      Alert.alert('Error', 'Failed to load movie categories');
    }
  };

  const loadVodStreams = async (categoryId?: string) => {
    try {
      setIsLoadingStreams(true);
      const data = await iptvService.getVODStreams(categoryId);
      setVodStreams(data);
      setSelectedVodCategory(categoryId || null);
    } catch (error) {
      console.error('Error loading VOD streams:', error);
      Alert.alert('Error', 'Failed to load movies');
    } finally {
      setIsLoadingStreams(false);
    }
  };

  const loadSeriesCategories = async () => {
    try {
      const data = await iptvService.getSeriesCategories();
      setSeriesCategories(data);
      if (data.length > 0) {
        loadSeriesStreams();
      }
    } catch (error) {
      console.error('Error loading series categories:', error);
      Alert.alert('Error', 'Failed to load series categories');
    }
  };

  const loadSeriesStreams = async (categoryId?: string) => {
    try {
      setIsLoadingStreams(true);
      const data = await iptvService.getSeries(categoryId);
      setSeriesStreams(data);
      setSelectedSeriesCategory(categoryId || null);
    } catch (error) {
      console.error('Error loading series:', error);
      Alert.alert('Error', 'Failed to load series');
    } finally {
      setIsLoadingStreams(false);
    }
  };

  const handleLiveStreamPress = (stream: LiveStream) => {
    router.push({
      pathname: '/channel-details',
      params: {
        streamId: stream.stream_id.toString(),
        name: stream.name,
        logo: stream.stream_icon,
        categoryId: stream.category_id,
      },
    });
  };

  const handleVodStreamPress = (stream: VODStream) => {
    router.push({
      pathname: '/movie-details',
      params: {
        streamId: stream.stream_id.toString(),
        name: stream.name,
        poster: stream.stream_icon,
      },
    });
  };

  const handleSeriesPress = (series: any) => {
    if (!series.series_id) {
      console.error('Series missing series_id:', series);
      Alert.alert('Error', 'Cannot open series details');
      return;
    }
    
    router.push({
      pathname: '/series-details',
      params: {
        seriesId: series.series_id.toString(),
        name: series.name || 'Unknown',
        poster: series.cover || series.stream_icon || '',
      },
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getCurrentCategories = () => {
    if (contentType === 'live') return liveCategories;
    if (contentType === 'movies') return vodCategories;
    return seriesCategories;
  };

  const getCurrentStreams = () => {
    if (contentType === 'live') return liveStreams;
    if (contentType === 'movies') return vodStreams;
    return seriesStreams;
  };

  const getSelectedCategory = () => {
    if (contentType === 'live') return selectedLiveCategory;
    if (contentType === 'movies') return selectedVodCategory;
    return selectedSeriesCategory;
  };

  const handleCategoryPress = (categoryId: string) => {
    if (contentType === 'live') {
      loadLiveStreams(categoryId);
    } else if (contentType === 'movies') {
      loadVodStreams(categoryId);
    } else {
      loadSeriesStreams(categoryId);
    }
  };

  const handleItemPress = (item: any) => {
    if (contentType === 'live') {
      handleLiveStreamPress(item);
    } else if (contentType === 'movies') {
      handleVodStreamPress(item);
    } else {
      handleSeriesPress(item);
    }
  };

  const renderCategory = ({ item }: { item: any }) => {
    const isSelected = getSelectedCategory() === item.category_id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonActive,
        ]}
        onPress={() => handleCategoryPress(item.category_id)}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextActive,
          ]}
          numberOfLines={1}
        >
          {item.category_name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStream = ({ item }: { item: any }) => {
    // For live TV: use stream_icon (logo), for movies/series: use cover images
    const imageUrl = contentType === 'live' 
      ? item.stream_icon 
      : (item.cover_big || item.cover || item.stream_icon);
    const title = item.name || item.title;
    const isLiveTV = contentType === 'live';
    const itemId = item.stream_id || item.num;
    const isFav = isFavorite(itemId);
    
    return (
      <TouchableOpacity 
        style={styles.streamCard} 
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={isLiveTV ? styles.logoContainer : styles.posterContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={isLiveTV ? styles.logoImage : styles.posterImage}
              resizeMode={isLiveTV ? 'contain' : 'cover'}
            />
          ) : (
            <View style={[isLiveTV ? styles.logoImage : styles.posterImage, styles.posterPlaceholder]}>
              <Text style={styles.placeholderIcon}>
                {contentType === 'live' ? '📺' : contentType === 'movies' ? '🎬' : '📺'}
              </Text>
            </View>
          )}
          {/* Favorite button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(itemId);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.favoriteIcon}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          {/* Bottom gradient - only for movies/series */}
          {!isLiveTV && <View style={styles.posterGradient} />}
          {/* Rating badge - only for movies/series */}
          {!isLiveTV && item.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {item.rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.posterInfo}>
          <Text style={styles.posterTitle} numberOfLines={2}>
            {title}
          </Text>
          {/* Show EPG for live TV */}
          {isLiveTV && item.stream_id && (
            <EPGDisplay streamId={item.stream_id} compact />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoadingCategories) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#64ffda" />
        <Text style={styles.loadingText}>Loading {contentType}...</Text>
      </View>
    );
  }

  const currentCategories = getCurrentCategories();
  const currentStreams = getCurrentStreams();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>iPlayer</Text>
          {authData && (
            <Text style={styles.headerSubtitle}>
              Welcome, {authData.user_info.username}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Content Type Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, contentType === 'live' && styles.tabActive]}
          onPress={() => setContentType('live')}
        >
          <Text style={[styles.tabText, contentType === 'live' && styles.tabTextActive]}>
            📺 Live TV
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, contentType === 'movies' && styles.tabActive]}
          onPress={() => setContentType('movies')}
        >
          <Text style={[styles.tabText, contentType === 'movies' && styles.tabTextActive]}>
            🎬 Movies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, contentType === 'series' && styles.tabActive]}
          onPress={() => setContentType('series')}
        >
          <Text style={[styles.tabText, contentType === 'series' && styles.tabTextActive]}>
            📺 Series
          </Text>
        </TouchableOpacity>
      </View>

      {/* Continue Watching Section */}
      {history.length > 0 && (
        <View style={styles.continueWatchingContainer}>
          <Text style={styles.sectionTitle}>Continue Watching</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {history.slice(0, 10).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.continueWatchingCard}
                onPress={() => {
                  router.push({
                    pathname: '/player',
                    params: {
                      url: item.streamUrl,
                      title: item.title,
                      type: item.type,
                      streamId: item.id,
                    },
                  });
                }}
              >
                <View style={styles.continueWatchingPoster}>
                  {item.poster || item.logo ? (
                    <Image
                      source={{ uri: item.poster || item.logo }}
                      style={styles.continueWatchingImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.continueWatchingImage, styles.posterPlaceholder]}>
                      <Text style={styles.placeholderIcon}>▶️</Text>
                    </View>
                  )}
                  {/* Progress bar */}
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${(item.position / item.duration) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.continueWatchingTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${contentType}...`}
          placeholderTextColor="#8892b0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      {currentCategories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            data={[{ category_id: '', category_name: 'All', parent_id: 0 }, ...currentCategories]}
            renderItem={renderCategory}
            keyExtractor={(item) => item.category_id || 'all'}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}

      {/* Favorites Toggle */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Text style={[styles.filterButtonText, showFavoritesOnly && styles.filterButtonTextActive]}>
            {showFavoritesOnly ? '❤️ Favorites' : '🤍 Show Favorites'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Streams */}
      {isLoadingStreams ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#64ffda" />
        </View>
      ) : currentStreams.filter(item => {
            const itemId = item.stream_id || item.num;
            // Apply search filter
            if (searchQuery) {
              const title = (item.name || item.title || '').toLowerCase();
              if (!title.includes(searchQuery.toLowerCase())) return false;
            }
            // Apply favorites filter
            if (showFavoritesOnly && !isFavorite(itemId)) return false;
            return true;
          }).length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateText}>No content found</Text>
          <Text style={styles.emptyStateHint}>
            {searchQuery ? 'Try a different search term' : showFavoritesOnly ? 'No favorites yet' : 'No items in this category'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentStreams.filter(item => {
            const itemId = item.stream_id || item.num;
            // Apply search filter
            if (searchQuery) {
              const title = (item.name || item.title || '').toLowerCase();
              if (!title.includes(searchQuery.toLowerCase())) return false;
            }
            // Apply favorites filter
            if (showFavoritesOnly && !isFavorite(itemId)) return false;
            return true;
          })}
          renderItem={renderStream}
          keyExtractor={(item) => item.stream_id?.toString() || item.series_id?.toString() || Math.random().toString()}
          numColumns={5}
          contentContainerStyle={styles.streamsList}
          columnWrapperStyle={styles.streamsRow}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
  },
  loadingText: {
    color: '#8892b0',
    marginTop: 20,
    fontSize: 17,
    letterSpacing: 0.5,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyStateText: {
    color: '#ccd6f6',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  emptyStateHint: {
    color: '#8892b0',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 52,
    backgroundColor: '#0a0e27',
  },
  headerTitle: {
    color: '#e6f1ff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  logoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(23, 42, 69, 0.6)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(100, 255, 218, 0.3)',
  },
  logoutText: {
    color: '#64ffda',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 0,
    backgroundColor: '#0a0e27',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(23, 42, 69, 0.4)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.5)',
  },
  tabActive: {
    backgroundColor: '#64ffda',
    borderColor: '#64ffda',
    shadowColor: '#64ffda',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tabText: {
    color: '#8892b0',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  tabTextActive: {
    color: '#0a192f',
  },
  searchContainer: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#0a0e27',
  },
  searchInput: {
    backgroundColor: 'rgba(23, 42, 69, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontSize: 16,
    color: '#ccd6f6',
    borderWidth: 2,
    borderColor: 'rgba(100, 255, 218, 0.2)',
  },
  categoriesContainer: {
    paddingVertical: 8,
    backgroundColor: '#0a0e27',
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: 'rgba(23, 42, 69, 0.5)',
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.6)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(100, 255, 218, 0.15)',
    borderColor: '#64ffda',
    shadowColor: '#64ffda',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    color: '#8892b0',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  categoryTextActive: {
    color: '#64ffda',
    fontWeight: '700',
  },
  streamsList: {
    padding: 20,
    paddingTop: 12,
  },
  streamsRow: {
    justifyContent: 'flex-start',
    gap: 16,
  },
  streamCard: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(23, 42, 69, 0.4)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  posterContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: '#0a192f',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a192f',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(10, 14, 39, 0.7)',
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 42, 69, 0.5)',
  },
  placeholderIcon: {
    fontSize: 64,
    opacity: 0.3,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(10, 14, 39, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.3)',
  },
  ratingText: {
    color: '#64ffda',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  posterInfo: {
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  posterTitle: {
    color: '#e6f1ff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  streamEpg: {
    color: '#8892b0',
    fontSize: 12,
  },
  continueWatchingContainer: {
    paddingVertical: 16,
    paddingLeft: 20,
    backgroundColor: '#0a0e27',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(100, 255, 218, 0.1)',
  },
  sectionTitle: {
    color: '#e6f1ff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  continueWatchingCard: {
    width: 180,
    marginRight: 16,
  },
  continueWatchingPoster: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(23, 42, 69, 0.4)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  continueWatchingImage: {
    width: '100%',
    height: '100%',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(23, 42, 69, 0.8)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#64ffda',
  },
  continueWatchingTitle: {
    color: '#ccd6f6',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 18,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(10, 14, 39, 0.85)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.3)',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0a0e27',
  },
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(23, 42, 69, 0.5)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(35, 53, 84, 0.6)',
    alignSelf: 'flex-start',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: '#ff6b6b',
  },
  filterButtonText: {
    color: '#8892b0',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  filterButtonTextActive: {
    color: '#ff6b6b',
  },
});
