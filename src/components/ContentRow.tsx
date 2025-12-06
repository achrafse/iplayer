import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItemInfo,
  Animated,
  Dimensions,
} from 'react-native';
import { ContentCard } from './ContentCard';
import { colors, typography, spacing, rgba } from '../constants/theme';
import { useFadeSlideIn } from '../hooks/useAnimations';
import { imagePreloader } from '../utils/imagePreloader';
import { isMobile, isTablet, isTV, getRowPadding } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive card width calculation
const getCardWidth = () => {
  if (isTV) return 280;
  if (isTablet) return 180;
  if (isMobile) return Math.min((SCREEN_WIDTH - 48) / 2.5, 140);
  return 220;
};

// Responsive horizontal padding
const getHorizontalPadding = () => {
  if (isTV) return spacing.giant;
  if (isTablet) return spacing.xl;
  if (isMobile) return spacing.md;
  return spacing.giant;
};

interface ContentItem {
  id: string | number;
  name: string;
  imageUrl?: string;
  rating?: string | number;
}

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  type: 'live' | 'movie' | 'series';
  favorites: Set<string | number>;
  onItemPress: (item: ContentItem) => void;
  onFavoritePress: (id: string | number) => void;
  onSeeAll?: () => void;
}

export const ContentRow: React.FC<ContentRowProps> = React.memo(({
  title,
  items,
  type,
  favorites,
  onItemPress,
  onFavoritePress,
  onSeeAll,
}) => {
  // Smooth fade-slide animation (400ms)
  const { fadeAnim, slideAnim } = useFadeSlideIn(400, 0, 15);
  const keyExtractor = useCallback((item: ContentItem) => String(item.id), []);
  
  const CARD_WIDTH = getCardWidth();
  const GAP = isMobile ? spacing.sm : spacing.lg;
  const ITEM_WIDTH = CARD_WIDTH + GAP;
  const horizontalPadding = getHorizontalPadding();
  
  // Preload images when items change
  useEffect(() => {
    if (items.length > 0) {
      const imageUrls = items
        .slice(0, 8) // Preload first 8 images
        .map(item => item.imageUrl)
        .filter(Boolean) as string[];
      
      imagePreloader.queuePreload(imageUrls);
    }
  }, [items]);
  
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * index,
      index,
    }),
    [ITEM_WIDTH]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ContentItem>) => (
      <View style={[styles.cardWrapper, { width: CARD_WIDTH, marginRight: GAP }]}>
        <ContentCard
          title={item.name}
          imageUrl={item.imageUrl}
          type={type}
          rating={item.rating}
          isFavorite={favorites.has(item.id)}
          onPress={() => onItemPress(item)}
          onFavoritePress={() => onFavoritePress(item.id)}
        />
      </View>
    ),
    [type, favorites, onItemPress, onFavoritePress, CARD_WIDTH, GAP]
  );

  if (items.length === 0) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && items.length > 4 && (
          <TouchableOpacity 
            onPress={onSeeAll} 
            activeOpacity={0.7}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        // Performance optimizations
        initialNumToRender={isMobile ? 3 : 4}
        maxToRenderPerBatch={isMobile ? 3 : 4}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        // Reduce memory usage
        updateCellsBatchingPeriod={50}
        // Improve scroll performance
        scrollEventThrottle={16}
        // Maintain scroll position
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: isMobile ? spacing.xl : spacing.huge, // Less spacing on mobile
    marginTop: isMobile ? spacing.sm : spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isMobile ? spacing.md : spacing.xl,
  },
  title: {
    color: colors.neutral.white,
    fontSize: isMobile ? typography.size.md : typography.size.xl, // Smaller on mobile
    fontWeight: '600' as any,
    letterSpacing: typography.letterSpacing.tight,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  seeAllText: {
    color: rgba(colors.neutral.gray100, 0.6),
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    fontWeight: '500' as any,
    letterSpacing: typography.letterSpacing.wide,
  },
  arrow: {
    fontSize: isMobile ? typography.size.sm : typography.size.md,
    color: colors.primary.accent,
  },
  scrollContent: {
    gap: isMobile ? spacing.sm : spacing.lg,
  },
  cardWrapper: {
    // Width and marginRight are now set dynamically
  },
});
