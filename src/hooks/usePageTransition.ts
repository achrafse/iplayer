import { useEffect, useRef } from 'react';
import { Animated, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';

export const usePageTransition = (duration = 400) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };
};

export const useBackAnimation = (onBack?: () => void) => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (onBack) {
        onBack();
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/home');
      }
    });
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        animateBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return { fadeAnim, animateBack };
};
