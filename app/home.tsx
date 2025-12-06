import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { useWatchHistory } from '../src/contexts/WatchHistoryContext';
import { iptvService } from '../src/services/iptv.service';
import { LiveCategory, LiveStream, VODCategory, VODStream, SeriesCategory } from '../src/types/iptv.types';
import { ModernHeader } from '../src/components/ModernHeader';
import { CategoryFilter } from '../src/components/CategoryFilter';
import { EnhancedHeroBanner } from '../src/components/EnhancedHeroBanner';
import { ContentRow } from '../src/components/ContentRow';
import { colors, spacing } from '../src/constants/theme';
import { debounce } from '../src/utils/performance';
import { getHeroImageUrl } from '../src/utils/imageUrls';
import { isMobile } from '../src/utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  
  // Enhanced hero data with backdrop from detailed API
  const [heroData, setHeroData] = useState<{
    imageUrl: string | null;
    plot?: string;
    genre?: string;
    rating?: string;
  } | null>(null);
  
  // Track loaded data for each content type
  const loadedRef = useRef({ live: false, movies: false, series: false });
  const heroFetchedRef = useRef<string | null>(null);
  
  // Full data refs for filtering without refetching
  const fullDataRef = useRef<{
    live: LiveStream[];
    movies: VODStream[];
    series: any[];
  }>({ live: [], movies: [], series: [] });

  // Prefetch other tabs after initial load
  useEffect(() => {
    if (isAuthenticated) {
      // Load current tab immediately
      loadContent();
      
      // Prefetch other tabs after initial render settles
      setTimeout(() => {
        iptvService.prefetchAll();
      }, 1000);
    }
  }, [isAuthenticated]);
  
  // Handle tab changes efficiently
  useEffect(() => {
    // Reset hero data when switching tabs
    setHeroData(null);
    heroFetchedRef.current = null;
    
    if (isAuthenticated && !loadedRef.current[contentType]) {
      loadContent();
    }
  }, [contentType, isAuthenticated]);

  const loadContent = async () => {
    const type = contentType;
    if (loadedRef.current[type] && !refreshing) return;
    
    setIsLoading(true);
    try {
      if (type === 'live') {
        await loadLiveContent();
      } else if (type === 'movies') {
        await loadMovieContent();
      } else {
        await loadSeriesContent();
      }
      loadedRef.current[type] = true;
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveContent = async () => {
    try {
      const [categories, streams] = await Promise.all([
        iptvService.getLiveCategories(),
        iptvService.getLiveStreams()
      ]);
      setLiveCategories(categories);
      fullDataRef.current.live = streams;
      setLiveStreams(streams); // Load all streams
    } catch (error) {
      console.error('Error loading live content:', error);
      Alert.alert('Error', 'Failed to load live TV content');
    }
  };

  const loadMovieContent = async () => {
    try {
      const [categories, streams] = await Promise.all([
        iptvService.getVODCategories(),
        iptvService.getVODStreams()
      ]);
      setVodCategories(categories);
      fullDataRef.current.movies = streams;
      setVodStreams(streams); // Load all streams
    } catch (error) {
      console.error('Error loading movies:', error);
      Alert.alert('Error', 'Failed to load movies');
    }
  };

  const loadSeriesContent = async () => {
    try {
      const [categories, streams] = await Promise.all([
        iptvService.getSeriesCategories(),
        iptvService.getSeries()
      ]);
      setSeriesCategories(categories);
      fullDataRef.current.series = streams;
      setSeriesStreams(streams); // Load all streams
    } catch (error) {
      console.error('Error loading series:', error);
      Alert.alert('Error', 'Failed to load series');
    }
  };

  const handleCategoryChange = useCallback(async (categoryId: string | null) => {
    if (contentType === 'live') {
      setSelectedLiveCategory(categoryId);
      if (categoryId) {
        const streams = await iptvService.getLiveStreams(categoryId);
        setLiveStreams(streams);
      } else {
        // Load all when "All" is selected
        setLiveStreams(fullDataRef.current.live);
      }
    } else if (contentType === 'movies') {
      setSelectedVodCategory(categoryId);
      if (categoryId) {
        const streams = await iptvService.getVODStreams(categoryId);
        setVodStreams(streams);
      } else {
        setVodStreams(fullDataRef.current.movies);
      }
    } else {
      setSelectedSeriesCategory(categoryId);
      if (categoryId) {
        const streams = await iptvService.getSeries(categoryId);
        setSeriesStreams(streams);
      } else {
        setSeriesStreams(fullDataRef.current.series);
      }
    }
  }, [contentType]);

  const handleLogout = useCallback(() => {
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
  }, [logout, router]);

  const handleItemPress = useCallback((item: any) => {
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
  }, [contentType, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Clear loaded flags to force refresh
    loadedRef.current = { live: false, movies: false, series: false };
    iptvService.clearCache();
    await loadContent();
    setRefreshing(false);
  }, [contentType]);

  // Debounced search for better performance
  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  // Memoized current streams with filtering
  const currentStreams = useMemo(() => {
    let streams: any[] = [];
    let categoryId: string | null = null;
    
    if (contentType === 'live') {
      streams = liveStreams;
      categoryId = selectedLiveCategory;
    } else if (contentType === 'movies') {
      streams = vodStreams;
      categoryId = selectedVodCategory;
    } else {
      streams = seriesStreams;
      categoryId = selectedSeriesCategory;
    }
    
    // Apply category filter if a category is selected
    if (categoryId) {
      streams = streams.filter(item => item.category_id === categoryId);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      streams = streams.filter(item => 
        item.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply favorites filter
    if (showFavoritesOnly) {
      streams = streams.filter(item => 
        isFavorite(item.stream_id || item.series_id)
      );
    }
    
    return streams;
  }, [contentType, liveStreams, vodStreams, seriesStreams, selectedLiveCategory, selectedVodCategory, selectedSeriesCategory, searchQuery, showFavoritesOnly, isFavorite]);

  // Memoized categories
  const currentCategories = useMemo(() => {
    if (contentType === 'live') return liveCategories;
    if (contentType === 'movies') return vodCategories;
    return seriesCategories;
  }, [contentType, liveCategories, vodCategories, seriesCategories]);

  const selectedCategory = useMemo(() => {
    if (contentType === 'live') return selectedLiveCategory;
    if (contentType === 'movies') return selectedVodCategory;
    return selectedSeriesCategory;
  }, [contentType, selectedLiveCategory, selectedVodCategory, selectedSeriesCategory]);

  const featuredItem = currentStreams[0];

  // Fetch enhanced hero data (backdrop image) for the featured item
  useEffect(() => {
    const fetchHeroData = async () => {
      if (!featuredItem) {
        setHeroData(null);
        return;
      }

      const itemId = featuredItem.stream_id || featuredItem.series_id;
      const cacheKey = `${contentType}_${itemId}`;
      
      // Skip if already fetched for this item
      if (heroFetchedRef.current === cacheKey) return;
      heroFetchedRef.current = cacheKey;

      try {
        if (contentType === 'movies' && featuredItem.stream_id) {
          // Fetch movie details to get backdrop
          const vodInfo = await iptvService.getVODInfo(featuredItem.stream_id);
          // Use getBackdropUrl to parse the newline-separated backdrop URLs
          const backdropUrl = getHeroImageUrl(vodInfo.info);
          setHeroData({
            imageUrl: backdropUrl || vodInfo.info?.movie_image || null,
            plot: vodInfo.info?.plot || vodInfo.info?.description,
            genre: vodInfo.info?.genre,
            rating: vodInfo.info?.rating || undefined,
          });
        } else if (contentType === 'series' && featuredItem.series_id) {
          // Series already has backdrop_path
          setHeroData({
            imageUrl: getHeroImageUrl(featuredItem),
            plot: featuredItem.plot,
            genre: featuredItem.genre,
            rating: featuredItem.rating,
          });
        } else {
          // Live TV - use stream icon
          setHeroData({
            imageUrl: featuredItem.stream_icon || null,
            plot: undefined,
            genre: undefined,
            rating: undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
        // Fallback to basic data
        setHeroData({
          imageUrl: getHeroImageUrl(featuredItem),
          plot: featuredItem.plot,
          genre: featuredItem.genre,
          rating: featuredItem.rating,
        });
      }
    };

    fetchHeroData();
  }, [featuredItem, contentType]);

  // Check if a specific category is selected
  const isCategorySelected = selectedCategory !== null;

  // Memoized category rows - show more categories and items when "All" is selected
  const categoryRows = useMemo(() => {
    if (isCategorySelected) return []; // Use chunked rows instead
    
    return currentCategories.map(cat => ({
      category: cat,
      items: currentStreams
        .filter(item => item.category_id === cat.category_id)
        .slice(0, 20), // Show up to 20 items per row
    })).filter(row => row.items.length > 0);
  }, [currentCategories, currentStreams, isCategorySelected]);

  // Chunked rows for selected category - split large categories into multiple rows
  const ITEMS_PER_ROW = 20;
  const selectedCategoryRows = useMemo(() => {
    if (!isCategorySelected) return [];
    
    const categoryName = currentCategories.find(c => c.category_id === selectedCategory)?.category_name || 'Content';
    const items = currentStreams.map(item => ({
      ...item,
      id: item.stream_id || item.series_id,
      name: item.name,
      imageUrl: contentType === 'live' ? item.stream_icon : 
               (item.cover_big || item.cover || item.stream_icon),
      rating: item.rating,
    }));
    
    // Split into chunks of ITEMS_PER_ROW
    const chunks: { title: string; items: any[] }[] = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_ROW) {
      const chunk = items.slice(i, i + ITEMS_PER_ROW);
      const rowNum = Math.floor(i / ITEMS_PER_ROW) + 1;
      const totalRows = Math.ceil(items.length / ITEMS_PER_ROW);
      
      // First row shows category name with total count, rest show row numbers
      const title = rowNum === 1 
        ? `${categoryName} (${items.length} items)`
        : `${categoryName} - Page ${rowNum} of ${totalRows}`;
      
      chunks.push({ title, items: chunk });
    }
    
    return chunks;
  }, [isCategorySelected, currentCategories, currentStreams, selectedCategory, contentType]);

  // Memoized favorites set for ContentRow
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

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
          onSearch={debouncedSearch}
          activeTab={contentType}
          onTabChange={setContentType}
        />
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
        {/* Hero Banner - Hidden for Live TV */}
        {featuredItem && !searchQuery && contentType !== 'live' && (
          <EnhancedHeroBanner
            title={featuredItem.name}
            description={heroData?.plot || featuredItem.plot || featuredItem.description}
            imageUrl={heroData?.imageUrl || getHeroImageUrl(featuredItem) || undefined}
            rating={heroData?.rating || featuredItem.rating}
            genre={heroData?.genre || featuredItem.genre}
            onPlayPress={() => handleItemPress(featuredItem)}
            onInfoPress={() => handleItemPress(featuredItem)}
            isFavorite={isFavorite(featuredItem.stream_id || featuredItem.series_id)}
            onFavoritePress={() => toggleFavorite(featuredItem.stream_id || featuredItem.series_id)}
          />
        )}

        {/* Category Filter - Hidden for Live TV */}
        {contentType !== 'live' && (
        <View style={styles.filterContainer}>
          <CategoryFilter
            categories={currentCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategoryChange}
            showFavoritesFilter
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />
        </View>
        )}

        {/* Content */}
        <View style={[styles.contentContainer, contentType === 'live' && styles.liveContentContainer]}>
          {/* Continue Watching - Only show when "All" is selected and not Live TV */}
          {!isCategorySelected && history.length > 0 && contentType !== 'live' && (
            <ContentRow
              title="Continue Watching"
              items={history.slice(0, 10).map(h => ({
                id: h.id,
                name: h.title,
                imageUrl: h.poster || h.logo,
              }))}
              type={contentType === 'movies' ? 'movie' : contentType as 'live' | 'movie' | 'series'}
              favorites={favoritesSet}
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

          {/* Chunked Category Rows - When a specific category is selected */}
          {isCategorySelected && selectedCategoryRows.map((row, index) => (
            <ContentRow
              key={`${selectedCategory}-row-${index}`}
              title={row.title}
              items={row.items}
              type={contentType === 'movies' ? 'movie' : contentType as 'live' | 'movie' | 'series'}
              favorites={favoritesSet}
              onItemPress={handleItemPress}
              onFavoritePress={(id) => toggleFavorite(Number(id))}
            />
          ))}

          {/* Category Rows - Only when "All" is selected */}
          {!isCategorySelected && categoryRows.map((row) => (
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
              favorites={favoritesSet}
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
    marginTop: isMobile ? -spacing.lg : -spacing.xxl, // Less overlap on mobile
    marginBottom: isMobile ? spacing.md : spacing.xl,
    zIndex: 10,
  },
  contentContainer: {
    paddingBottom: isMobile ? spacing.xl : spacing.giant,
    gap: isMobile ? spacing.lg : spacing.xxl,
  },
  liveContentContainer: {
    paddingTop: isMobile ? spacing.xxl + 60 : spacing.giant + 80, // Adjust for mobile header
  },
  bottomSpacer: {
    height: isMobile ? spacing.xl : spacing.xxxl,
  },
});
