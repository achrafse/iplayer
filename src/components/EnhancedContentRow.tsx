import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Carousel, CarouselItem } from './ui/Carousel';
import { CardType, CardSize } from './ui/Card';
import { colors, typography, spacing, rgba } from '../constants/theme';
import { useFadeSlideIn } from '../hooks/useAnimations';

interface EnhancedContentRowProps {
  title: string;
  items: CarouselItem[];
  cardType?: CardType;
  cardSize?: CardSize;
  onItemPress: (item: CarouselItem) => void;
  onItemFocus?: (item: CarouselItem) => void;
  onItemLongPress?: (item: CarouselItem) => void;
  onSeeAll?: () => void;
  showOverlay?: boolean;
  showTitle?: boolean;
  autoPlay?: boolean;
  testID?: string;
}

/**
 * EnhancedContentRow - Modern carousel row with lazy loading
 * Replacement for the old ContentRow with better performance
 */
export const EnhancedContentRow: React.FC<EnhancedContentRowProps> = ({
  title,
  items,
  cardType = 'landscape',
  cardSize = 'md',
  onItemPress,
  onItemFocus,
  onItemLongPress,
  onSeeAll,
  showOverlay = true,
  showTitle = true,
  autoPlay = false,
  testID,
}) => {
  // Smooth fade-slide animation (400ms)
  const { fadeAnim, slideAnim } = useFadeSlideIn(400, 0, 15);

  if (items.length === 0) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]} 
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && items.length > 5 && (
          <TouchableOpacity
            onPress={onSeeAll}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel */}
      <Carousel
        data={items}
        onItemPress={onItemPress}
        onItemFocus={onItemFocus}
        onItemLongPress={onItemLongPress}
        cardType={cardType}
        cardSize={cardSize}
        showOverlay={showOverlay}
        showTitle={showTitle}
        autoPlay={autoPlay}
        testID={`${testID}-carousel`}
      />
    </Animated.View>
  );
};

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
});
