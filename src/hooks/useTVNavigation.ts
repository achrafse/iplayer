import { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

type Direction = 'up' | 'down' | 'left' | 'right';
type TVEventType = 'focus' | 'blur' | 'select' | 'playPause' | 'menu' | 'longSelect';

// TV Event Handler mock for platforms that don't support it
class TVEventHandlerMock {
  enable(_component: any, _callback: (cmp: any, evt: any) => void) {
    return null;
  }
  disable() {}
}

interface TVNavigationConfig {
  onFocus?: () => void;
  onBlur?: () => void;
  onSelect?: () => void;
  onLongSelect?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onPlayPause?: () => void;
  onMenu?: () => void;
  enabled?: boolean;
}

/**
 * Hook for TV remote control navigation
 * Handles D-pad navigation, focus management, and TV events
 */
export const useTVNavigation = (config: TVNavigationConfig) => {
  const {
    onFocus,
    onBlur,
    onSelect,
    onLongSelect,
    onUp,
    onDown,
    onLeft,
    onRight,
    onPlayPause,
    onMenu,
    enabled = true,
  } = config;

  const tvEventHandler = useRef<TVEventHandlerMock | null>(null);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') {
      return;
    }

    // TV Event Handler for Android TV and Apple TV (mock for now)
    tvEventHandler.current = new TVEventHandlerMock();
    
    const subscription = tvEventHandler.current.enable(undefined, (component: any, evt: any) => {
      const { eventType, eventKeyAction } = evt;

      // Handle key press events
      if (eventKeyAction === 1) {
        switch (eventType) {
          case 'up':
            onUp?.();
            break;
          case 'down':
            onDown?.();
            break;
          case 'left':
            onLeft?.();
            break;
          case 'right':
            onRight?.();
            break;
          case 'select':
            onSelect?.();
            break;
          case 'playPause':
            onPlayPause?.();
            break;
          case 'menu':
            onMenu?.();
            break;
          case 'longSelect':
            onLongSelect?.();
            break;
          case 'focus':
            onFocus?.();
            break;
          case 'blur':
            onBlur?.();
            break;
        }
      }
    });

    return () => {
      if (tvEventHandler.current) {
        tvEventHandler.current.disable();
      }
    };
  }, [
    enabled,
    onFocus,
    onBlur,
    onSelect,
    onLongSelect,
    onUp,
    onDown,
    onLeft,
    onRight,
    onPlayPause,
    onMenu,
  ]);

  return {
    isTVPlatform: Platform.isTV,
  };
};

/**
 * Hook for keyboard navigation (web/desktop)
 * Provides similar navigation experience to TV remotes
 */
export const useKeyboardNavigation = (config: TVNavigationConfig) => {
  const {
    onSelect,
    onUp,
    onDown,
    onLeft,
    onRight,
    onPlayPause,
    onMenu,
    enabled = true,
  } = config;

  useEffect(() => {
    if (!enabled || Platform.OS !== 'web') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onDown?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onRight?.();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect?.();
          break;
        case 'Escape':
          event.preventDefault();
          onMenu?.();
          break;
        case 'p':
        case 'k':
          event.preventDefault();
          onPlayPause?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onSelect, onUp, onDown, onLeft, onRight, onPlayPause, onMenu]);
};

/**
 * Combined hook for all platforms
 */
export const useUniversalNavigation = (config: TVNavigationConfig) => {
  useTVNavigation(config);
  useKeyboardNavigation(config);

  return {
    isTVPlatform: Platform.isTV,
    isWeb: Platform.OS === 'web',
  };
};

/**
 * Focus manager for spatial navigation
 * Tracks focusable elements and handles focus movement
 */
export class FocusManager {
  private focusableElements: Map<string, FocusableElement> = new Map();
  private currentFocusId: string | null = null;

  registerElement(id: string, element: FocusableElement) {
    this.focusableElements.set(id, element);
  }

  unregisterElement(id: string) {
    this.focusableElements.delete(id);
    if (this.currentFocusId === id) {
      this.currentFocusId = null;
    }
  }

  setFocus(id: string) {
    const previousElement = this.currentFocusId
      ? this.focusableElements.get(this.currentFocusId)
      : null;
    
    if (previousElement) {
      previousElement.onBlur?.();
    }

    const element = this.focusableElements.get(id);
    if (element) {
      this.currentFocusId = id;
      element.onFocus?.();
    }
  }

  getCurrentFocus() {
    return this.currentFocusId;
  }

  moveFocus(direction: Direction) {
    if (!this.currentFocusId) {
      // Focus first element if nothing is focused
      const firstId = Array.from(this.focusableElements.keys())[0];
      if (firstId) {
        this.setFocus(firstId);
      }
      return;
    }

    const currentElement = this.focusableElements.get(this.currentFocusId);
    if (!currentElement) return;

    // Find next focusable element in the given direction
    const nextElement = this.findNextElement(currentElement, direction);
    if (nextElement) {
      this.setFocus(nextElement.id);
    }
  }

  private findNextElement(
    current: FocusableElement,
    direction: Direction
  ): FocusableElement | null {
    const elements = Array.from(this.focusableElements.values());
    let bestMatch: FocusableElement | null = null;
    let bestDistance = Infinity;

    for (const element of elements) {
      if (element.id === current.id) continue;

      const distance = this.calculateDistance(current, element, direction);
      if (distance !== null && distance < bestDistance) {
        bestDistance = distance;
        bestMatch = element;
      }
    }

    return bestMatch;
  }

  private calculateDistance(
    from: FocusableElement,
    to: FocusableElement,
    direction: Direction
  ): number | null {
    const { position: fromPos } = from;
    const { position: toPos } = to;

    switch (direction) {
      case 'up':
        if (toPos.y >= fromPos.y) return null;
        break;
      case 'down':
        if (toPos.y <= fromPos.y) return null;
        break;
      case 'left':
        if (toPos.x >= fromPos.x) return null;
        break;
      case 'right':
        if (toPos.x <= fromPos.x) return null;
        break;
    }

    // Calculate Euclidean distance
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

interface FocusableElement {
  id: string;
  position: { x: number; y: number };
  onFocus?: () => void;
  onBlur?: () => void;
}

// Global focus manager instance
export const globalFocusManager = new FocusManager();
