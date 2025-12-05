import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// Smooth fade-in animation (300-500ms default)
export const useFadeIn = (duration = 400, delay = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return fadeAnim;
};

// Combined fade and slide animation for smooth entrance
export const useFadeSlideIn = (duration = 450, delay = 0, slideDistance = 20) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(slideDistance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { fadeAnim, slideAnim };
};

export const useSlideIn = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 50,
  duration = 600,
  delay = 0
) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return [{ translateY: slideAnim }];
      case 'left':
      case 'right':
        return [{ translateX: slideAnim }];
    }
  };

  return { slideAnim, transform: getTransform() };
};

export const useScale = (
  toValue = 1,
  duration = 300,
  delay = 0
) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue,
      friction: 7,
      tension: 40,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return scaleAnim;
};

export const useStagger = (
  count: number,
  duration = 600,
  staggerDelay = 100
) => {
  const animations = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animationsList = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay: index * staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.stagger(staggerDelay, animationsList).start();
  }, []);

  return animations;
};

export const usePulse = (minValue = 0.95, maxValue = 1.05, duration = 1000) => {
  const pulseAnim = useRef(new Animated.Value(minValue)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: maxValue,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: minValue,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, []);

  return pulseAnim;
};

export const useSlideInWithFade = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 50,
  duration = 600,
  delay = 0
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return [{ translateY: slideAnim }];
      case 'left':
      case 'right':
        return [{ translateX: slideAnim }];
    }
  };

  return {
    opacity: fadeAnim,
    transform: getTransform(),
  };
};
