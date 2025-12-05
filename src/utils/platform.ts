/**
 * Platform Detection and Adaptation Utilities
 * 
 * Detects specific platforms (LG webOS, Samsung Tizen, Android TV, iOS, etc.)
 * and provides platform-specific UI guidelines and optimizations.
 */

import { Platform } from 'react-native';
import { isTV, isWebOS, isTizen, isAndroidTV, isAppleTV, isIOS, isAndroid, isWeb } from './responsive';

// Platform types
export type PlatformType = 
  | 'lg-webos'
  | 'samsung-tizen'
  | 'android-tv'
  | 'apple-tv'
  | 'ios'
  | 'android'
  | 'web'
  | 'unknown';

// Platform capabilities
export interface PlatformCapabilities {
  supportsHDR: boolean;
  supportsDolbyVision: boolean;
  supportsDolbyAtmos: boolean;
  supports4K: boolean;
  supports8K: boolean;
  supportsTouch: boolean;
  supportsRemote: boolean;
  supportsKeyboard: boolean;
  supportsMouse: boolean;
  supportsVoiceControl: boolean;
  recommendedFocusSize: number;
  recommendedTouchTarget: number;
  safePadding: number;
  focusScale: number;
}

// Get user agent
const getUserAgent = (): string => {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.userAgent.toLowerCase();
  }
  return '';
};

// Detect specific platform
export const detectPlatform = (): PlatformType => {
  const userAgent = getUserAgent();
  
  if (isWebOS || userAgent.includes('web0s') || userAgent.includes('netcast')) {
    return 'lg-webos';
  }
  
  if (isTizen || userAgent.includes('tizen') || userAgent.includes('smarttv')) {
    return 'samsung-tizen';
  }
  
  if (isAndroidTV) {
    return 'android-tv';
  }
  
  if (isAppleTV) {
    return 'apple-tv';
  }
  
  if (isIOS) {
    return 'ios';
  }
  
  if (isAndroid) {
    return 'android';
  }
  
  if (isWeb || Platform.OS === 'web') {
    return 'web';
  }
  
  return 'unknown';
};

// Get platform capabilities
export const getPlatformCapabilities = (platform?: PlatformType): PlatformCapabilities => {
  const detectedPlatform = platform || detectPlatform();
  
  const baseCapabilities: PlatformCapabilities = {
    supportsHDR: false,
    supportsDolbyVision: false,
    supportsDolbyAtmos: false,
    supports4K: false,
    supports8K: false,
    supportsTouch: false,
    supportsRemote: false,
    supportsKeyboard: false,
    supportsMouse: false,
    supportsVoiceControl: false,
    recommendedFocusSize: 44,
    recommendedTouchTarget: 44,
    safePadding: 16,
    focusScale: 1.05,
  };
  
  switch (detectedPlatform) {
    case 'lg-webos':
      return {
        ...baseCapabilities,
        supportsHDR: true,
        supportsDolbyVision: true,
        supportsDolbyAtmos: true,
        supports4K: true,
        supports8K: true,
        supportsRemote: true,
        supportsKeyboard: true,
        supportsMouse: true,
        supportsVoiceControl: true,
        recommendedFocusSize: 80,
        recommendedTouchTarget: 80,
        safePadding: 60, // TV overscan
        focusScale: 1.1,
      };
      
    case 'samsung-tizen':
      return {
        ...baseCapabilities,
        supportsHDR: true,
        supportsDolbyVision: false, // Samsung uses HDR10+
        supportsDolbyAtmos: true,
        supports4K: true,
        supports8K: true,
        supportsRemote: true,
        supportsKeyboard: true,
        supportsMouse: true,
        supportsVoiceControl: true,
        recommendedFocusSize: 80,
        recommendedTouchTarget: 80,
        safePadding: 60,
        focusScale: 1.1,
      };
      
    case 'android-tv':
      return {
        ...baseCapabilities,
        supportsHDR: true,
        supportsDolbyVision: true,
        supportsDolbyAtmos: true,
        supports4K: true,
        supportsRemote: true,
        supportsKeyboard: true,
        supportsMouse: true,
        supportsVoiceControl: true,
        recommendedFocusSize: 72,
        recommendedTouchTarget: 72,
        safePadding: 48,
        focusScale: 1.08,
      };
      
    case 'apple-tv':
      return {
        ...baseCapabilities,
        supportsHDR: true,
        supportsDolbyVision: true,
        supportsDolbyAtmos: true,
        supports4K: true,
        supportsRemote: true, // Siri Remote with touchpad
        supportsKeyboard: true,
        supportsVoiceControl: true,
        recommendedFocusSize: 72,
        recommendedTouchTarget: 72,
        safePadding: 90, // Apple TV safe zones
        focusScale: 1.08,
      };
      
    case 'ios':
      return {
        ...baseCapabilities,
        supportsTouch: true,
        supportsKeyboard: true,
        supportsVoiceControl: true,
        recommendedFocusSize: 44,
        recommendedTouchTarget: 44, // iOS HIG minimum
        safePadding: 16,
        focusScale: 1.02,
      };
      
    case 'android':
      return {
        ...baseCapabilities,
        supportsTouch: true,
        supportsKeyboard: true,
        supportsVoiceControl: true,
        recommendedFocusSize: 48,
        recommendedTouchTarget: 48, // Material Design minimum
        safePadding: 16,
        focusScale: 1.02,
      };
      
    case 'web':
      return {
        ...baseCapabilities,
        supportsTouch: true,
        supportsKeyboard: true,
        supportsMouse: true,
        recommendedFocusSize: 44,
        recommendedTouchTarget: 44,
        safePadding: 16,
        focusScale: 1.05,
      };
      
    default:
      return baseCapabilities;
  }
};

// Platform-specific UI guidelines
export interface PlatformGuidelines {
  focusIndicatorColor: string;
  focusIndicatorWidth: number;
  primaryActionColor: string;
  navigationPattern: 'spatial' | 'sequential' | 'pointer';
  preferredCardShape: 'rounded' | 'square';
  animationDuration: number;
  transitionStyle: 'fade' | 'slide' | 'scale';
}

export const getPlatformGuidelines = (platform?: PlatformType): PlatformGuidelines => {
  const detectedPlatform = platform || detectPlatform();
  
  const baseGuidelines: PlatformGuidelines = {
    focusIndicatorColor: '#FFFFFF',
    focusIndicatorWidth: 3,
    primaryActionColor: '#E50914',
    navigationPattern: 'pointer',
    preferredCardShape: 'rounded',
    animationDuration: 300,
    transitionStyle: 'fade',
  };
  
  switch (detectedPlatform) {
    case 'lg-webos':
      return {
        ...baseGuidelines,
        focusIndicatorColor: '#FFFFFF',
        focusIndicatorWidth: 4,
        primaryActionColor: '#A50034', // LG magenta
        navigationPattern: 'spatial',
        preferredCardShape: 'rounded',
        animationDuration: 250,
        transitionStyle: 'scale',
      };
      
    case 'samsung-tizen':
      return {
        ...baseGuidelines,
        focusIndicatorColor: '#FFFFFF',
        focusIndicatorWidth: 4,
        primaryActionColor: '#1428A0', // Samsung blue
        navigationPattern: 'spatial',
        preferredCardShape: 'rounded',
        animationDuration: 250,
        transitionStyle: 'scale',
      };
      
    case 'android-tv':
      return {
        ...baseGuidelines,
        focusIndicatorColor: '#FFFFFF',
        focusIndicatorWidth: 3,
        primaryActionColor: '#3DDC84', // Android green
        navigationPattern: 'spatial',
        preferredCardShape: 'rounded',
        animationDuration: 300,
        transitionStyle: 'scale',
      };
      
    case 'apple-tv':
      return {
        ...baseGuidelines,
        focusIndicatorColor: '#FFFFFF',
        focusIndicatorWidth: 0, // Apple TV uses parallax effect
        primaryActionColor: '#007AFF', // iOS blue
        navigationPattern: 'spatial',
        preferredCardShape: 'rounded',
        animationDuration: 350,
        transitionStyle: 'scale',
      };
      
    case 'ios':
      return {
        ...baseGuidelines,
        focusIndicatorColor: '#007AFF',
        focusIndicatorWidth: 2,
        primaryActionColor: '#007AFF',
        navigationPattern: 'sequential',
        preferredCardShape: 'rounded',
        animationDuration: 350,
        transitionStyle: 'slide',
      };
      
    case 'android':
      return {
        ...baseGuidelines,
        focusIndicatorColor: '#3DDC84',
        focusIndicatorWidth: 2,
        primaryActionColor: '#3DDC84',
        navigationPattern: 'sequential',
        preferredCardShape: 'rounded',
        animationDuration: 300,
        transitionStyle: 'fade',
      };
      
    default:
      return baseGuidelines;
  }
};

// Check if platform supports specific feature
export const platformSupports = (feature: keyof PlatformCapabilities): boolean => {
  const capabilities = getPlatformCapabilities();
  return capabilities[feature] as boolean;
};

// Get platform name for display
export const getPlatformDisplayName = (platform?: PlatformType): string => {
  const detectedPlatform = platform || detectPlatform();
  
  const names: Record<PlatformType, string> = {
    'lg-webos': 'LG Smart TV',
    'samsung-tizen': 'Samsung Smart TV',
    'android-tv': 'Android TV',
    'apple-tv': 'Apple TV',
    'ios': 'iOS',
    'android': 'Android',
    'web': 'Web',
    'unknown': 'Unknown Platform',
  };
  
  return names[detectedPlatform];
};

// Platform-specific optimizations
export const getPlatformOptimizations = (platform?: PlatformType) => {
  const detectedPlatform = platform || detectPlatform();
  const isSmartTV = ['lg-webos', 'samsung-tizen', 'android-tv', 'apple-tv'].includes(detectedPlatform);
  
  return {
    // Image optimization
    imageQuality: isSmartTV ? 'high' : 'medium',
    enableLazyLoading: true,
    preloadDistance: isSmartTV ? 3 : 2, // Preload items ahead
    
    // Animation optimization
    useNativeDriver: true,
    reduceMotion: false,
    
    // Memory optimization
    maxCacheSize: isSmartTV ? 200 : 100, // MB
    enableVirtualization: true,
    
    // Network optimization
    maxConcurrentRequests: isSmartTV ? 6 : 4,
    enablePrefetch: true,
    
    // Rendering optimization
    enableHardwareAcceleration: true,
    fps: isSmartTV ? 60 : 60,
  };
};

export default {
  detectPlatform,
  getPlatformCapabilities,
  getPlatformGuidelines,
  platformSupports,
  getPlatformDisplayName,
  getPlatformOptimizations,
};
