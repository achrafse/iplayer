import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { useWatchHistory } from '../src/contexts/WatchHistoryContext';
import { iptvService } from '../src/services/iptv.service';
import { LiveCategory, LiveStream, VODCategory, VODStream, SeriesCategory } from '../src/types/iptv.types';
import { ModernHeader } from '../src/components/ModernHeader';
import { ModernTabs } from '../src/components/ModernTabs';
import { CategoryFilter } from '../src/components/CategoryFilter';
import { EnhancedHeroBanner } from '../src/components/EnhancedHeroBanner';
import { ContentRow } from '../src/components/ContentRow';
import { colors, spacing } from '../src/constants/theme';

type ContentType = 'live' | 'movies' | 'series';

export default function HomeScreenModern() {
  const router = useRouter();
  const { logout, authData, isAuthenticated } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { history } = useWatchHistory();
  
  const [contentType, setContentType] = useState<ContentType>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Live TV
  const [liveCategories, setLiveCategories] = useState<LiveCategory[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [selectedLiveCategory, setSelectedLiveCategory] = useState<string | null>(null);
  
  // Movies
  const [vodCategories, setVodCategories] = useState<VODCategory[]>([]);
  const [vodStreams, setVodStreams] = useState<VODStream[]>([]);
  const [selectedVodCategory, setSelectedVodCategory] = useState<string | null>(null);
  
  // Series
  const [seriesCategories, setSeriesCategories] = useState<SeriesCategory[]>([]);
  const [seriesStreams, setSeriesStreams] = useState<any[]>([]);
  const [selectedSeriesCategory, setSelectedSeriesCategory] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Cache flags to prevent refetching on tab switch
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [moviesLoaded, setMoviesLoaded] = useState(false);
  const [seriesLoaded, setSeriesLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadContent();
    }
  }, [contentType, isAuthenticated]);

  const loadContent = async () => {
    // Skip if already loaded for this content type
    if (contentType === 'live' && liveLoaded) return;
    if (contentType === 'movies' && moviesLoaded) return;
    if (contentType === 'series' && seriesLoaded) return;
    
    setIsLoading(true);
    try {
      if (contentType === 'live') {
        await loadLiveContent();
        setLiveLoaded(true);
      } else if (contentType === 'movies') {
        await loadMovieContent();
        setMoviesLoaded(true);
      } else {
        await loadSeriesContent();
        setSeriesLoaded(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveContent = async () => {
    try {
      // Fetch categories and streams in parallel
      const [categories, streams] = await Promise.all([
        iptvService.getLiveCategories(),
        iptvService.getLiveStreams()
      ]);
      setLiveCategories(categories);
      // Limit initial load for better performance
      setLiveStreams(streams.slice(0, 150));
    } catch (error) {
      console.error('Error loading live content:', error);
      Alert.alert('Error', 'Failed to load live TV content');
    }
  };

  const loadMovieContent = async () => {
    try {
      // Fetch categories and streams in parallel
      const [categories, streams] = await Promise.all([
        iptvService.getVODCategories(),
        iptvService.getVODStreams()
      ]);
      setVodCategories(categories);
      // Limit initial load for better performance
      setVodStreams(streams.slice(0, 150));
    } catch (error) {
      console.error('Error loading movies:', error);
      Alert.alert('Error', 'Failed to load movies');
    }
  };

  const loadSeriesContent = async () => {
    try {
      // Fetch categories and streams in parallel
      const [categories, streams] = await Promise.all([
        iptvService.getSeriesCategories(),
        iptvService.getSeries()
      ]);
      setSeriesCategories(categories);
      // Limit initial load for better performance
      setSeriesStreams(streams.slice(0, 150));
    } catch (error) {
      console.error('Error loading series:', error);
      Alert.alert('Error', 'Failed to load series');
    }
  };

  const handleCategoryChange = async (categoryId: string | null) => {
    if (contentType === 'live') {
      setSelectedLiveCategory(categoryId);
      const streams = await iptvService.getLiveStreams(categoryId || undefined);
      setLiveStreams(streams);
    } else if (contentType === 'movies') {
      setSelectedVodCategory(categoryId);
      const streams = await iptvService.getVODStreams(categoryId || undefined);
      setVodStreams(streams);
    } else {
      setSelectedSeriesCategory(categoryId);
      const streams = await iptvService.getSeries(categoryId || undefined);
      setSeriesStreams(streams);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout().then(() => {
            router.replace('/login');
          });
        },
      },
    ]);
  };

  const handleItemPress = (item: any) => {
    if (!item) return;
    
    if (contentType === 'live') {
      if (!item.stream_id) return;
      router.push({
        pathname: '/channel-details',
        params: {
          streamId: item.stream_id.toString(),
          name: item.name || 'Unknown',
          logo: item.stream_icon || '',
          categoryId: item.category_id || '',
        },
      });
    } else if (contentType === 'movies') {
      if (!item.stream_id) return;
      router.push({
        pathname: '/movie-details',
        params: {
          streamId: item.stream_id.toString(),
          name: item.name || 'Unknown',
          poster: item.stream_icon || '',
        },
      });
    } else {
      if (!item.series_id) return;
      router.push({
        pathname: '/series-details',
        params: {
          seriesId: item.series_id.toString(),
          name: item.name || 'Unknown',
          poster: item.cover || item.stream_icon || '',
        },
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  // Get current data
  const getCurrentStreams = () => {
    let streams: any[] = [];
    if (contentType === 'live') {
      streams = liveStreams;
    } else if (contentType === 'movies') {
      streams = vodStreams;
    } else {
      streams = seriesStreams;
    }
    
    // Apply filters
    if (searchQuery) {
      streams = streams.filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (showFavoritesOnly) {
      streams = streams.filter(item => 
        isFavorite(item.stream_id || item.series_id)
      );
    }
    
    return streams;
  };

  const getCurrentCategories = () => {
    if (contentType === 'live') return liveCategories;
    if (contentType === 'movies') return vodCategories;
    return seriesCategories;
  };

  const getSelectedCategory = () => {
    if (contentType === 'live') return selectedLiveCategory;
    if (contentType === 'movies') return selectedVodCategory;
    return selectedSeriesCategory;
  };

  const currentStreams = getCurrentStreams();
  const featuredItem = currentStreams[0];

  // Group streams by category for rows
  const getCategoryRows = () => {
    const categories = getCurrentCategories();
    return categories.slice(0, 6).map(cat => ({
      category: cat,
      items: currentStreams
        .filter(item => item.category_id === cat.category_id)
        .slice(0, 10),
    })).filter(row => row.items.length > 0);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header & Navigation Overlay */}
      <View style={styles.headerOverlay}>
        <ModernHeader
          username={authData?.user_info.username}
          onLogout={handleLogout}
          onSearch={setSearchQuery}
        />
        
        <ModernTabs activeTab={contentType} onTabChange={setContentType} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.accent}
          />
        }
      >
        {/* Hero Banner */}
        {featuredItem && !searchQuery && (
          <EnhancedHeroBanner
            title={featuredItem.name}
            description={featuredItem.plot || featuredItem.description}
            imageUrl={featuredItem.cover_big || featuredItem.stream_icon}
            rating={featuredItem.rating}
            genre={featuredItem.genre}
            onPlayPress={() => handleItemPress(featuredItem)}
            onInfoPress={() => handleItemPress(featuredItem)}
            isFavorite={isFavorite(featuredItem.stream_id || featuredItem.series_id)}
            onFavoritePress={() => toggleFavorite(featuredItem.stream_id || featuredItem.series_id)}
          />
        )}

        {/* Category Filter - Positioned below hero or sticky */}
        <View style={styles.filterContainer}>
          <CategoryFilter
            categories={getCurrentCategories()}
            selectedCategory={getSelectedCategory()}
            onCategorySelect={handleCategoryChange}
            showFavoritesFilter
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />
        </View>

        {/* Content Rows */}
        <View style={styles.contentContainer}>
          {/* Continue Watching */}
          {history.length > 0 && (
            <ContentRow
              title="Continue Watching"
              items={history.slice(0, 10).map(h => ({
                id: h.id,
                name: h.title,
                imageUrl: h.poster || h.logo,
              }))}
              type={contentType === 'movies' ? 'movie' : contentType as 'live' | 'movie' | 'series'}
              favorites={new Set(favorites)}
              onItemPress={(item) => {
                const historyItem = history.find(h => h.id === item.id);
                if (historyItem) {
                  router.push({
                    pathname: '/player',
                    params: {
                      url: historyItem.streamUrl,
                      title: historyItem.title,
                      type: historyItem.type,
                      streamId: historyItem.id,
                    },
                  });
                }
              }}
              onFavoritePress={(id) => toggleFavorite(Number(id))}
            />
          )}

          {/* Category Rows */}
          {getCategoryRows().map((row) => (
            <ContentRow
              key={row.category.category_id}
              title={row.category.category_name}
              items={row.items.map(item => ({
                ...item,
                id: item.stream_id || item.series_id,
                name: item.name,
                imageUrl: contentType === 'live' ? item.stream_icon : 
                         (item.cover_big || item.cover || item.stream_icon),
                rating: item.rating,
              }))}
              type={contentType === 'movies' ? 'movie' : contentType as 'live' | 'movie' | 'series'}
              favorites={new Set(favorites)}
              onItemPress={handleItemPress}
              onFavoritePress={(id) => toggleFavorite(Number(id))}
              onSeeAll={() => handleCategoryChange(row.category.category_id)}
            />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background, // Premium dark background #121212
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.background, // Premium dark background #121212
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    marginTop: -spacing.xxl, // Overlap with hero gradient
    marginBottom: spacing.xl,
    zIndex: 10,
  },
  contentContainer: {
    paddingBottom: spacing.giant,
    gap: spacing.xxl,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});
