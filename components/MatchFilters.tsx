import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MatchFilter } from '../utils/matchFilters';

type FilterOption = {
  label: string;
  value: MatchFilter;
};

const filterOptions: FilterOption[] = [
  {
    label: 'Todos',
    value: 'all',
  },
  {
    label: 'Por jugar',
    value: 'upcoming',
  },
  {
    label: 'Finalizados',
    value: 'finished',
  },
  {
    label: 'Con predicción',
    value: 'predicted',
  },
];

type MatchFiltersProps = {
  selectedFilter: MatchFilter;
  onChangeFilter: (filter: MatchFilter) => void;
};

export function MatchFilters({
  selectedFilter,
  onChangeFilter,
}: MatchFiltersProps) {
  return (
    <View style={styles.filtersRow}>
      {filterOptions.map((option) => {
        const isSelected = selectedFilter === option.value;

        return (
          <Pressable
            key={option.value}
            style={[
              styles.filterButton,
              isSelected && styles.filterButtonSelected,
            ]}
            onPress={() => onChangeFilter(option.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                isSelected && styles.filterButtonTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterButtonSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
  },
  filterButtonTextSelected: {
    color: '#FFFFFF',
  },
});