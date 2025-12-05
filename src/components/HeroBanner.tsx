import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, rgba } from '../constants/theme';
import { getHeroBannerHeight, isTV, isMobile } from '../utils/responsive';

const { width, height } = Dimensions.get('window');
// Dynamic cinematic hero height (80-90vh)
const HERO_HEIGHT = getHeroBannerHeight();

interface HeroBannerProps {
  title: string;
  description?: string;
  imageUrl?: string;
  rating?: string | number;
  genre?: string;
  onPlayPress: () => void;
  onInfoPress: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  description,
  imageUrl,
  rating,
  genre,
  onPlayPress,
  onInfoPress,
  isFavorite,
  onFavoritePress,
}) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={imageUrl ? { uri: imageUrl } : undefined}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Cinematic Gradient Overlays */}
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
        {/* Side gradient for depth */}
        <LinearGradient
          colors={[
            'rgba(18, 18, 18, 0.5)',
            'rgba(18, 18, 18, 0.2)',
            'transparent',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.4, y: 0.5 }}
          style={styles.sideGradient}
        />

        {/* Content - Lower left positioning */}
        <View style={styles.content}>
          <View style={styles.info}>
            {/* Title - Large bold typography */}
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            {/* Metadata */}
            <View style={styles.metadata}>
              {rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingIcon}>⭐</Text>
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
              )}
              {genre && (
                <View style={styles.genreContainer}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            {description && (
              <Text style={styles.description} numberOfLines={3}>
                {description}
              </Text>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={onPlayPress}
                activeOpacity={0.8}
              >
                <Text style={styles.playIcon}>▶</Text>
                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.infoButton}
                onPress={onInfoPress}
                activeOpacity={0.8}
              >
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>More Info</Text>
              </TouchableOpacity>

              {onFavoritePress && (
                <TouchableOpacity
                  style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                  onPress={onFavoritePress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: HERO_HEIGHT, // Cinematic 80-90vh height
    marginBottom: 0, // Edge-to-edge design
  },
  background: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.darkGray,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sideGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: isTV ? spacing.huge : isMobile ? spacing.lg : spacing.xxxl,
    paddingBottom: isTV ? spacing.huge : isMobile ? spacing.xxl : spacing.xxxl,
  },
  info: {
    maxWidth: isTV ? 900 : isMobile ? '100%' : 700,
  },
  title: {
    color: colors.neutral.white,
    fontSize: isTV ? 72 : isMobile ? 36 : 56, // Large bold typography 48-64px
    fontWeight: '800' as any,
    letterSpacing: -1.5,
    marginBottom: spacing.lg,
    lineHeight: isTV ? 80 : isMobile ? 42 : 64,
    textShadow: '0 6px 20px rgba(0, 0, 0, 0.9)',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.base,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: rgba(colors.primary.black, 0.85),
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: rgba(colors.secondary.orange, 0.4),
  },
  ratingIcon: {
    fontSize: typography.size.base,
  },
  ratingText: {
    color: colors.secondary.orange,
    fontSize: typography.size.md,
    fontWeight: '800' as any,
    letterSpacing: typography.letterSpacing.wide,
  },
  genreContainer: {
    backgroundColor: rgba(colors.primary.accent, 0.18),
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: rgba(colors.primary.accent, 0.5),
  },
  genreText: {
    color: colors.primary.accent,
    fontSize: typography.size.md,
    fontWeight: '700' as any,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase' as any,
  },
  description: {
    color: colors.neutral.gray100,
    fontSize: isTV ? typography.size.xl : isMobile ? typography.size.base : typography.size.lg,
    lineHeight: isTV ? 32 : isMobile ? 22 : 28,
    marginBottom: spacing.xl,
    fontWeight: '400' as any,
    maxWidth: isTV ? 800 : 550,
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  // Primary Play button - Solid red, minimal rounded corners
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.accent, // Solid red
    paddingHorizontal: isTV ? spacing.xxl : spacing.xl,
    paddingVertical: isTV ? spacing.lg : spacing.md,
    borderRadius: borderRadius.button, // Minimal 4-6px corners
    gap: spacing.sm,
    minWidth: isTV ? 180 : 140,
    // No heavy shadows
  },
  playIcon: {
    fontSize: isTV ? typography.size.xl : typography.size.lg,
    color: colors.neutral.white, // White icon
  },
  playText: {
    color: colors.neutral.white, // White text
    fontSize: isTV ? typography.size.lg : typography.size.md,
    fontWeight: '600' as any,
    letterSpacing: typography.letterSpacing.wide,
  },
  // More Info button - Transparent with white border
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: isTV ? spacing.xxl : spacing.xl,
    paddingVertical: isTV ? spacing.lg : spacing.md,
    borderRadius: borderRadius.button, // Minimal 4-6px corners
    gap: spacing.sm,
    minWidth: isTV ? 160 : 130,
    borderWidth: 2,
    borderColor: rgba(colors.neutral.white, 0.7),
    // No heavy shadows
  },
  infoIcon: {
    fontSize: isTV ? typography.size.lg : typography.size.md,
  },
  infoText: {
    color: colors.neutral.white,
    fontSize: isTV ? typography.size.lg : typography.size.md,
    fontWeight: '600' as any,
    letterSpacing: typography.letterSpacing.wide,
  },
  // Small heart/favorite icon button
  favoriteButton: {
    width: isTV ? 52 : 44,
    height: isTV ? 52 : 44,
    borderRadius: isTV ? 26 : 22,
    backgroundColor: rgba(colors.neutral.white, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: rgba(colors.neutral.white, 0.4),
    // No heavy shadows
  },
  favoriteButtonActive: {
    backgroundColor: rgba(colors.primary.accent, 0.2),
    borderColor: colors.primary.accent,
  },
  favoriteIcon: {
    fontSize: isTV ? typography.size.xl : typography.size.lg,
  },
});
