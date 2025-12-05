// Modern Streaming Design System - Industry Standard
// Inspired by Netflix, Disney+, Apple TV+, Prime Video, HBO Max, Shahid
// Optimized for: LG webOS, Samsung Tizen, Android TV, Android Mobile, iOS, Web

export const colors = {
  // Primary palette - Premium Dark Theme (Netflix/Disney+ style)
  primary: {
    black: '#0a0a0a',      // True dark background - premium feel
    background: '#121212', // Main app background
    darkGray: '#141414',   // Dark gray - secondary background
    mediumGray: '#1a1a1a', // Medium gray - card backgrounds
    lightGray: '#2a2a2a',  // Light gray - elevated surfaces/borders
    accent: '#E50914',     // Vibrant red - primary CTA
    accentHover: '#B20710',// Darker red hover
    accentLight: '#FF1F28',// Lighter red
    accentGlow: 'rgba(229, 9, 20, 0.4)', // Red glow effect
    blue: '#0071EB',       // Disney+ blue alternative
    blueHover: '#0056B3',  // Blue hover state
  },
  
  // Secondary palette - Rich & Vibrant
  secondary: {
    purple: '#9B59B6',     // Premium purple
    purpleHover: '#8E44AD',
    purpleDark: '#6C3483',
    gold: '#FFB800',       // Premium gold
    goldHover: '#FFA000',
    orange: '#FF6B35',     // Vibrant orange for ratings
    orangeHover: '#FF5722',
    green: '#00D46A',      // Fresh green for success
    greenHover: '#00B156',
    cyan: '#00D9FF',       // Electric cyan
    cyanHover: '#00B8D4',
    magenta: '#FF006E',    // Hot pink/magenta
    magentaHover: '#D6005E',
  },
  
  // Neutrals - Premium high contrast for readability
  neutral: {
    white: '#FFFFFF',      // Pure white for primary text (100% opacity)
    offWhite: '#F8F8F8',   // Slightly off-white for softer headings
    gray50: '#E5E5E5',     // Very light gray for secondary text
    gray100: '#CCCCCC',    // Light gray
    gray200: '#A3A3A3',    // Medium-light gray for descriptions
    gray300: '#737373',    // Medium gray for tertiary/muted text
    gray400: '#525252',    // Dark gray for subtle elements
    gray500: '#404040',    // Darker gray for borders
    gray600: '#2a2a2a',    // Card background elevated
    gray700: '#1a1a1a',    // Card background standard
    gray800: '#141414',    // Surface background
    gray900: '#0a0a0a',    // Deep background
    pure: '#000000',       // Pure black for OLED
  },
  
  // Gradients - Premium streaming aesthetics
  gradients: {
    primary: ['#0a0a0a', '#121212'],
    background: ['#121212', '#0a0a0a'],
    hero: ['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.4)', 'rgba(18, 18, 18, 0.9)', 'rgba(18, 18, 18, 1)'],
    heroVertical: ['transparent', 'rgba(10, 10, 10, 0.3)', 'rgba(18, 18, 18, 0.85)', 'rgba(18, 18, 18, 1)'],
    overlay: ['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.6)', 'rgba(18, 18, 18, 0.95)'],
    overlayLight: ['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.35)', 'rgba(18, 18, 18, 0.75)'],
    card: ['rgba(26, 26, 26, 0.85)', 'rgba(20, 20, 20, 0.95)'],
    cardHover: ['rgba(42, 42, 42, 0.9)', 'rgba(26, 26, 26, 0.98)'],
    glass: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)'],
    glassHover: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)'],
    accent: ['#E50914', '#B20710'],
    accentGlow: ['rgba(229, 9, 20, 0.5)', 'rgba(229, 9, 20, 0.1)'],
    accentBlue: ['#0071EB', '#0056B3'],
    accentPurple: ['#9B59B6', '#8E44AD'],
    shine: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0)'],
    shimmer: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0)'],
    darkFade: ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 1)'],
  },
  
  // Semantic colors - Clear visual feedback
  semantic: {
    success: '#00D46A',
    successDark: '#00B156',
    successLight: '#00FF87',
    error: '#FF3B30',
    errorDark: '#DC2626',
    errorLight: '#FF6B68',
    warning: '#FFB800',
    warningDark: '#FFA000',
    warningLight: '#FFD54F',
    info: '#0071EB',
    infoDark: '#0056B3',
    infoLight: '#40A9FF',
    live: '#FF0000',
    liveGlow: 'rgba(255, 0, 0, 0.5)',
  },
  
  // Focus states - Enhanced TV navigation with vibrant red
  focus: {
    ring: '#FFFFFF',
    ringAccent: '#E50914',
    ringThick: '#E50914',
    ringOpacity: 0.95,
    shadow: '0 0 0 3px rgba(255, 255, 255, 0.6)',
    shadowAccent: '0 0 0 3px rgba(229, 9, 20, 0.8)',
    glow: '0 0 20px rgba(255, 255, 255, 0.5)',
    glowAccent: '0 0 30px rgba(229, 9, 20, 0.7)',
    glowIntense: '0 0 40px rgba(229, 9, 20, 0.9)',
  },
  
  // Platform-specific brand colors
  platform: {
    lg: '#A50034',      // LG magenta
    samsung: '#1428A0', // Samsung blue
    android: '#3DDC84', // Android green
    ios: '#007AFF',     // iOS blue
    apple: '#000000',   // Apple black
  },
};

export const typography = {
  // Font sizes - Proper visual hierarchy
  // Hero (48-64px) → Headers (24-32px) → Body (14-16px)
  size: {
    // Mobile sizes (iOS/Android phones)
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    xxxl: 32,
    display: 48,
    hero: 56,
    giant: 72,
    
    // Tablet sizes
    tablet: {
      xs: 12,
      sm: 14,
      base: 16,
      md: 18,
      lg: 20,
      xl: 24,
      xxl: 30,
      xxxl: 40,
      display: 56,
      hero: 64,
      giant: 80,
    },
    
    // Desktop sizes - Full hierarchy
    desktop: {
      xs: 12,
      sm: 14,
      base: 16,
      md: 18,
      lg: 20,
      xl: 26,
      xxl: 32,
      xxxl: 42,
      display: 56,
      hero: 64,
      giant: 80,
    },
    
    // TV-optimized sizes (10ft viewing distance)
    tv: {
      xs: 18,
      sm: 22,
      base: 26,
      md: 30,
      lg: 36,
      xl: 42,
      xxl: 48,
      xxxl: 56,
      display: 72,
      hero: 96,
      giant: 120,
    },
  },
  
  // Font weights
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.875,
  },
  
  // Letter spacing - Enhanced for all-caps labels
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
    caps: 2,         // For all-caps labels
    capsWide: 2.5,   // For prominent all-caps
  },
  
  // Font families - Clean sans-serif (Inter, SF Pro Display)
  family: {
    // iOS uses SF Pro, Android uses Roboto, Web uses Inter
    primary: 'System',
    ios: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"',
    android: 'Roboto, "Noto Sans", sans-serif',
    web: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, Consolas, "Courier New", monospace',
    display: 'System', // For hero text
  },
};

export const spacing = {
  // Base 4px scale for mobile
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,   // Desktop horizontal margins
  giant: 80,     // Large desktop horizontal margins
  ultra: 96,
  extreme: 120,  // Extra large spacing
  
  // Desktop margins (60-80px)
  desktop: {
    margin: 64,      // Standard horizontal margin
    marginLarge: 80, // Large horizontal margin
    section: 60,     // Section spacing
  },
  
  // TV spacing (larger for 10ft viewing)
  tv: {
    xxs: 4,
    xs: 8,
    sm: 16,
    md: 24,
    base: 32,
    lg: 40,
    xl: 48,
    xxl: 64,
    xxxl: 80,
    huge: 96,
    massive: 128,
    giant: 160,
    ultra: 192,
  },
};

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,        // Button radius (4-6px minimal)
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  huge: 32,
  round: 9999,
  
  // Button-specific radius
  button: 6,    // Minimal rounded corners for modern buttons
  
  // TV radius (slightly larger)
  tv: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    button: 8,  // TV button radius
    round: 9999,
  },
};

export const shadows = {
  none: {
    boxShadow: 'none',
    elevation: 0,
  },
  xs: {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.18)',
    elevation: 1,
  },
  sm: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.22)',
    elevation: 3,
  },
  md: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  lg: {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  xl: {
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.35)',
    elevation: 12,
  },
  xxl: {
    boxShadow: '0 20px 32px rgba(0, 0, 0, 0.4)',
    elevation: 16,
  },
  // Colored shadows for accents
  accent: {
    boxShadow: `0 8px 16px rgba(229, 9, 20, 0.4)`,
    elevation: 8,
  },
  focus: {
    boxShadow: '0 0 12px rgba(255, 255, 255, 0.6)',
    elevation: 10,
  },
  glow: (color: string, opacity: number = 0.5) => ({
    boxShadow: `0 0 20px ${color}`,
    elevation: 10,
  }),
  colored: (color: string, opacity: number = 0.4) => ({
    boxShadow: `0 8px 16px ${color}`,
    elevation: 8,
  }),
};

export const animations = {
  // Animation durations (in ms) - Smooth modern transitions
  duration: {
    instant: 100,
    fast: 150,
    normal: 200,    // Primary button transition
    smooth: 250,    // Smooth hover/press
    slow: 300,      // Complex transitions
    slower: 400,
    slowest: 600,
  },
  
  // Spring configs for smooth animations
  spring: {
    // Bouncy spring (for scale animations)
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 0.8,
    },
    // Smooth spring (for position animations)
    smooth: {
      damping: 20,
      stiffness: 150,
      mass: 1,
    },
    // Snappy spring (for quick interactions)
    snappy: {
      damping: 25,
      stiffness: 200,
      mass: 0.5,
    },
  },
  
  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom bezier curves
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    emphasized: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  },
  
  // Scale values for interactions
  scale: {
    focus: 1.05,      // TV focus scale
    focusLarge: 1.1,  // Large element focus
    press: 0.95,      // Button press
    hover: 1.02,      // Mouse hover
  },
};

export const layout = {
  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
    xxxl: 1920,
    ultra: 2560,
  },
  
  // Grid gaps
  gap: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  
  // Card dimensions (Mobile)
  card: {
    // Poster (2:3 ratio) - Movie posters
    poster: {
      sm: { width: 120, aspectRatio: 2 / 3 },
      md: { width: 150, aspectRatio: 2 / 3 },
      lg: { width: 180, aspectRatio: 2 / 3 },
      xl: { width: 220, aspectRatio: 2 / 3 },
    },
    
    // Landscape (16:9 ratio) - Shows/Episodes
    landscape: {
      sm: { width: 200, aspectRatio: 16 / 9 },
      md: { width: 280, aspectRatio: 16 / 9 },
      lg: { width: 360, aspectRatio: 16 / 9 },
      xl: { width: 440, aspectRatio: 16 / 9 },
    },
    
    // Square (1:1 ratio) - Categories/Channels
    square: {
      sm: { width: 100, aspectRatio: 1 },
      md: { width: 140, aspectRatio: 1 },
      lg: { width: 180, aspectRatio: 1 },
    },
    
    // Wide (21:9) - Hero banners
    wide: {
      aspectRatio: 21 / 9,
    },
  },
  
  // TV card dimensions (larger for 10ft viewing)
  cardTV: {
    poster: {
      sm: { width: 220, aspectRatio: 2 / 3 },
      md: { width: 280, aspectRatio: 2 / 3 },
      lg: { width: 340, aspectRatio: 2 / 3 },
      xl: { width: 420, aspectRatio: 2 / 3 },
    },
    landscape: {
      sm: { width: 360, aspectRatio: 16 / 9 },
      md: { width: 480, aspectRatio: 16 / 9 },
      lg: { width: 600, aspectRatio: 16 / 9 },
      xl: { width: 720, aspectRatio: 16 / 9 },
    },
    square: {
      sm: { width: 180, aspectRatio: 1 },
      md: { width: 240, aspectRatio: 1 },
      lg: { width: 300, aspectRatio: 1 },
    },
  },
  
  // Header heights
  header: {
    mobile: 56,
    tablet: 64,
    desktop: 72,
    tv: 96,
  },
  
  // Hero banner heights
  hero: {
    mobile: 400,
    tablet: 500,
    desktop: 600,
    tv: 800,
  },
};

export const breakpoints = {
  // Mobile
  mobile: 0,
  mobileSm: 360,      // Small phones
  mobileMd: 375,      // iPhone SE, iPhone 12 mini
  mobileLg: 414,      // iPhone 11 Pro Max, Pixel
  mobileXl: 480,      // Large phones
  
  // Tablet
  tablet: 768,        // iPad portrait
  tabletLg: 1024,     // iPad landscape
  
  // Desktop
  desktop: 1280,      // Desktop
  desktopLg: 1440,    // Large desktop
  desktopXl: 1920,    // Full HD
  
  // TV
  tv: 1920,           // Full HD TV
  tvLg: 2560,         // 2K TV
  tv4k: 3840,         // 4K TV
  tv8k: 7680,         // 8K TV
};

// Device type ranges
export const deviceTypes = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1279 },
  desktop: { min: 1280, max: 1919 },
  tv: { min: 1920, max: 9999 },
};

// Platform identifiers
export const platforms = {
  ios: 'ios',
  android: 'android',
  androidTV: 'androidtv',
  web: 'web',
  lgWebOS: 'webos',
  samsungTizen: 'tizen',
};

// Helper functions
export const rgba = (hex: string, alpha: number): string => {
  // Validate hex input
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    console.warn(`Invalid hex color: ${hex}`);
    return `rgba(0, 0, 0, ${alpha})`; // Fallback to black
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getResponsiveValue = (mobile: number, tablet: number, desktop: number, width: number) => {
  if (width >= breakpoints.desktop) return desktop;
  if (width >= breakpoints.tablet) return tablet;
  return mobile;
};

// Common component styles
export const commonStyles = {
  // Backdrop blur effect (for modals, overlays)
  backdrop: {
    backgroundColor: rgba(colors.primary.black, 0.85),
    backdropFilter: 'blur(24px)',
  },
  
  // Glass morphism effect
  glass: {
    backgroundColor: rgba(colors.neutral.white, 0.05),
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.1),
    backdropFilter: 'blur(12px)',
  },
  
  // Glass morphism (dark variant)
  glassDark: {
    backgroundColor: rgba(colors.primary.black, 0.4),
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.1),
    backdropFilter: 'blur(16px)',
  },
  
  // Frosted glass effect
  frosted: {
    backgroundColor: rgba(colors.neutral.white, 0.08),
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.15),
    backdropFilter: 'blur(20px) saturate(180%)',
  },
  
  // Gradient overlay
  gradientOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  
  // Focus ring (TV navigation)
  focusRing: {
    borderWidth: 3,
    borderColor: colors.focus.ring,
    boxShadow: '0 0 12px rgba(229, 9, 20, 0.8)',
    elevation: 10,
  },
  
  // Focus ring with accent
  focusRingAccent: {
    borderWidth: 4,
    borderColor: colors.primary.accent,
    boxShadow: '0 0 16px rgba(229, 9, 20, 0.6)',
    elevation: 12,
  },
  
  // Card base style
  cardBase: {
    backgroundColor: colors.primary.mediumGray,
    borderRadius: borderRadius.lg,
    overflow: 'hidden' as const,
  },
  
  // Shimmer loading effect
  shimmer: {
    backgroundColor: colors.neutral.gray700,
  },
};

// Z-index layering system
export const zIndex = {
  base: 0,
  content: 1,
  card: 10,
  cardHover: 15,
  dropdown: 100,
  sticky: 200,
  header: 500,
  overlay: 900,
  modal: 1000,
  popover: 1100,
  tooltip: 1200,
  notification: 1300,
  max: 9999,
};

// Opacity levels
export const opacity = {
  disabled: 0.38,
  hover: 0.08,
  focus: 0.12,
  selected: 0.16,
  activated: 0.24,
};

// Export responsive utilities
export { default as responsive } from '../utils/responsive';

// Default export with all theme tokens
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  layout,
  breakpoints,
  deviceTypes,
  platforms,
  zIndex,
  opacity,
  rgba,
  getResponsiveValue,
  commonStyles,
};
