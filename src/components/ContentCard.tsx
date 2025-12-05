import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { colors, typography, spacing, borderRadius, rgba } from '../constants/theme';
import { useHover } from '../hooks/useHover';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 220; // Enlarged cards for Netflix-style grid

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

  const handleFavoritePress = useCallback(
    (e: any) => {
      e.stopPropagation();
      onFavoritePress?.();
    },
    [onFavoritePress]
  );

  const imageSource = useMemo(
    () => (imageUrl ? { uri: imageUrl } : null),
    [imageUrl]
  );

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
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode={isLiveTV ? 'contain' : 'cover'}
            defaultSource={require('../../assets/icon.png')}
          />
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
    marginBottom: spacing.sm,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: rgba(colors.primary.mediumGray, 0.3),
    // No heavy shadows - clean flat design
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.mediumGray, 0.4),
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.2,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
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
    textShadow: '0 1px 3px rgba(10, 10, 10, 0.8)',
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
