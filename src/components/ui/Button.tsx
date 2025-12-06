import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, animations, rgba } from '../../constants/theme';
import { scaledFont, scaleSpacing, getScaledRadius, isTV, getButtonDimensions, getTouchTargetSize } from '../../utils/responsive';
import { getPlatformCapabilities, getPlatformGuidelines } from '../../utils/platform';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  focusable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  testID?: string;
  style?: any;
  showRipple?: boolean; // Android Material ripple effect
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  focusable = true,
  onFocus,
  onBlur,
  testID,
  style,
  showRipple = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  const platformCapabilities = getPlatformCapabilities();
  const platformGuidelines = getPlatformGuidelines();

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: animations.scale.press,
      useNativeDriver: true,
      ...animations.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    const targetScale = isFocused ? platformCapabilities.focusScale : (isHovered ? animations.scale.hover : 1);
    Animated.spring(scaleAnim, {
      toValue: targetScale,
      useNativeDriver: true,
      ...animations.spring.smooth,
    }).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: platformCapabilities.focusScale,
        useNativeDriver: true,
        ...animations.spring.bouncy,
      }),
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: animations.duration.normal,
        useNativeDriver: false,
      }),
    ]).start();
    
    // Start glow animation separately as it's a loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    glowAnim.stopAnimation();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isHovered ? animations.scale.hover : 1,
        useNativeDriver: true,
        ...animations.spring.smooth,
      }),
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: animations.duration.fast,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleMouseEnter = () => {
    if (Platform.OS === 'web' && !isTV) {
      setIsHovered(true);
      if (!isFocused) {
        Animated.spring(scaleAnim, {
          toValue: animations.scale.hover,
          useNativeDriver: true,
          ...animations.spring.smooth,
        }).start();
      }
    }
  };
  
  const handleMouseLeave = () => {
    if (Platform.OS === 'web' && !isTV) {
      setIsHovered(false);
      if (!isFocused) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...animations.spring.smooth,
        }).start();
      }
    }
  };

  const getSizeStyles = () => {
    const dimensions = getButtonDimensions(size);
    return {
      paddingHorizontal: dimensions.paddingHorizontal,
      paddingVertical: dimensions.paddingVertical,
      fontSize: dimensions.fontSize,
      height: dimensions.height,
      minHeight: Math.max(dimensions.height, getTouchTargetSize()),
    };
  };

  const getVariantStyles = () => {
    const baseStyle = {
      backgroundColor: colors.primary.accent,
      borderColor: 'transparent',
      textColor: colors.neutral.white,
      gradient: null as string[] | null,
      useGradient: false,
    };

    switch (variant) {
      case 'primary':
        // Solid red background, white text - Netflix style
        return {
          backgroundColor: colors.primary.accent,
          borderColor: 'transparent',
          textColor: colors.neutral.white,
          gradient: null,
          useGradient: false,
        };
      case 'secondary':
        // Transparent with white border - "More Info" style
        return {
          backgroundColor: 'transparent',
          borderColor: rgba(colors.neutral.white, 0.7),
          textColor: colors.neutral.white,
          gradient: null,
          useGradient: false,
        };
      case 'outline':
        // Transparent with white border
        return {
          backgroundColor: 'transparent',
          borderColor: colors.neutral.white,
          textColor: colors.neutral.white,
          gradient: null,
          useGradient: false,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: colors.neutral.white,
          gradient: null,
          useGradient: false,
        };
      case 'danger':
        return {
          backgroundColor: colors.semantic.error,
          borderColor: 'transparent',
          textColor: colors.neutral.white,
          gradient: null,
          useGradient: false,
        };
      case 'glass':
        // Subtle glass effect
        return {
          backgroundColor: rgba(colors.neutral.white, 0.1),
          borderColor: rgba(colors.neutral.white, 0.2),
          textColor: colors.neutral.white,
          gradient: null,
          useGradient: false,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: colors.neutral.white,
          gradient: colors.gradients.accent,
          useGradient: true,
        };
      default:
        return baseStyle;
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  const focusStyle = {
    borderColor: isFocused ? colors.neutral.white : variantStyles.borderColor,
    // Minimal shadow on focus - CSS-style boxShadow for web
    boxShadow: isFocused ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none',
    elevation: isFocused ? 4 : (isHovered ? 2 : 0),
  };
  
  const buttonStyle = [
    styles.button,
    {
      borderColor: variantStyles.borderColor,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      minHeight: sizeStyles.minHeight,
      opacity: isDisabled ? 0.5 : 1,
    },
    focusStyle,
    fullWidth && styles.fullWidth,
    style,
  ];

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
                fontWeight: '700',
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </>
  );

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      {variantStyles.useGradient && variantStyles.gradient ? (
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onFocus={handleFocus}
          onBlur={handleBlur}
          // @ts-ignore - Web-only props
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={isDisabled}
          activeOpacity={0.85}
          testID={testID}
          accessible={true}
          accessibilityLabel={title}
          accessibilityRole="button"
          accessibilityState={{
            disabled: isDisabled,
            busy: loading,
          }}
          style={buttonStyle}
        >
          <LinearGradient
            colors={variantStyles.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onFocus={handleFocus}
          onBlur={handleBlur}
          // @ts-ignore - Web-only props
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={isDisabled}
          activeOpacity={0.85}
          testID={testID}
          accessible={true}
          accessibilityLabel={title}
          accessibilityRole="button"
          accessibilityState={{
            disabled: isDisabled,
            busy: loading,
          }}
          style={[
            buttonStyle,
            { backgroundColor: variantStyles.backgroundColor },
          ]}
        >
          {renderContent()}
        </TouchableOpacity>
      )}
      
      {/* Focus glow effect for TV */}
      {isFocused && isTV && (
        <Animated.View
          style={[
            styles.focusGlow,
            {
              opacity: glowAnim,
              borderRadius: getScaledRadius(borderRadius.md),
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: isTV ? borderRadius.tv.button : borderRadius.button, // Minimal 4-6px rounded corners
    borderWidth: 2,
    overflow: 'hidden',
    // Removed heavy shadows for modern flat design
  },
  fullWidth: {
    width: '100%',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: typography.letterSpacing.wide,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    fontWeight: '600' as any,
  },
  iconLeft: {
    marginRight: scaleSpacing(spacing.sm),
  },
  iconRight: {
    marginLeft: scaleSpacing(spacing.sm),
  },
  focusGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderWidth: 2,
    borderRadius: isTV ? borderRadius.tv.button + 3 : borderRadius.button + 3,
    borderColor: colors.focus.ring,
    pointerEvents: 'none',
  },
});
