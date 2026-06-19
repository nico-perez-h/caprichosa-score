import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';
import { usePredictions } from '../../contexts/PredictionsContext';

type MatchFilter = 'all' | 'upcoming' | 'finished' | 'predicted';

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

export default function MatchesScreen() {
  const { getPrediction } = usePredictions();

  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>('all');

  const filteredMatches = matches.filter((match) => {
    if (selectedFilter === 'upcoming') {
      return match.status === 'Por jugar';
    }

    if (selectedFilter === 'finished') {
      return match.status === 'Finalizado';
    }

    if (selectedFilter === 'predicted') {
      return Boolean(getPrediction(match.id));
    }

    return true;
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Partidos"
        subtitle="Filtra los partidos y elige dónde quieres hacer tu predicción."
      />

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
              onPress={() => setSelectedFilter(option.value)}
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

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            savedPrediction={getPrediction(item.id)}
            onPress={() => router.push(`/match/${item.id}` as never)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay partidos aquí</Text>
            <Text style={styles.emptyText}>
              Cambia el filtro para ver otros partidos disponibles.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 72,
  },
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
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
});