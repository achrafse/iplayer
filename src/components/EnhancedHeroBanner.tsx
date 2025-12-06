import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from './ui/Button';
import { FocusableElement } from './ui/FocusableElement';
import { colors, typography, spacing, borderRadius, rgba } from '../constants/theme';
import { OptimizedImage } from './OptimizedImage';
import { getHeroBannerHeight, scaledFont, scaleSpacing, isTV, isMobile } from '../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Dynamic cinematic hero height (80-90vh)
const HERO_HEIGHT = getHeroBannerHeight();

interface EnhancedHeroBannerProps {
  title: string;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  rating?: string | number;
  genre?: string;
  year?: string | number;
  duration?: string;
  onPlayPress: () => void;
  onInfoPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  showAutoPlay?: boolean;
  videoPreviewUrl?: string;
  testID?: string;
}

/**
 * EnhancedHeroBanner - Premium hero section with auto-playing previews
 * Similar to Netflix/Prime Video hero banners
 */
export const EnhancedHeroBanner: React.FC<EnhancedHeroBannerProps> = ({
  title,
  description,
  imageUrl,
  logoUrl,
  rating,
  genre,
  year,
  duration,
  onPlayPress,
  onInfoPress,
  onFavoritePress,
  isFavorite = false,
  showAutoPlay = false,
  videoPreviewUrl,
  testID,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderMetadata = () => {
    const metadata = [rating && `⭐ ${rating}`, year, genre, duration].filter(Boolean);
    
    if (metadata.length === 0) return null;

    return (
      <View style={styles.metadataContainer}>
        {metadata.map((item, index) => (
          <React.Fragment key={index}>
            <Text style={styles.metadataText}>{item}</Text>
            {index < metadata.length - 1 && (
              <View style={styles.metadataDot} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        {imageUrl ? (
          <OptimizedImage
            uri={imageUrl}
            style={styles.backgroundImage}
            resizeMode="cover"
            showPlaceholder={false}
          />
        ) : (
          <View style={[styles.backgroundImage, styles.placeholder]} />
        )}

        {/* Gradient Overlays - Cinematic bottom fade for text readability */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(18, 18, 18, 0)',
            'rgba(18, 18, 18, 0.4)',
            'rgba(18, 18, 18, 0.85)',
            colors.primary.background,
          ]}
          locations={[0, 0.35, 0.55, 0.8, 1]}
          style={styles.gradientOverlay}
        />
        {/* Side gradient for additional depth */}
        <LinearGradient
          colors={[
            'rgba(18, 18, 18, 0.6)',
            'rgba(18, 18, 18, 0.3)',
            'transparent',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.sideGradient}
        />
      </View>

      {/* Content - Lower left positioning for cinematic look */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Always show title prominently - Netflix style */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Metadata */}
        {renderMetadata()}

        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
        )}

        {/* Action Buttons - Modern Netflix style */}
        <View style={styles.buttonsContainer}>
          {/* Primary Play button - Solid red */}
          <Button
            title="Play"
            onPress={onPlayPress}
            variant="primary"
            size={isTV ? 'lg' : 'md'}
            icon={<Text style={styles.playIcon}>▶</Text>}
            iconPosition="left"
            testID={`${testID}-play-button`}
          />

          {onInfoPress && (
            <>
              <View style={styles.buttonSpacing} />
              {/* More Info button - Transparent with border */}
              <Button
                title="More Info"
                onPress={onInfoPress}
                variant="secondary"
                size={isTV ? 'lg' : 'md'}
                icon={<Text style={styles.infoIcon}>ⓘ</Text>}
                iconPosition="left"
                testID={`${testID}-info-button`}
              />
            </>
          )}

          {onFavoritePress && (
            <>
              <View style={styles.buttonSpacing} />
              {/* Small heart/favorite icon button */}
              <FocusableElement
                onPress={onFavoritePress}
                style={{...styles.iconButton, ...(isFavorite ? styles.iconButtonActive : {})}}
                testID={`${testID}-favorite-button`}
              >
                <Text style={[styles.iconButtonText, isFavorite ? styles.iconButtonTextActive : null]}>
                  {isFavorite ? '♥' : '♡'}
                </Text>
              </FocusableElement>
            </>
          )}
        </View>
      </Animated.View>

      {/* Progress Indicator (if watching) */}
      {/* Can be added based on watch history */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    marginBottom: 0, // Edge-to-edge, content rows will handle spacing
    position: 'relative',
    width: '100%',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.primary.darkGray,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sideGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    position: 'absolute',
    bottom: isTV ? spacing.huge : isMobile ? spacing.xxl : spacing.huge,
    left: isTV ? spacing.giant : isMobile ? spacing.lg : spacing.giant, // 80px on desktop
    right: isTV ? spacing.giant : isMobile ? spacing.lg : spacing.giant,
    maxWidth: isTV ? 900 : isMobile ? '100%' : 650,
  },
  logo: {
    width: isTV ? 400 : 280,
    height: isTV ? 160 : 100,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.neutral.white,
    fontSize: isTV ? 72 : isMobile ? 40 : 64, // Hero: 48-64px desktop, 40px mobile
    fontWeight: '700' as any,
    letterSpacing: typography.letterSpacing.tight,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    marginBottom: spacing.base,
    lineHeight: isTV ? 78 : isMobile ? 46 : 70,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metadataText: {
    color: colors.neutral.gray100,
    fontSize: isTV ? typography.size.lg : typography.size.sm, // Body: 14px
    fontWeight: '500' as any,
    letterSpacing: typography.letterSpacing.wide,
  },
  metadataDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.gray300,
    marginHorizontal: spacing.xs,
  },
  description: {
    color: colors.neutral.gray100,
    fontSize: isTV ? typography.size.xl : isMobile ? typography.size.base : typography.size.md, // Body: 15-16px
    lineHeight: isTV ? 32 : isMobile ? 24 : 26,
    fontWeight: '400' as any,
    marginBottom: spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    maxWidth: isTV ? 800 : 520,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttonSpacing: {
    width: spacing.sm,
  },
  playIcon: {
    fontSize: isTV ? typography.size.lg : typography.size.md,
    color: colors.neutral.white,
  },
  infoIcon: {
    fontSize: isTV ? typography.size.lg : typography.size.md,
    color: colors.neutral.white,
  },
  // Small heart/favorite icon button
  iconButton: {
    width: isTV ? 52 : 44,
    height: isTV ? 52 : 44,
    borderRadius: isTV ? 26 : 22,
    backgroundColor: rgba(colors.neutral.white, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: rgba(colors.neutral.white, 0.4),
    // No heavy shadows - clean modern look
  },
  iconButtonActive: {
    backgroundColor: rgba(colors.primary.accent, 0.2),
    borderColor: colors.primary.accent,
  },
  iconButtonText: {
    fontSize: isTV ? typography.size.xl : typography.size.lg,
    color: colors.neutral.white,
  },
  iconButtonTextActive: {
    color: colors.primary.accent,
  },
});
