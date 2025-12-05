import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ImageBackground,
} from 'react-native';
import { OptimizedImage } from '../OptimizedImage';
import { colors, typography, spacing, borderRadius, shadows, rgba } from '../../constants/theme';

export type CardType = 'poster' | 'landscape' | 'square' | 'hero';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
  title: string;
  imageUrl?: string;
  type?: CardType;
  size?: CardSize;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  rating?: string | number;
  progress?: number; // 0-100 for watch progress
  onPress: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onLongPress?: () => void;
  showOverlay?: boolean;
  showTitle?: boolean;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  imageUrl,
  type = 'poster',
  size = 'md',
  subtitle,
  badge,
  badgeColor = colors.semantic.error,
  rating,
  progress,
  onPress,
  onFocus,
  onBlur,
  onLongPress,
  showOverlay = true,
  showTitle = true,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [imageError, setImageError] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressIn = () => {
    Animated.timing(opacityAnim, {
      toValue: 0.7,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const getCardDimensions = () => {
    const sizeMultiplier = {
      sm: 0.75,
      md: 1,
      lg: 1.25,
      xl: 1.5,
    }[size];

    const dimensions = {
      poster: { width: 140, aspectRatio: 2 / 3 },
      landscape: { width: 240, aspectRatio: 16 / 9 },
      square: { width: 160, aspectRatio: 1 },
      hero: { width: 320, aspectRatio: 16 / 9 },
    }[type];

    return {
      width: dimensions.width * sizeMultiplier,
      height: (dimensions.width * sizeMultiplier) / dimensions.aspectRatio,
    };
  };

  const cardDimensions = getCardDimensions();

  const focusStyle = {
    borderColor: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', colors.focus.ring],
    }),
    boxShadow: isFocused ? `0 0 12px rgba(229, 9, 20, 0.8)` : 'none',
    elevation: isFocused ? 12 : 4,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: cardDimensions.width,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        testID={testID}
        accessible={true}
        accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
        accessibilityRole="button"
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.imageContainer,
            {
              width: cardDimensions.width,
              height: cardDimensions.height,
              opacity: opacityAnim,
            },
            focusStyle,
          ]}
        >
          {imageUrl && !imageError ? (
            <OptimizedImage
              uri={imageUrl}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholder, { height: cardDimensions.height }]}>
              <Text style={styles.placeholderText}>📺</Text>
            </View>
          )}

          {/* Gradient Overlay */}
          {showOverlay && (
            <View style={styles.gradientOverlay} />
          )}

          {/* Badge (LIVE, NEW, etc.) */}
          {badge && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          {/* Rating */}
          {rating && (
            <View style={styles.rating}>
              <Text style={styles.ratingText}>⭐ {rating}</Text>
            </View>
          )}

          {/* Progress Bar */}
          {progress !== undefined && progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          )}
        </Animated.View>

        {/* Title and Subtitle */}
        {showTitle && (
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  touchable: {
    width: '100%',
  },
  imageContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.primary.mediumGray,
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadows.md,
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
    fontSize: 48,
    opacity: 0.3,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'transparent',
    // Note: For actual gradient, use LinearGradient from expo-linear-gradient
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: typography.size.xs,
    fontWeight: '700' as any,
    letterSpacing: typography.letterSpacing.wider,
  },
  rating: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: rgba(colors.primary.darkGray, 0.8),
  },
  ratingText: {
    color: colors.neutral.white,
    fontSize: typography.size.xs,
    fontWeight: '600' as any,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: rgba(colors.neutral.white, 0.2),
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.accent,
  },
  textContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  title: {
    color: colors.neutral.white,
    fontSize: typography.size.base,
    fontWeight: '600' as any,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: 2,
  },
  subtitle: {
    color: colors.neutral.gray200,
    fontSize: typography.size.sm,
    fontWeight: '400' as any,
  },
});
