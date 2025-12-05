import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItemInfo,
  Animated,
} from 'react-native';
import { ContentCard } from './ContentCard';
import { colors, typography, spacing, rgba } from '../constants/theme';
import { useFadeSlideIn } from '../hooks/useAnimations';

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
  
  const ITEM_WIDTH = 240; // Card width (220) + gap (20)
  
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ContentItem>) => (
      <View style={styles.cardWrapper}>
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
    [type, favorites, onItemPress, onFavoritePress]
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
      <View style={styles.header}>
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
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.huge, // 48px generous spacing between sections
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.giant, // 80px horizontal margins
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.neutral.white,
    fontSize: typography.size.xl, // Headers: 22px
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
    fontSize: typography.size.sm, // Body: 13px
    fontWeight: '500' as any,
    letterSpacing: typography.letterSpacing.wide,
  },
  arrow: {
    fontSize: typography.size.md,
    color: colors.primary.accent,
  },
  scrollContent: {
    paddingHorizontal: spacing.giant, // 80px horizontal margins
    gap: spacing.lg, // 20px gap between cards
  },
  cardWrapper: {
    width: 220, // Match new CARD_WIDTH
    marginRight: spacing.lg,
  },
});
