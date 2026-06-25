import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { MatchFilter } from '@/utils/matchFilters';

type MatchFiltersProps = {
  selectedFilter: MatchFilter;
  onSelectFilter: (filter: MatchFilter) => void;
};

const filters: {
  label: string;
  value: MatchFilter;
}[] = [
  {
    label: 'Todos',
    value: 'all',
  },
  {
    label: 'Por jugar',
    value: 'upcoming',
  },
  {
    label: 'En vivo',
    value: 'live',
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

export function MatchFilters({
  selectedFilter,
  onSelectFilter,
}: MatchFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.container}
    >
      {filters.map((filter) => {
        const isSelected = selectedFilter === filter.value;

        return (
          <Pressable
            key={filter.value}
            style={[
              styles.filterButton,
              isSelected && styles.selectedFilterButton,
            ]}
            onPress={() => onSelectFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                isSelected && styles.selectedFilterButtonText,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    gap: 10,
    paddingRight: 24,
  },
  filterButton: {
    height: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedFilterButton: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
  },
  selectedFilterButtonText: {
    color: '#FFFFFF',
  },
});