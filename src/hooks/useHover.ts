import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);

  const onHoverIn = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsHovered(true);
    }
  }, []);

  const onHoverOut = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsHovered(false);
    }
  }, []);

  const hoverProps = Platform.OS === 'web'
    ? {
        onMouseEnter: onHoverIn,
        onMouseLeave: onHoverOut,
      }
    : {};

  return { isHovered, hoverProps };
};
