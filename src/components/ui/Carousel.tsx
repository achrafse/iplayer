import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import { Card, CardType, CardSize } from './Card';
import { colors, spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CarouselItem {
  id: string | number;
  title: string;
  imageUrl?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  rating?: string | number;
  progress?: number;
}

interface CarouselProps {
  data: CarouselItem[];
  onItemPress: (item: CarouselItem) => void;
  onItemFocus?: (item: CarouselItem) => void;
  onItemLongPress?: (item: CarouselItem) => void;
  cardType?: CardType;
  cardSize?: CardSize;
  showOverlay?: boolean;
  showTitle?: boolean;
  snapToInterval?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemSpacing?: number;
  contentPaddingHorizontal?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  testID?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  data,
  onItemPress,
  onItemFocus,
  onItemLongPress,
  cardType = 'landscape',
  cardSize = 'md',
  showOverlay = true,
  showTitle = true,
  snapToInterval = false,
  autoPlay = false,
  autoPlayInterval = 5000,
  itemSpacing = spacing.base,
  contentPaddingHorizontal = spacing.xl,
  onEndReached,
  onEndReachedThreshold = 0.5,
  testID,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewableItems, setViewableItems] = useState<Set<string | number>>(new Set());
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && data.length > 1) {
      autoPlayTimerRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % data.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, autoPlayInterval);

      return () => {
        if (autoPlayTimerRef.current) {
          clearInterval(autoPlayTimerRef.current);
        }
      };
    }
  }, [autoPlay, currentIndex, data.length, autoPlayInterval]);

  // Calculate item width based on card type and size
  const getItemWidth = () => {
    const sizeMultiplier = {
      sm: 0.75,
      md: 1,
      lg: 1.25,
      xl: 1.5,
    }[cardSize];

    const baseWidth = {
      poster: 140,
      landscape: 240,
      square: 160,
      hero: 320,
    }[cardType];

    return baseWidth * sizeMultiplier;
  };

  const itemWidth = getItemWidth();
  const snapInterval = snapToInterval ? itemWidth + itemSpacing : undefined;

  const keyExtractor = useCallback((item: CarouselItem) => String(item.id), []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: itemWidth + itemSpacing,
      offset: (itemWidth + itemSpacing) * index,
      index,
    }),
    [itemWidth, itemSpacing]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems: items }: { viewableItems: ViewToken[] }) => {
      const visibleIds = new Set(items.map(item => item.item.id));
      setViewableItems(visibleIds);
      
      if (items.length > 0 && items[0].index !== null) {
        setCurrentIndex(items[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: CarouselItem; index: number }) => {
      // Lazy loading: Only render items that are visible or near visible
      const shouldRender =
        viewableItems.has(item.id) ||
        Math.abs(index - currentIndex) <= 3;

      if (!shouldRender) {
        // Render placeholder to maintain scroll position
        return (
          <View
            style={{
              width: itemWidth,
              marginRight: itemSpacing,
            }}
          />
        );
      }

      return (
        <View
          style={{
            width: itemWidth,
            marginRight: itemSpacing,
          }}
        >
          <Card
            title={item.title}
            imageUrl={item.imageUrl}
            type={cardType}
            size={cardSize}
            subtitle={item.subtitle}
            badge={item.badge}
            badgeColor={item.badgeColor}
            rating={item.rating}
            progress={item.progress}
            onPress={() => onItemPress(item)}
            onFocus={() => onItemFocus?.(item)}
            onLongPress={() => onItemLongPress?.(item)}
            showOverlay={showOverlay}
            showTitle={showTitle}
            testID={`${testID}-item-${item.id}`}
          />
        </View>
      );
    },
    [
      cardType,
      cardSize,
      showOverlay,
      showTitle,
      itemWidth,
      itemSpacing,
      onItemPress,
      onItemFocus,
      onItemLongPress,
      viewableItems,
      currentIndex,
      testID,
    ]
  );

  const handleScrollBeginDrag = () => {
    // Pause auto-play when user interacts
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (itemWidth + itemSpacing));
    setCurrentIndex(index);
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: contentPaddingHorizontal,
        }}
        decelerationRate={snapToInterval ? 'fast' : 'normal'}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        testID={testID}
      />

      {/* Pagination Dots (optional for hero carousels) */}
      {cardType === 'hero' && data.length > 1 && (
        <View style={styles.paginationContainer}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.gray300,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.primary.accent,
  },
});
