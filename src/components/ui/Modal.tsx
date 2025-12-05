import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  BackHandler,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, typography, rgba, shadows } from '../../constants/theme';
import { Button } from './Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';
export type ModalPosition = 'center' | 'bottom' | 'top';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackButton?: boolean;
  animationType?: 'fade' | 'slide' | 'none';
  footer?: React.ReactNode;
  scrollable?: boolean;
  testID?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  showCloseButton = true,
  closeOnBackdropPress = true,
  closeOnBackButton = true,
  animationType = 'fade',
  footer,
  scrollable = true,
  testID,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (closeOnBackButton && Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (visible) {
          onClose();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [visible, closeOnBackButton, onClose]);

  const getModalWidth = () => {
    switch (size) {
      case 'sm':
        return Math.min(400, SCREEN_WIDTH * 0.9);
      case 'lg':
        return Math.min(800, SCREEN_WIDTH * 0.9);
      case 'full':
        return SCREEN_WIDTH;
      default: // md
        return Math.min(600, SCREEN_WIDTH * 0.9);
    }
  };

  const getModalHeight = () => {
    if (size === 'full') {
      return SCREEN_HEIGHT;
    }
    return Math.min(SCREEN_HEIGHT * 0.8, SCREEN_HEIGHT - 100);
  };

  const getPositionStyles = () => {
    const width = getModalWidth();
    const height = getModalHeight();

    switch (position) {
      case 'bottom':
        return {
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          width: SCREEN_WIDTH,
          maxHeight: height,
          borderTopLeftRadius: borderRadius.xl,
          borderTopRightRadius: borderRadius.xl,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'top':
        return {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          width: SCREEN_WIDTH,
          maxHeight: height,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: borderRadius.xl,
          borderBottomRightRadius: borderRadius.xl,
        };
      default: // center
        return {
          width,
          maxHeight: height,
          borderRadius: borderRadius.xl,
        };
    }
  };

  const positionStyles = getPositionStyles();

  const Content = scrollable ? ScrollView : View;

  if (!isVisible) return null;

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeOnBackdropPress ? onClose : undefined}
        >
          <Animated.View
            style={[
              styles.backdropOverlay,
              {
                opacity: fadeAnim,
              },
            ]}
          />
        </TouchableOpacity>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            positionStyles,
            position === 'center' && styles.centerModal,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY:
                    position === 'bottom'
                      ? slideAnim
                      : position === 'top'
                      ? Animated.multiply(slideAnim, -1)
                      : 0,
                },
              ],
            },
          ]}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessible
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Body */}
          <Content
            style={[styles.body, !scrollable && { flex: 1 }]}
            contentContainerStyle={scrollable ? styles.scrollContent : undefined}
            showsVerticalScrollIndicator={true}
          >
            {children}
          </Content>

          {/* Footer */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: rgba(colors.primary.darkGray, 0.95),
  },
  modalContainer: {
    backgroundColor: colors.primary.mediumGray,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: rgba(colors.primary.lightGray, 0.3),
  },
  centerModal: {
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: rgba(colors.primary.lightGray, 0.2),
  },
  title: {
    flex: 1,
    color: colors.neutral.white,
    fontSize: typography.size.xxl,
    fontWeight: '700' as any,
    letterSpacing: typography.letterSpacing.normal,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: rgba(colors.neutral.white, 0.1),
  },
  closeButtonText: {
    color: colors.neutral.white,
    fontSize: typography.size.xl,
    fontWeight: '300' as any,
  },
  body: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: rgba(colors.primary.lightGray, 0.2),
  },
});

// Confirmation Modal Component
interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      scrollable={false}
      footer={
        <View style={confirmModalStyles.footer}>
          <Button
            title={cancelText}
            onPress={onClose}
            variant="ghost"
            size="lg"
          />
          <View style={confirmModalStyles.spacing} />
          <Button
            title={confirmText}
            onPress={() => {
              onConfirm();
              onClose();
            }}
            variant={confirmVariant}
            size="lg"
          />
        </View>
      }
    >
      <Text style={confirmModalStyles.message}>{message}</Text>
    </Modal>
  );
};

const confirmModalStyles = StyleSheet.create({
  message: {
    color: colors.neutral.gray100,
    fontSize: typography.size.md,
    lineHeight: typography.size.md * typography.lineHeight.relaxed,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  spacing: {
    width: spacing.md,
  },
});
