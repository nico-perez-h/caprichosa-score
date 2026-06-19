import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { MatchCard } from '@/components/MatchCard';
import {
  MatchFilters,
  type MatchFilter,
} from '@/components/MatchFilters';
import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';
import { usePredictions } from '../../contexts/PredictionsContext';

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

      <MatchFilters
        selectedFilter={selectedFilter}
        onChangeFilter={setSelectedFilter}
      />

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