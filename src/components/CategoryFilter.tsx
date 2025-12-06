import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, rgba } from '../constants/theme';
import { isMobile, isTablet } from '../utils/responsive';

interface Category {
  category_id: string;
  category_name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  showFavoritesFilter?: boolean;
  showFavoritesOnly?: boolean;
  onToggleFavorites?: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  showFavoritesFilter,
  showFavoritesOnly,
  onToggleFavorites,
}) => {
  const allCategories = [
    { category_id: '', category_name: 'All' },
    ...categories,
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Chips */}
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category.category_id || 
                           (!selectedCategory && category.category_id === '');
          return (
            <TouchableOpacity
              key={category.category_id || 'all'}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onCategorySelect(category.category_id || null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {category.category_name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Favorites Filter - Inline to avoid text node issues on web */}
        {showFavoritesFilter && onToggleFavorites && (
          <>
            <View style={styles.separator} />
            <TouchableOpacity
              style={[styles.favoritesChip, showFavoritesOnly && styles.favoritesChipActive]}
              onPress={onToggleFavorites}
              activeOpacity={0.8}
            >
              <Text style={styles.favoriteIcon}>{showFavoritesOnly ? '♥' : '♡'}</Text>
              <Text style={[styles.chipText, showFavoritesOnly && styles.favoritesTextActive]}>{'Favorites'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: isMobile ? spacing.sm : spacing.md,
  },
  scrollContent: {
    paddingHorizontal: isMobile ? spacing.md : spacing.giant,
    gap: isMobile ? spacing.md : spacing.xl,
  },
  chip: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    // Text-only style, no background
  },
  chipText: {
    color: rgba(colors.neutral.gray100, 0.5),
    fontSize: isMobile ? typography.size.xs : typography.size.sm,
    fontWeight: '500' as any,
    letterSpacing: isMobile ? 0.5 : typography.letterSpacing.wide,
  },
  chipTextActive: {
    color: colors.neutral.white,
    fontWeight: '600' as any,
  },
  separator: {
    width: 1,
    height: isMobile ? 12 : 14,
    backgroundColor: rgba(colors.neutral.white, 0.12),
    marginHorizontal: isMobile ? spacing.sm : spacing.md,
  },
  favoritesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  favoritesChipActive: {
    // Text-only style, no background
  },
  favoriteIcon: {
    fontSize: isMobile ? typography.size.sm : typography.size.base,
  },
  favoritesTextActive: {
    color: colors.primary.accent,
  },
});
