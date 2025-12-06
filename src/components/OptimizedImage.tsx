import React, { useState, useCallback } from 'react';
import {
  Image,
  ImageProps,
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { colors } from '../constants/theme';
import { sanitizeImageUrl } from '../utils/imageUrls';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  placeholder?: any;
  showLoader?: boolean;
  placeholderIcon?: string;
  showPlaceholder?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  uri,
  placeholder,
  showLoader = true,
  placeholderIcon = '🎬',
  showPlaceholder = true,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  // Sanitize the URL
  const sanitizedUri = sanitizeImageUrl(uri);

  if (!sanitizedUri || error) {
    // If showPlaceholder is false, just show empty container
    if (!showPlaceholder) {
      return <View style={[style, styles.placeholderContainer]} />;
    }
    // If a custom placeholder image is provided, use it
    if (placeholder) {
      return (
        <View style={[style, styles.placeholderContainer]}>
          <Image
            source={placeholder}
            style={styles.placeholderImage}
            resizeMode="contain"
            {...props}
          />
        </View>
      );
    }
    // Otherwise use the emoji placeholder (clapperboard)
    return (
      <View style={[style, styles.placeholderContainer]}>
        <Text style={styles.placeholderIcon}>{placeholderIcon}</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={{ uri: sanitizedUri }}
        style={StyleSheet.absoluteFillObject}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
      {loading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={colors.primary.accent} />
        </View>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.uri === nextProps.uri;
});

const styles = StyleSheet.create({
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.darkGray,
  },
  placeholderContainer: {
    backgroundColor: colors.primary.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '50%',
    height: '50%',
    opacity: 0.3,
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
});
