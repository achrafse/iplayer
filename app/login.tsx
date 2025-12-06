import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, typography, spacing, borderRadius, rgba } from '../src/constants/theme';
import { isMobile } from '../src/utils/responsive';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setError('');
    
    if (!username || !password || !serverUrl) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login({ username, password, serverUrl });
      router.replace('/home');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Full-screen cinematic background */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark overlay (65% opacity) - replaces blur effect */}
        <View style={styles.darkOverlay} />
        
        {/* Gradient overlay for bottom fade */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      {/* Centered Login Form */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Logo / Brand */}
            <View style={styles.brandContainer}>
              <Text style={styles.brandName}>iPlayer</Text>
              <Text style={styles.brandTagline}>Premium Streaming</Text>
            </View>

            {/* Form Header */}
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formSubtitle}>
              Enter your credentials to continue
            </Text>

            {/* Input Fields */}
            <View style={styles.inputsContainer}>
              {/* Server URL */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Server URL</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'server' && styles.inputFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. example.server.com"
                    placeholderTextColor={colors.neutral.gray300}
                    value={serverUrl}
                    onChangeText={setServerUrl}
                    onFocus={() => setFocusedInput('server')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              {/* Username */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'username' && styles.inputFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    placeholderTextColor={colors.neutral.gray300}
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'password' && styles.inputFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.neutral.gray300}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* Remember Me */}
            <TouchableOpacity 
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxChecked
              ]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotButton} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By signing in, you agree to our Terms of Service
              </Text>
              <Text style={styles.footerText}>
                Powered by Xtream Codes API
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.black,
  },
  
  // Background
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: rgba(colors.primary.black, 0.65),
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isMobile ? spacing.xl : spacing.huge,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
  },
  
  // Form Card - Semi-transparent dark card
  formCard: {
    width: '100%',
    maxWidth: isMobile ? 360 : 420,
    backgroundColor: rgba(colors.primary.black, 0.75),
    borderRadius: isMobile ? borderRadius.md : borderRadius.lg,
    padding: isMobile ? spacing.lg : (isSmallScreen ? spacing.xxl : spacing.huge),
    // Subtle shadow for depth
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    elevation: 16,
  },
  
  // Brand
  brandContainer: {
    alignItems: 'center',
    marginBottom: isMobile ? spacing.lg : spacing.xxl,
  },
  brandName: {
    fontSize: isMobile ? 28 : 36,
    fontWeight: '700' as any,
    color: colors.primary.accent,
    letterSpacing: typography.letterSpacing.tight,
  },
  brandTagline: {
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    color: colors.neutral.gray200,
    marginTop: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  
  // Form Header
  formTitle: {
    fontSize: isMobile ? 24 : 30,
    fontWeight: '700' as any,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: isMobile ? typography.size.sm : typography.size.base,
    color: colors.neutral.gray200,
    textAlign: 'center',
    marginBottom: isMobile ? spacing.lg : spacing.xxl,
  },
  
  // Inputs
  inputsContainer: {
    gap: isMobile ? spacing.md : spacing.lg,
    marginBottom: isMobile ? spacing.md : spacing.lg,
  },
  inputWrapper: {
    gap: isMobile ? spacing.xs : spacing.sm,
  },
  inputLabel: {
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    fontWeight: '500' as any,
    color: colors.neutral.gray100,
  },
  inputContainer: {
    backgroundColor: rgba(colors.neutral.gray600, 0.8),
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.primary.accent,
    backgroundColor: rgba(colors.neutral.gray600, 1),
  },
  input: {
    color: colors.neutral.white,
    fontSize: isMobile ? typography.size.base : typography.size.md,
    paddingHorizontal: isMobile ? spacing.md : spacing.lg,
    paddingVertical: isMobile ? spacing.md : spacing.base,
    fontWeight: '400' as any,
  },
  
  // Remember Me
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.neutral.gray400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.accent,
    borderColor: colors.primary.accent,
  },
  checkmark: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '700' as any,
  },
  rememberText: {
    fontSize: typography.size.sm,
    color: colors.neutral.gray200,
  },
  
  // Error
  errorContainer: {
    backgroundColor: rgba(colors.semantic.error, 0.15),
    borderRadius: borderRadius.sm,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.semantic.errorLight,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
  
  // Sign In Button - Full width, solid red, 50px height
  signInButton: {
    backgroundColor: colors.primary.accent,
    borderRadius: borderRadius.sm,
    paddingVertical: isMobile ? spacing.md : spacing.base,
    height: isMobile ? 44 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isMobile ? spacing.md : spacing.lg,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: colors.neutral.white,
    fontSize: isMobile ? typography.size.base : typography.size.md,
    fontWeight: '600' as any,
    letterSpacing: typography.letterSpacing.wide,
  },
  
  // Forgot Password
  forgotButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  forgotText: {
    color: colors.neutral.gray200,
    fontSize: typography.size.sm,
  },
  
  // Footer
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    color: rgba(colors.neutral.gray300, 0.6),
    fontSize: typography.size.xs,
    textAlign: 'center',
  },
});
