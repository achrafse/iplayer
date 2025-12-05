import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, rgba } from '../constants/theme';

export type ContentType = 'live' | 'movies' | 'series';

interface Tab {
  key: ContentType;
  label: string;
}

interface ModernTabsProps {
  activeTab: ContentType;
  onTabChange: (tab: ContentType) => void;
}

const TABS: Tab[] = [
  { key: 'live', label: 'Live TV' },
  { key: 'movies', label: 'Movies' },
  { key: 'series', label: 'Series' },
];

export const ModernTabs: React.FC<ModernTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsWrapper}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabChange(tab.key)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.giant, // 80px horizontal margins
  },
  tabsWrapper: {
    flexDirection: 'row',
    gap: spacing.xxxl,
  },
  tab: {
    position: 'relative',
    paddingVertical: spacing.sm,
  },
  tabLabel: {
    color: rgba(colors.neutral.white, 0.5),
    fontSize: typography.size.sm, // 13px body text
    fontWeight: '500' as any,
    letterSpacing: typography.letterSpacing.caps, // 2.0 for all-caps
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
});
