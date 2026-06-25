import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchCard } from '@/components/MatchCard';
import { MatchFilters } from '@/components/MatchFilters';
import { MatchSearchInput } from '@/components/MatchSearchInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Prediction } from '../../contexts/PredictionsContext';
import { usePredictions } from '../../contexts/PredictionsContext';
import { getMatches } from '../../services/matchesService';
import type { Match } from '../../types/match';
import { filterMatches, type MatchFilter } from '../../utils/matchFilters';

export default function MatchesScreen() {
  const { predictions } = usePredictions();

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      setIsLoadingMatches(true);

      const loadedMatches = await getMatches();

      setAllMatches(loadedMatches);
      setIsLoadingMatches(false);
    }

    loadMatches();
  }, []);

  function hasPrediction(matchId: string) {
    return Boolean((predictions as Record<string, Prediction>)[matchId]);
  }

  function openMatch(matchId: string) {
    router.push(`/match/${matchId}` as never);
  }

  const filteredMatches = filterMatches({
    matches: allMatches,
    selectedFilter,
    searchTerm,
    hasPrediction,
  });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Partidos"
          subtitle="Busca partidos, revisa estados y realiza tus predicciones."
        />

        <MatchSearchInput
          searchTerm={searchTerm}
          onChangeSearchTerm={setSearchTerm}
        />

        <MatchFilters
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />

        {isLoadingMatches ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Cargando partidos...</Text>
            <Text style={styles.emptyText}>
              Estamos preparando la lista de partidos.
            </Text>
          </View>
        ) : null}

        {!isLoadingMatches && filteredMatches.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No encontramos partidos</Text>
            <Text style={styles.emptyText}>
              Prueba con otro filtro o cambia el texto de búsqueda.
            </Text>
          </View>
        ) : null}

        {!isLoadingMatches
          ? filteredMatches.map((match) => (
              <View key={match.id} style={styles.matchCardWrapper}>
                <MatchCard
                  match={match}
                  savedPrediction={predictions[match.id] ?? null}
                  onPress={() => openMatch(match.id)}
                />
              </View>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  matchCardWrapper: {
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
});