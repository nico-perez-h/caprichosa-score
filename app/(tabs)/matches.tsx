import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { MatchCard } from '@/components/MatchCard';
import { MatchFilters } from '@/components/MatchFilters';
import { MatchSearchInput } from '@/components/MatchSearchInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';
import { usePredictions } from '../../contexts/PredictionsContext';
import {
  filterMatches,
  type MatchFilter,
} from '../../utils/matchFilters';

export default function MatchesScreen() {
  const { getPrediction } = usePredictions();

  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMatches = filterMatches({
    matches,
    selectedFilter,
    searchTerm,
    hasPrediction: (matchId) => Boolean(getPrediction(matchId)),
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Partidos"
        subtitle="Busca un equipo, filtra los partidos y elige dónde quieres hacer tu predicción."
      />

      <MatchSearchInput value={searchTerm} onChangeText={setSearchTerm} />

      <MatchFilters
        selectedFilter={selectedFilter}
        onChangeFilter={setSelectedFilter}
      />

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            savedPrediction={getPrediction(item.id)}
            onPress={() => router.push(`/match/${item.id}` as never)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No encontramos partidos</Text>
            <Text style={styles.emptyText}>
              Prueba con otro equipo o cambia el filtro seleccionado.
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