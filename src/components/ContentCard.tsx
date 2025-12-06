import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, borderRadius, rgba } from '../constants/theme';
import { useHover } from '../hooks/useHover';
import { isMobile, isTablet, isTV, getRowPadding } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive card width
const getCardWidth = () => {
  if (isTV) return 280;
  if (isTablet) return 180;
  if (isMobile) return Math.min((SCREEN_WIDTH - 48) / 2.5, 140); // 2.5 cards visible
  return 220;
};

const CARD_WIDTH = getCardWidth();

interface ContentCardProps {
  title: string;
  imageUrl?: string;
  type: 'live' | 'movie' | 'series';
  rating?: string | number;
  isFavorite?: boolean;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = React.memo(({
  title,
  imageUrl,
  type,
  rating,
  isFavorite,
  onPress,
  onFavoritePress,
}) => {
  const isLiveTV = type === 'live';
  const aspectRatio = isLiveTV ? 16 / 9 : 2 / 3;
  
  // Image loading state
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleFavoritePress = useCallback(
    (e: any) => {
      e.stopPropagation();
      onFavoritePress?.();
    },
    [onFavoritePress]
  );

  // Reset loading state when imageUrl changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [imageUrl]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const { isHovered, hoverProps } = useHover();

  // Animate on hover
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isHovered ? 1.05 : 1,
        useNativeDriver: true,
        friction: 20,
        tension: 200,
      }),
      Animated.timing(shadowAnim, {
        toValue: isHovered ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(badgeOpacity, {
        toValue: isHovered ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isHovered]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
      friction: 20,
      tension: 200,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: isHovered ? 1.05 : 1,
      useNativeDriver: true,
      friction: 20,
      tension: 200,
    }).start();
  }, [scaleAnim, isHovered]);

  // Show placeholder or image
  const showImage = imageUrl && !imageError;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...hoverProps}
    >
      <Animated.View
        style={[
          styles.card,
          { width: CARD_WIDTH, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.imageContainer, { aspectRatio }]}>
        {showImage ? (
          <>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode={isLiveTV ? 'contain' : 'cover'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              // Optimize image loading
              fadeDuration={200}
            />
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="small" color={colors.primary.accent} />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.image, styles.placeholderContainer]}>
            <Text style={styles.placeholderIcon}>
              {type === 'live' ? '📺' : type === 'movie' ? '🎬' : '📺'}
            </Text>
          </View>
        )}
        {/* Favorite button - always visible */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
        
        {/* Rating badge - only visible on hover */}
        {!isLiveTV && rating && (
          <Animated.View style={[styles.ratingBadge, { opacity: badgeOpacity }]}>
            <Text style={styles.ratingText}>⭐ {rating}</Text>
          </Animated.View>
        )}
        
        {/* Hover overlay with play button and additional info */}
        {isHovered && (
          <Animated.View style={[styles.hoverOverlay, { opacity: shadowAnim }]}>
            {/* Gradient overlay for text readability */}
            <View style={styles.hoverGradient} />
            
            {/* Centered play button */}
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            
            {/* Bottom info on hover */}
            <View style={styles.hoverInfo}>
              <Text style={styles.hoverTitle} numberOfLines={1}>{title}</Text>
              {rating && (
                <Text style={styles.hoverMeta}>⭐ {rating}</Text>
              )}
            </View>
          </Animated.View>
        )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.rating === nextProps.rating &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.type === nextProps.type
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: isMobile ? spacing.xs : spacing.sm,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    borderRadius: isMobile ? borderRadius.xs : borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: rgba(colors.primary.mediumGray, 0.3),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.mediumGray, 0.5),
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.mediumGray, 0.4),
  },
  placeholderIcon: {
    fontSize: isMobile ? 32 : 48,
    opacity: 0.2,
  },
  favoriteButton: {
    position: 'absolute',
    top: isMobile ? spacing.xs : spacing.sm,
    right: isMobile ? spacing.xs : spacing.sm,
    width: isMobile ? 26 : 32,
    height: isMobile ? 26 : 32,
    borderRadius: isMobile ? 13 : 16,
    backgroundColor: rgba(colors.primary.black, 0.6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 14,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: rgba(colors.primary.black, 0.75),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  ratingText: {
    color: colors.neutral.white,
    fontSize: typography.size.xs,
    fontWeight: '600' as any,
  },
  hoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: rgba(colors.primary.black, 0.65),
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: rgba(colors.neutral.white, 0.95),
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow for depth
    boxShadow: '0 4px 8px rgba(10, 10, 10, 0.3)',
    elevation: 8,
  },
  playIcon: {
    fontSize: 24,
    color: colors.primary.darkGray,
    marginLeft: 4,
  },
  hoverInfo: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  hoverTitle: {
    color: colors.neutral.white,
    fontSize: typography.size.sm,
    fontWeight: '600' as any,
    marginBottom: spacing.xxs,
    textShadowColor: 'rgba(10, 10, 10, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hoverMeta: {
    color: rgba(colors.neutral.white, 0.85),
    fontSize: typography.size.xs,
    fontWeight: '500' as any,
  },
  info: {
    paddingTop: spacing.md,
    paddingHorizontal: 0,
  },
  title: {
    color: colors.neutral.white,
    fontSize: typography.size.sm,
    fontWeight: '500' as any,
    lineHeight: typography.size.md + 2,
    textAlign: 'left',
  },
});
