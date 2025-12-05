import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { useUniversalNavigation } from '../../hooks/useTVNavigation';

interface FocusableElementProps {
  children: React.ReactNode;
  onPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onLongPress?: () => void;
  focusable?: boolean;
  style?: ViewStyle;
  focusedStyle?: ViewStyle;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
}

/**
 * FocusableElement - Universal component for TV and mobile navigation
 * Handles focus states, animations, and input from various sources:
 * - Touch (mobile)
 * - D-pad/Remote (TV)
 * - Keyboard (web/desktop)
 * - Game controller
 */
export const FocusableElement: React.FC<FocusableElementProps> = ({
  children,
  onPress,
  onFocus,
  onBlur,
  onLongPress,
  focusable = true,
  style,
  focusedStyle,
  testID,
  accessible = true,
  accessibilityLabel,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Handle TV remote and keyboard navigation
  const { isTVPlatform } = useUniversalNavigation({
    onSelect: () => {
      if (isFocused && onPress && !disabled) {
        onPress();
      }
    },
    onLongSelect: () => {
      if (isFocused && onLongPress && !disabled) {
        onLongPress();
      }
    },
    enabled: focusable && !disabled,
  });

  const handleFocus = () => {
    if (disabled) return;
    
    setIsFocused(true);
    onFocus?.();

    // Animate focus state
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();

    // Animate blur state
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressIn = () => {
    if (disabled) return;
    
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.05 : 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  const handleLongPress = () => {
    if (disabled) return;
    onLongPress?.();
  };

  // Animated focus ring style
  const focusRingStyle = {
    borderColor: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', colors.focus.ring],
    }),
    boxShadow: `0 0 12px rgba(229, 9, 20, 0.8)`,
    elevation: isFocused ? 8 : 0,
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : opacityAnim,
        },
      ]}
    >
      <Animated.View style={isFocused ? focusRingStyle : undefined}>
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled || !focusable}
          activeOpacity={0.9}
          testID={testID}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{
            disabled,
            selected: isFocused,
          }}
          style={[
            styles.container,
            style,
            isFocused && [styles.focused, focusedStyle],
          ]}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
  },
  focused: {
    // Additional focus styles can be added here
  },
});

/**
 * FocusableGrid - Grid layout with spatial navigation
 * Automatically manages focus between grid items
 */
interface FocusableGridProps {
  children: React.ReactNode[];
  columns: number;
  spacing?: number;
  onItemFocus?: (index: number) => void;
  testID?: string;
}

export const FocusableGrid: React.FC<FocusableGridProps> = ({
  children,
  columns,
  spacing: itemSpacing = spacing.md,
  onItemFocus,
  testID,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleNavigation = (direction: 'up' | 'down' | 'left' | 'right') => {
    const currentRow = Math.floor(focusedIndex / columns);
    const currentCol = focusedIndex % columns;
    const totalRows = Math.ceil(children.length / columns);

    let newIndex = focusedIndex;

    switch (direction) {
      case 'up':
        if (currentRow > 0) {
          newIndex = focusedIndex - columns;
        }
        break;
      case 'down':
        if (currentRow < totalRows - 1) {
          newIndex = Math.min(focusedIndex + columns, children.length - 1);
        }
        break;
      case 'left':
        if (currentCol > 0) {
          newIndex = focusedIndex - 1;
        }
        break;
      case 'right':
        if (currentCol < columns - 1 && focusedIndex < children.length - 1) {
          newIndex = focusedIndex + 1;
        }
        break;
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      onItemFocus?.(newIndex);
    }
  };

  useUniversalNavigation({
    onUp: () => handleNavigation('up'),
    onDown: () => handleNavigation('down'),
    onLeft: () => handleNavigation('left'),
    onRight: () => handleNavigation('right'),
  });

  return (
    <View style={gridStyles.container} testID={testID}>
      {children.map((child, index) => {
        const isLastInRow = (index + 1) % columns === 0;
        const isLastRow = Math.floor(index / columns) === Math.floor((children.length - 1) / columns);

        return (
          <View
            key={index}
            style={[
              gridStyles.item,
              {
                width: `${100 / columns}%`,
                paddingRight: isLastInRow ? 0 : itemSpacing,
                paddingBottom: isLastRow ? 0 : itemSpacing,
              },
            ]}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
};

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    // Item styles applied dynamically
  },
});
