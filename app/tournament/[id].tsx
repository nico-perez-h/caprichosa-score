import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { matches } from '@/data/matches';
import { tournaments } from '@/data/tournaments';
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

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPrediction } = usePredictions();

  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>('all');

  const tournament = tournaments.find((item) => item.id === id);
  const tournamentMatches = matches.filter((match) => match.tournamentId === id);

  const filteredTournamentMatches = tournamentMatches.filter((match) => {
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

  if (!tournament) {
    return (
      <View style={styles.screen}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <Text style={styles.notFoundTitle}>Torneo no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </Pressable>

      <ScreenHeader title={tournament.name} subtitle={tournament.description} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <StatusBadge label={tournament.status} />
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Partidos disponibles</Text>
          <Text style={styles.summaryValue}>{tournamentMatches.length}</Text>
        </View>

        <Text style={styles.summaryText}>
          Filtra los partidos de este torneo y entra al que quieras predecir.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Partidos</Text>

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
        data={filteredTournamentMatches}
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
              Cambia el filtro para ver otros partidos de este torneo.
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
    paddingTop: 64,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
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
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
});