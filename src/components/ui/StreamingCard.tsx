/**
 * StreamingCard - Modern streaming platform card component
 * Optimized for Netflix/Disney+/Apple TV+ aesthetic
 * Supports all platforms: TV, Mobile, Tablet, Desktop
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OptimizedImage } from '../OptimizedImage';
import { 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  animations,
  rgba,
  zIndex,
} from '../../constants/theme';
import { 
  isTV,
  getPosterDimensions,
  getLandscapeDimensions,
  getScaledRadius,
  scaledFont,
  scaleSpacing,
  getIconSize,
} from '../../utils/responsive';
import { getPlatformCapabilities, getPlatformGuidelines } from '../../utils/platform';

export type CardType = 'poster' | 'landscape' | 'square' | 'hero' | 'banner';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

interface StreamingCardProps {
  // Core props
  title: string;
  imageUrl?: string;
  type?: CardType;
  size?: CardSize;
  
  // Metadata
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  badgeIcon?: React.ReactNode;
  rating?: string | number;
  year?: string | number;
  duration?: string;
  quality?: '4K' | 'HD' | 'SD' | 'HDR' | 'DV';
  progress?: number; // 0-100 watch progress
  
  // States
  isNew?: boolean;
  isLive?: boolean;
  isFavorite?: boolean;
  isWatched?: boolean;
  
  // Interactions
  onPress: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onLongPress?: () => void;
  onHover?: (hovered: boolean) => void;
  
  // Display options
  showOverlay?: boolean;
  showTitle?: boolean;
  showMetadata?: boolean;
  showProgress?: boolean;
  enableZoom?: boolean;
  testID?: string;
  
  // Custom styling
  style?: any;
  imageStyle?: any;
}

export const StreamingCard: React.FC<StreamingCardProps> = ({
  title,
  imageUrl,
  type = 'poster',
  size = 'md',
  subtitle,
  description,
  badge,
  badgeColor,
  badgeIcon,
  rating,
  year,
  duration,
  quality,
  progress,
  isNew = false,
  isLive = false,
  isFavorite = false,
  isWatched = false,
  onPress,
  onFocus,
  onBlur,
  onLongPress,
  onHover,
  showOverlay = true,
  showTitle = true,
  showMetadata = true,
  showProgress = true,
  enableZoom = true,
  testID,
  style,
  imageStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  const platformCapabilities = getPlatformCapabilities();
  const platformGuidelines = getPlatformGuidelines();

  // Shimmer animation for loading
  useEffect(() => {
    if (!imageLoaded && !imageError) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      shimmerAnim.stopAnimation();
    }
  }, [imageLoaded, imageError]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: enableZoom ? platformCapabilities.focusScale : 1,
        useNativeDriver: true,
        ...animations.spring.bouncy,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: animations.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animations.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Pulsing glow for TV
    if (isTV) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    glowAnim.stopAnimation();
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isHovered && !isTV ? animations.scale.hover : 1,
        useNativeDriver: true,
        ...animations.spring.smooth,
      }),
      Animated.timing(overlayAnim, {
        toValue: isHovered && !isTV ? 0.5 : 0,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: animations.scale.press,
      useNativeDriver: true,
      ...animations.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    const targetScale = isFocused 
      ? (enableZoom ? platformCapabilities.focusScale : 1) 
      : (isHovered && !isTV ? animations.scale.hover : 1);
      
    Animated.spring(scaleAnim, {
      toValue: targetScale,
      useNativeDriver: true,
      ...animations.spring.smooth,
    }).start();
  };
  
  const handleMouseEnter = () => {
    if (Platform.OS === 'web' && !isTV) {
      setIsHovered(true);
      onHover?.(true);
      
      if (!isFocused) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: enableZoom ? animations.scale.hover : 1,
            useNativeDriver: true,
            ...animations.spring.smooth,
          }),
          Animated.timing(overlayAnim, {
            toValue: 0.5,
            duration: animations.duration.normal,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };
  
  const handleMouseLeave = () => {
    if (Platform.OS === 'web' && !isTV) {
      setIsHovered(false);
      onHover?.(false);
      
      if (!isFocused) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            ...animations.spring.smooth,
          }),
          Animated.timing(overlayAnim, {
            toValue: 0,
            duration: animations.duration.fast,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const getCardDimensions = () => {
    if (type === 'poster') {
      return getPosterDimensions(size);
    } else if (type === 'landscape' || type === 'banner') {
      return getLandscapeDimensions(size);
    } else if (type === 'square') {
      const base = size === 'sm' ? 120 : size === 'lg' ? 180 : size === 'xl' ? 220 : 150;
      return { width: base, height: base };
    }
    return { width: 150, height: 225 }; // Default poster
  };

  const cardDimensions = getCardDimensions();
  
  const focusStyle = isFocused ? {
    borderColor: platformGuidelines.focusIndicatorColor,
    borderWidth: platformGuidelines.focusIndicatorWidth,
    ...shadows.focus,
  } : {};

  const shouldShowBadge = badge || isNew || isLive;
  const badgeText = badge || (isNew ? 'NEW' : isLive ? 'LIVE' : '');
  const badgeBgColor = badgeColor || (isLive ? colors.semantic.live : isNew ? colors.secondary.gold : colors.primary.accent);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: cardDimensions.width,
          transform: [{ scale: scaleAnim }],
          zIndex: isFocused ? zIndex.cardHover : zIndex.card,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // @ts-ignore - Web-only props
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        activeOpacity={0.9}
        testID={testID}
        accessible={true}
        accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}${rating ? `, rated ${rating}` : ''}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view details"
        style={styles.touchable}
      >
        <View
          style={[
            styles.imageContainer,
            {
              width: cardDimensions.width,
              height: cardDimensions.height,
              borderRadius: getScaledRadius(
                type === 'banner' ? borderRadius.lg : borderRadius.md
              ),
            },
            focusStyle,
          ]}
        >
          {/* Image */}
          {imageUrl && !imageError ? (
            <OptimizedImage
              uri={imageUrl}
              style={[styles.image, imageStyle]}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.placeholder, { height: cardDimensions.height }]}>
              <Text style={styles.placeholderText}>
                {type === 'landscape' ? '📺' : '🎬'}
              </Text>
              {!imageLoaded && !imageError && (
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      opacity: shimmerAnim,
                    },
                  ]}
                />
              )}
            </View>
          )}

          {/* Gradient Overlay */}
          {showOverlay && imageLoaded && (
            <LinearGradient
              colors={colors.gradients.overlay as any}
              style={[styles.gradientOverlay, { pointerEvents: 'none' }]}
            />
          )}
          
          {/* Hover/Focus overlay */}
          <Animated.View
            style={[
              styles.hoverOverlay,
              {
                opacity: overlayAnim,
                pointerEvents: 'none',
              },
            ]}
          />

          {/* Top badges */}
          <View style={styles.topBadges}>
            {/* Quality badge */}
            {quality && (
              <View style={[styles.qualityBadge, { backgroundColor: rgba(colors.primary.black, 0.8) }]}>
                <Text style={styles.qualityText}>{quality}</Text>
              </View>
            )}
            
            {/* Custom badge */}
            {shouldShowBadge && (
              <View style={[styles.badge, { backgroundColor: badgeBgColor }]}>
                {badgeIcon}
                <Text style={styles.badgeText}>{badgeText}</Text>
              </View>
            )}
          </View>

          {/* Rating */}
          {rating && showMetadata && (
            <View style={styles.rating}>
              <Text style={styles.ratingText}>⭐ {rating}</Text>
            </View>
          )}
          
          {/* Favorite indicator */}
          {isFavorite && (
            <View style={styles.favoriteIndicator}>
              <Text style={styles.favoriteIcon}>❤️</Text>
            </View>
          )}
          
          {/* Watched indicator */}
          {isWatched && (
            <View style={styles.watchedIndicator}>
              <Text style={styles.watchedIcon}>✓</Text>
            </View>
          )}

          {/* Progress Bar */}
          {progress !== undefined && progress > 0 && showProgress && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          )}
          
          {/* Live pulse indicator */}
          {isLive && (
            <View style={styles.livePulse}>
              <View style={styles.liveDot} />
            </View>
          )}
        </View>

        {/* Title and metadata */}
        {showTitle && (
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            
            {showMetadata && (subtitle || year || duration) && (
              <View style={styles.metadata}>
                {subtitle && (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
                {(year || duration) && (
                  <Text style={styles.metadataText} numberOfLines={1}>
                    {[year, duration].filter(Boolean).join(' • ')}
                  </Text>
                )}
              </View>
            )}
            
            {/* Description on focus (TV only) */}
            {description && isFocused && isTV && (
              <Animated.View style={[styles.description, { opacity: opacityAnim }]}>
                <Text style={styles.descriptionText} numberOfLines={3}>
                  {description}
                </Text>
              </Animated.View>
            )}
          </View>
        )}
      </TouchableOpacity>
      
      {/* Focus glow effect for TV */}
      {isFocused && isTV && (
        <Animated.View
          style={[
            styles.focusGlow,
            {
              width: cardDimensions.width + 8,
              height: cardDimensions.height + 8,
              borderRadius: getScaledRadius(borderRadius.md) + 4,
              opacity: glowAnim,
              pointerEvents: 'none',
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scaleSpacing(spacing.md),
  },
  touchable: {
    width: '100%',
  },
  imageContainer: {
    backgroundColor: colors.primary.mediumGray,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.mediumGray,
  },
  placeholderText: {
    fontSize: scaledFont(48),
    opacity: 0.3,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: rgba(colors.neutral.white, 0.1),
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: rgba(colors.neutral.white, 0.15),
  },
  topBadges: {
    position: 'absolute',
    top: scaleSpacing(spacing.sm),
    right: scaleSpacing(spacing.sm),
    flexDirection: 'row',
    gap: scaleSpacing(spacing.xs),
  },
  badge: {
    paddingHorizontal: scaleSpacing(spacing.sm),
    paddingVertical: scaleSpacing(4),
    borderRadius: getScaledRadius(borderRadius.xs),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpacing(4),
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: scaledFont(typography.size.xs),
    fontWeight: typography.weight.bold as any,
    letterSpacing: typography.letterSpacing.wider,
  },
  qualityBadge: {
    paddingHorizontal: scaleSpacing(spacing.xs),
    paddingVertical: scaleSpacing(2),
    borderRadius: getScaledRadius(borderRadius.xs),
  },
  qualityText: {
    color: colors.neutral.white,
    fontSize: scaledFont(typography.size.xs),
    fontWeight: typography.weight.bold as any,
  },
  rating: {
    position: 'absolute',
    top: scaleSpacing(spacing.sm),
    left: scaleSpacing(spacing.sm),
    paddingHorizontal: scaleSpacing(spacing.sm),
    paddingVertical: scaleSpacing(4),
    borderRadius: getScaledRadius(borderRadius.xs),
    backgroundColor: rgba(colors.primary.black, 0.8),
  },
  ratingText: {
    color: colors.neutral.white,
    fontSize: scaledFont(typography.size.xs),
    fontWeight: typography.weight.semibold as any,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: scaleSpacing(spacing.sm),
    left: scaleSpacing(spacing.sm),
    width: getIconSize(28),
    height: getIconSize(28),
    borderRadius: getIconSize(14),
    backgroundColor: rgba(colors.primary.black, 0.6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: getIconSize(16),
  },
  watchedIndicator: {
    position: 'absolute',
    bottom: scaleSpacing(spacing.sm),
    right: scaleSpacing(spacing.sm),
    width: getIconSize(24),
    height: getIconSize(24),
    borderRadius: getIconSize(12),
    backgroundColor: colors.semantic.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchedIcon: {
    color: colors.neutral.white,
    fontSize: getIconSize(14),
    fontWeight: typography.weight.bold as any,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: isTV ? 6 : 4,
    backgroundColor: rgba(colors.neutral.white, 0.2),
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.accent,
  },
  livePulse: {
    position: 'absolute',
    top: scaleSpacing(spacing.sm),
    left: scaleSpacing(spacing.sm),
  },
  liveDot: {
    width: getIconSize(12),
    height: getIconSize(12),
    borderRadius: getIconSize(6),
    backgroundColor: colors.semantic.live,
    ...shadows.glow(colors.semantic.live, 0.8),
  },
  textContainer: {
    marginTop: scaleSpacing(spacing.sm),
    paddingHorizontal: scaleSpacing(spacing.xxs),
  },
  title: {
    color: colors.neutral.white,
    fontSize: scaledFont(typography.size.base),
    fontWeight: typography.weight.semibold as any,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: scaleSpacing(4),
  },
  metadata: {
    marginTop: scaleSpacing(2),
  },
  subtitle: {
    color: colors.neutral.gray200,
    fontSize: scaledFont(typography.size.sm),
    fontWeight: typography.weight.regular as any,
    marginBottom: scaleSpacing(2),
  },
  metadataText: {
    color: colors.neutral.gray300,
    fontSize: scaledFont(typography.size.xs),
    fontWeight: typography.weight.regular as any,
  },
  description: {
    marginTop: scaleSpacing(spacing.sm),
    padding: scaleSpacing(spacing.sm),
    backgroundColor: rgba(colors.primary.black, 0.8),
    borderRadius: getScaledRadius(borderRadius.sm),
  },
  descriptionText: {
    color: colors.neutral.gray100,
    fontSize: scaledFont(typography.size.sm),
    lineHeight: scaledFont(typography.size.sm) * typography.lineHeight.relaxed,
  },
  focusGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    borderWidth: 2,
    borderColor: colors.focus.ring,
    ...shadows.glow(colors.focus.ring, 0.8),
    pointerEvents: 'none',
  },
});
