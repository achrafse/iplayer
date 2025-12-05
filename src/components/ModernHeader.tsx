import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, rgba } from '../constants/theme';

interface ModernHeaderProps {
  username?: string;
  onLogout: () => void;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  username,
  onLogout,
  onSearch,
  showSearch = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchWidth = useRef(new Animated.Value(44)).current;
  const inputRef = useRef<TextInput>(null);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const toggleSearch = () => {
    if (searchExpanded) {
      // Collapse
      Animated.timing(searchWidth, {
        toValue: 44,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setSearchQuery('');
      onSearch?.('');
      setSearchExpanded(false);
    } else {
      // Expand
      Animated.timing(searchWidth, {
        toValue: 280,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        inputRef.current?.focus();
      });
      setSearchExpanded(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.rightSection}>
          {/* Expandable Search Icon */}
          {showSearch && (
            <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
              <TouchableOpacity 
                style={styles.searchIconButton}
                onPress={toggleSearch}
                activeOpacity={0.7}
              >
                <Text style={styles.searchIcon}>{searchExpanded ? '✕' : '🔍'}</Text>
              </TouchableOpacity>
              {searchExpanded && (
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor={rgba(colors.neutral.white, 0.4)}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  onBlur={() => {
                    if (!searchQuery) toggleSearch();
                  }}
                />
              )}
            </Animated.View>
          )}
          
          {/* Subtle Logout - Text Only */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingTop: spacing.huge,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.giant, // 80px horizontal margins
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: rgba(colors.neutral.white, 0.08),
    borderRadius: borderRadius.md,
    height: 44,
    overflow: 'hidden',
  },
  searchIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: typography.size.lg,
    opacity: 0.8,
  },
  searchInput: {
    flex: 1,
    color: colors.neutral.white,
    fontSize: typography.size.base, // Body: 15px
    fontWeight: '400' as any,
    paddingRight: spacing.md,
  },
  logoutButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  logoutText: {
    color: rgba(colors.neutral.white, 0.5),
    fontSize: typography.size.xs, // Small: 11px
    fontWeight: '500' as any,
    letterSpacing: typography.letterSpacing.caps, // Letter-spacing on all-caps
    textTransform: 'uppercase' as any,
  },
});
