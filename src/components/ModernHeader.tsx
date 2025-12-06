import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, borderRadius, rgba } from '../constants/theme';
import { isMobile, isTablet, isTV } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ContentType = 'live' | 'movies' | 'series';

interface Tab {
  key: ContentType;
  label: string;
}

const TABS: Tab[] = [
  { key: 'live', label: 'Live TV' },
  { key: 'movies', label: 'Movies' },
  { key: 'series', label: 'Series' },
];

interface ModernHeaderProps {
  username?: string;
  onLogout: () => void;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  activeTab?: ContentType;
  onTabChange?: (tab: ContentType) => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  username,
  onLogout,
  onSearch,
  showSearch = true,
  activeTab = 'live',
  onTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchCollapsedWidth = isMobile ? 36 : 44;
  const searchExpandedWidth = isMobile ? SCREEN_WIDTH - 120 : 280;
  const searchWidth = useRef(new Animated.Value(searchCollapsedWidth)).current;
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
        toValue: searchCollapsedWidth,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setSearchQuery('');
      onSearch?.('');
      setSearchExpanded(false);
    } else {
      // Expand
      Animated.timing(searchWidth, {
        toValue: searchExpandedWidth,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        inputRef.current?.focus();
      });
      setSearchExpanded(true);
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'live':
        return 'Search for channels...';
      case 'movies':
        return 'Search for movies...';
      case 'series':
        return 'Search for series...';
      default:
        return 'Search...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Left Section - Navigation Tabs */}
        <View style={styles.leftSection}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => onTabChange?.(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Section - Search & Logout */}
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
                  placeholder={getSearchPlaceholder()}
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
    paddingTop: isMobile ? spacing.lg : spacing.huge,
    paddingBottom: isMobile ? spacing.sm : spacing.md,
    paddingHorizontal: isMobile ? spacing.md : spacing.giant,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? spacing.md : spacing.xxxl,
  },
  tab: {
    position: 'relative',
    paddingVertical: spacing.sm,
  },
  tabLabel: {
    color: rgba(colors.neutral.white, 0.5),
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    fontWeight: '500' as any,
    letterSpacing: isMobile ? 1 : typography.letterSpacing.caps,
    textTransform: 'uppercase' as any,
  },
  tabLabelActive: {
    color: colors.neutral.white,
    fontWeight: '600' as any,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary.accent,
    borderRadius: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? spacing.sm : spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: rgba(colors.neutral.gray600, 0.8),
    borderRadius: borderRadius.sm,
    height: isMobile ? 36 : 44,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: rgba(colors.neutral.white, 0.1),
  },
  searchIconButton: {
    width: isMobile ? 36 : 44,
    height: isMobile ? 36 : 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: isMobile ? typography.size.sm : typography.size.base,
    color: colors.neutral.gray200,
  },
  searchInput: {
    flex: 1,
    color: colors.neutral.white,
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    fontWeight: '400' as any,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
  } as any,
  logoutButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: isMobile ? spacing.sm : spacing.md,
  },
  logoutText: {
    color: rgba(colors.neutral.white, 0.5),
    fontSize: typography.size.xs,
    fontWeight: '500' as any,
    letterSpacing: isMobile ? 0.5 : typography.letterSpacing.caps,
    textTransform: 'uppercase' as any,
  },
});
