import React, { useState, useCallback } from 'react';
import {
  Image,
  ImageProps,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/theme';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  placeholder?: any;
  showLoader?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  uri,
  placeholder,
  showLoader = true,
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

  if (!uri || error) {
    return (
      <Image
        source={placeholder || require('../../assets/icon.png')}
        style={style}
        {...props}
      />
    );
  }

  return (
    <View style={style}>
      <Image
        source={{ uri }}
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
});
