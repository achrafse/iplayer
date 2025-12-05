import { Platform } from 'react-native';

/**
 * TV Platform Detection
 */
export const isAndroidTV = Platform.isTV && Platform.OS === 'android';
export const isWebOS = typeof window !== 'undefined' && 
  (window.navigator.userAgent.includes('Web0S') || window.navigator.userAgent.includes('webOS'));
export const isTizen = typeof window !== 'undefined' && 
  (window.navigator.userAgent.includes('Tizen') || window.navigator.userAgent.includes('SMART-TV'));
export const isSmartTV = isWebOS || isTizen;

/**
 * TV Remote Control Key Codes
 */
export const TVKeys = {
  // LG webOS
  webOS: {
    BACK: 461,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    ENTER: 13,
    PLAY: 415,
    PAUSE: 19,
    STOP: 413,
    REWIND: 412,
    FAST_FORWARD: 417,
    RED: 403,
    GREEN: 404,
    YELLOW: 405,
    BLUE: 406,
  },
  // Samsung Tizen
  tizen: {
    BACK: 10009,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    ENTER: 13,
    PLAY: 415,
    PAUSE: 19,
    STOP: 413,
    REWIND: 412,
    FAST_FORWARD: 417,
    RED: 403,
    GREEN: 404,
    YELLOW: 405,
    BLUE: 406,
  },
  // Android TV
  androidTV: {
    BACK: 4,
    UP: 19,
    DOWN: 20,
    LEFT: 21,
    RIGHT: 22,
    ENTER: 23,
    PLAY: 126,
    PAUSE: 127,
    STOP: 86,
    REWIND: 89,
    FAST_FORWARD: 90,
  },
};

/**
 * Get platform-specific key codes
 */
export const getTVKeys = () => {
  if (isWebOS) return TVKeys.webOS;
  if (isTizen) return TVKeys.tizen;
  if (isAndroidTV) return TVKeys.androidTV;
  return null;
};

/**
 * Handle TV remote key events
 */
export const registerTVKeyListener = (
  onKeyDown: (keyCode: number, keyName: string) => void
) => {
  if (typeof window === 'undefined') return () => {};

  const keys = getTVKeys();
  if (!keys) return () => {};

  const handleKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.keyCode;
    
    // Find key name from code
    const keyEntry = Object.entries(keys).find(([_, code]) => code === keyCode);
    const keyName = keyEntry ? keyEntry[0] : 'UNKNOWN';
    
    // Prevent default browser behavior for TV keys
    if (keyEntry) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    onKeyDown(keyCode, keyName);
  };

  window.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Initialize TV platform-specific APIs
 */
export const initializeTVPlatform = () => {
  if (typeof window === 'undefined') return;

  try {
    // LG webOS initialization
    if (isWebOS && (window as any).webOS) {
      console.log('[TV] Initializing LG webOS platform');
      // Register keys for webOS
      const webOS = (window as any).webOS;
      if (webOS.platformBack) {
        webOS.platformBack.registerBackKey();
      }
    }

    // Samsung Tizen initialization
    if (isTizen && (window as any).tizen) {
      console.log('[TV] Initializing Samsung Tizen platform');
      const tizen = (window as any).tizen;
      
      // Register TV input device
      if (tizen.tvinputdevice) {
        try {
          const supportedKeys = [
            'MediaPlay',
            'MediaPause',
            'MediaStop',
            'MediaRewind',
            'MediaFastForward',
            'ColorF0Red',
            'ColorF1Green',
            'ColorF2Yellow',
            'ColorF3Blue',
          ];
          
          tizen.tvinputdevice.registerKeyBatch(supportedKeys);
          console.log('[TV] Registered Tizen key batch');
        } catch (error) {
          console.warn('[TV] Failed to register Tizen keys:', error);
        }
      }
    }

    // Android TV initialization
    if (isAndroidTV) {
      console.log('[TV] Running on Android TV');
      // Android TV key handling is built into React Native
    }
  } catch (error) {
    console.error('[TV] Platform initialization error:', error);
  }
};

/**
 * Get spatial navigation CSS for web-based TVs
 */
export const getSpatialNavigationCSS = () => {
  if (!isSmartTV) return '';
  
  return `
    * {
      /* Enable spatial navigation for LG/Samsung TVs */
      -webkit-user-select: none;
      user-select: none;
    }
    
    button, a, [role="button"], input {
      /* Make focusable elements navigable */
      cursor: pointer;
    }
    
    button:focus, a:focus, [role="button"]:focus {
      /* Highlight focused elements */
      outline: 4px solid #ff0050;
      outline-offset: 4px;
    }
  `;
};

/**
 * Check if running on any TV platform
 */
export const isAnyTV = Platform.isTV || isWebOS || isTizen;

export default {
  isAndroidTV,
  isWebOS,
  isTizen,
  isSmartTV,
  isAnyTV,
  TVKeys,
  getTVKeys,
  registerTVKeyListener,
  initializeTVPlatform,
  getSpatialNavigationCSS,
};
