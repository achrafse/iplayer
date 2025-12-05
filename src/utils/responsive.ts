import { Dimensions, Platform, PixelRatio } from 'react-native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference)
const BASE_WIDTH = 375; // iPhone SE/12 mini width as base
const BASE_HEIGHT = 667; // Standard safe height
const TABLET_WIDTH = 768; // iPad width
const TV_WIDTH = 1920; // Full HD TV

// Enhanced platform detection
const getUserAgent = () => {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.userAgent.toLowerCase();
  }
  return '';
};

const userAgent = getUserAgent();

// Web TV detection (for LG webOS and Samsung Tizen)
export const isWebOS = userAgent.includes('web0s') || userAgent.includes('webos') || userAgent.includes('netcast');
export const isTizen = userAgent.includes('tizen') || userAgent.includes('smart-tv') || userAgent.includes('smarttv');
export const isAndroidTV = Platform.isTV && Platform.OS === 'android';
export const isAppleTV = Platform.isTV && Platform.OS === 'ios';
export const isWebTV = isWebOS || isTizen;

// Consolidated TV detection
export const isTV = Platform.isTV || isWebOS || isTizen;

// Mobile and tablet detection
export const isMobile = !isTV && SCREEN_WIDTH < 768;
export const isTablet = !isTV && SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1280;
export const isDesktop = !isTV && SCREEN_WIDTH >= 1280 && SCREEN_WIDTH < 1920;
export const isLargeDesktop = !isTV && SCREEN_WIDTH >= 1920;

// TV resolution detection
export const isTVHD = isTV && SCREEN_WIDTH <= 1920; // HD/Full HD
export const isTV4K = isTV && SCREEN_WIDTH > 1920 && SCREEN_WIDTH <= 3840; // 4K
export const isTV8K = isTV && SCREEN_WIDTH > 3840; // 8K

// OS detection
export const isIOS = Platform.OS === 'ios' && !Platform.isTV;
export const isAndroid = Platform.OS === 'android' && !Platform.isTV;
export const isWeb = Platform.OS === 'web';

// Get device category
export const getDeviceCategory = (): 'mobile' | 'tablet' | 'desktop' | 'tv' => {
  if (isTV) return 'tv';
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};

// Platform-specific scaling functions
export const scale = (size: number): number => {
  if (isTV) {
    // TV scaling based on screen width
    const scaleFactor = SCREEN_WIDTH / TV_WIDTH;
    const tvMultiplier = SCREEN_WIDTH >= 3840 ? 2.8 : 2.2; // Higher multiplier for 4K+
    return Math.round(size * scaleFactor * tvMultiplier);
  }
  
  if (isTablet) {
    // Tablet scaling
    return Math.round((SCREEN_WIDTH / TABLET_WIDTH) * size * 1.2);
  }
  
  // Mobile scaling
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scaleFactor);
};

export const verticalScale = (size: number): number => {
  if (isTV) {
    const baseHeight = 1080;
    const scaleFactor = SCREEN_HEIGHT / baseHeight;
    const tvMultiplier = SCREEN_WIDTH >= 3840 ? 2.8 : 2.2;
    return Math.round(size * scaleFactor * tvMultiplier);
  }
  
  const scaleFactor = SCREEN_HEIGHT / BASE_HEIGHT;
  return Math.round(size * scaleFactor);
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  const scaled = scale(size);
  return Math.round(size + (scaled - size) * factor);
};

// Responsive font scaling with platform optimization
export const scaledFont = (size: number): number => {
  if (isTV) {
    // TV needs much larger fonts for 10ft viewing distance
    let multiplier = 2.2; // Base multiplier for Full HD
    
    if (SCREEN_WIDTH >= 3840) {
      multiplier = 3.0; // 4K/8K TVs
    } else if (SCREEN_WIDTH >= 2560) {
      multiplier = 2.6; // 2K TVs
    }
    
    return Math.round(size * multiplier);
  }
  
  if (isTablet) {
    // Tablets need slightly larger fonts
    return Math.round(size * 1.15);
  }
  
  // Mobile font scaling
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * Math.min(scaleFactor, 1.2); // Cap at 1.2x
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  
  return Math.round(newSize);
};

// Spacing scale with device-specific multipliers
export const scaleSpacing = (size: number): number => {
  if (isTV) {
    let multiplier = 2.5;
    if (SCREEN_WIDTH >= 3840) multiplier = 3.2; // 4K
    return Math.round(size * multiplier);
  }
  
  if (isTablet) {
    return Math.round(size * 1.3);
  }
  
  return moderateScale(size, 0.3);
};

// Get comprehensive responsive dimensions
export const getResponsiveDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isTV,
  isTVHD,
  isTV4K,
  isTV8K,
  isMobile,
  isTablet,
  isDesktop,
  isLargeDesktop,
  isIOS,
  isAndroid,
  isWebOS,
  isTizen,
  isAndroidTV,
  isAppleTV,
  category: getDeviceCategory(),
  orientation: SCREEN_WIDTH > SCREEN_HEIGHT ? 'landscape' : 'portrait',
});

// Smart card width calculations based on screen size and device
export const getCardWidth = (
  preferredColumns?: number,
  gap: number = 16,
  cardType: 'poster' | 'landscape' | 'square' = 'poster'
): number => {
  let columns = preferredColumns;
  
  // Auto-determine columns based on device and card type
  if (!columns) {
    if (isTV) {
      if (cardType === 'poster') {
        columns = SCREEN_WIDTH >= 3840 ? 8 : SCREEN_WIDTH >= 1920 ? 6 : 5;
      } else {
        columns = SCREEN_WIDTH >= 3840 ? 5 : SCREEN_WIDTH >= 1920 ? 4 : 3;
      }
    } else if (isMobile) {
      columns = cardType === 'landscape' ? 1.5 : 2.5; // Show partial next card
    } else if (isTablet) {
      columns = cardType === 'poster' ? 4 : 2.5;
    } else if (isDesktop) {
      columns = cardType === 'poster' ? 6 : 4;
    } else {
      columns = cardType === 'poster' ? 7 : 5;
    }
  }
  
  const scaledGap = scaleSpacing(gap);
  const totalGap = scaledGap * (columns + 1);
  return (SCREEN_WIDTH - totalGap) / columns;
};

// Header height with safe area
export const getHeaderHeight = (): number => {
  if (isTV) return scaleSpacing(96);
  if (isTablet) return 64;
  if (isMobile) return 56;
  return 72;
};

// Container padding (safe zones)
export const getContainerPadding = (): { horizontal: number; vertical: number } => {
  if (isTV) {
    const padding = scaleSpacing(48);
    return { horizontal: padding, vertical: padding };
  }
  if (isTablet) {
    return { horizontal: 32, vertical: 24 };
  }
  return { horizontal: 16, vertical: 16 };
};

// Content row padding
export const getRowPadding = (): number => {
  if (isTV) return scaleSpacing(48);
  if (isTablet) return 32;
  return 16;
};

// Episode card dimensions
export const getEpisodeCardWidth = (): number => {
  if (isTV) {
    return SCREEN_WIDTH >= 3840 ? 640 : SCREEN_WIDTH >= 1920 ? 480 : 400;
  }
  if (isTablet) return 360;
  if (isMobile) return Math.min(SCREEN_WIDTH - 32, 340);
  return 420;
};

// Poster dimensions (2:3 aspect ratio)
export const getPosterDimensions = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  let width = 150;
  
  // Size multipliers
  const sizeMultipliers = { sm: 0.8, md: 1, lg: 1.3, xl: 1.6 };
  const multiplier = sizeMultipliers[size];
  
  if (isTV) {
    width = (SCREEN_WIDTH >= 3840 ? 340 : SCREEN_WIDTH >= 1920 ? 280 : 240) * multiplier;
  } else if (isTablet) {
    width = 180 * multiplier;
  } else if (isMobile) {
    width = 130 * multiplier;
  } else {
    width = 200 * multiplier;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(width * 1.5), // 2:3 aspect ratio
  };
};

// Landscape card dimensions (16:9 aspect ratio)
export const getLandscapeDimensions = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  let width = 280;
  
  const sizeMultipliers = { sm: 0.8, md: 1, lg: 1.3, xl: 1.6 };
  const multiplier = sizeMultipliers[size];
  
  if (isTV) {
    width = (SCREEN_WIDTH >= 3840 ? 720 : SCREEN_WIDTH >= 1920 ? 560 : 480) * multiplier;
  } else if (isTablet) {
    width = 320 * multiplier;
  } else if (isMobile) {
    width = 240 * multiplier;
  } else {
    width = 380 * multiplier;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(width * (9 / 16)), // 16:9 aspect ratio
  };
};

// Hero banner dimensions - Cinematic full-screen style (80-90vh)
export const getHeroBannerHeight = (): number => {
  if (isTV) {
    // TV: 85% of screen height for immersive experience
    return Math.round(SCREEN_HEIGHT * 0.85);
  }
  if (isTablet) return Math.round(SCREEN_HEIGHT * 0.8);
  if (isMobile) return Math.round(SCREEN_HEIGHT * 0.75);
  // Web/Desktop: 85vh
  return Math.round(SCREEN_HEIGHT * 0.85);
};

// Button dimensions with platform adaptation
export const getButtonDimensions = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const sizes = {
    sm: { paddingV: 8, paddingH: 16, fontSize: 13, height: 32 },
    md: { paddingV: 12, paddingH: 24, fontSize: 15, height: 44 },
    lg: { paddingV: 16, paddingH: 32, fontSize: 17, height: 52 },
    xl: { paddingV: 20, paddingH: 40, fontSize: 19, height: 60 },
  };
  
  const base = sizes[size];
  
  if (isTV) {
    return {
      paddingVertical: scaleSpacing(base.paddingV),
      paddingHorizontal: scaleSpacing(base.paddingH),
      fontSize: scaledFont(base.fontSize),
      height: scaleSpacing(base.height),
    };
  }
  
  return {
    paddingVertical: base.paddingV,
    paddingHorizontal: base.paddingH,
    fontSize: base.fontSize,
    height: base.height,
  };
};

// Icon size with platform scaling
export const getIconSize = (base: number = 24): number => {
  if (isTV) {
    const multiplier = SCREEN_WIDTH >= 3840 ? 3.0 : 2.5;
    return Math.round(base * multiplier);
  }
  if (isTablet) return Math.round(base * 1.2);
  return base;
};

// Border radius scaling
export const getScaledRadius = (radius: number): number => {
  if (isTV) {
    const multiplier = SCREEN_WIDTH >= 3840 ? 2.0 : 1.5;
    return Math.round(radius * multiplier);
  }
  return radius;
};

// Grid column calculations
export const getGridColumns = (cardType: 'poster' | 'landscape' | 'square' = 'poster'): number => {
  if (isTV) {
    if (cardType === 'poster') return SCREEN_WIDTH >= 3840 ? 8 : 6;
    if (cardType === 'landscape') return SCREEN_WIDTH >= 3840 ? 5 : 4;
    return SCREEN_WIDTH >= 3840 ? 7 : 5;
  }
  
  if (isMobile) {
    if (cardType === 'landscape') return 1;
    return 2;
  }
  
  if (isTablet) {
    if (cardType === 'poster') return 4;
    if (cardType === 'landscape') return 2;
    return 3;
  }
  
  // Desktop
  if (cardType === 'poster') return 6;
  if (cardType === 'landscape') return 3;
  return 5;
};

// Safe area insets (for notches, TV overscan, etc.)
export const getSafeAreaInsets = () => {
  if (isTV) {
    // TV overscan protection
    const overscan = SCREEN_WIDTH >= 3840 ? 80 : 60;
    return { top: overscan, bottom: overscan, left: overscan, right: overscan };
  }
  
  // Mobile/tablet use platform safe areas
  return { top: 0, bottom: 0, left: 0, right: 0 };
};

// Optimal text line length for readability
export const getOptimalLineLength = (): number => {
  if (isTV) return Math.min(SCREEN_WIDTH * 0.6, 1200);
  if (isTablet) return Math.min(SCREEN_WIDTH * 0.75, 680);
  return Math.min(SCREEN_WIDTH - 32, 600);
};

// Touch target size (44px minimum for iOS, larger for TV)
export const getTouchTargetSize = (): number => {
  if (isTV) return scaleSpacing(80); // Larger for TV remote
  if (isIOS) return 44; // iOS HIG minimum
  return 48; // Material Design minimum
};

export default {
  // Scaling functions
  scale,
  verticalScale,
  moderateScale,
  scaledFont,
  scaleSpacing,
  
  // Dimension getters
  getResponsiveDimensions,
  getCardWidth,
  getHeaderHeight,
  getContainerPadding,
  getRowPadding,
  getEpisodeCardWidth,
  getPosterDimensions,
  getLandscapeDimensions,
  getHeroBannerHeight,
  getButtonDimensions,
  getIconSize,
  getScaledRadius,
  getGridColumns,
  getSafeAreaInsets,
  getOptimalLineLength,
  getTouchTargetSize,
  
  // Device detection
  isTV,
  isTVHD,
  isTV4K,
  isTV8K,
  isAndroidTV,
  isAppleTV,
  isWebTV,
  isWebOS,
  isTizen,
  isMobile,
  isTablet,
  isDesktop,
  isLargeDesktop,
  isIOS,
  isAndroid,
  isWeb,
  getDeviceCategory,
  
  // Screen dimensions
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};
